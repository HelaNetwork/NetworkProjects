"""AAP — Chat Handler: session memory + LLM routing."""
from __future__ import annotations
import uuid, time, logging
from typing import Optional

logger = logging.getLogger(__name__)

MAX_HISTORY = 20  # messages per session


class ChatSession:
    def __init__(self, session_id: str, agent_id: str = "gemini"):
        self.session_id  = session_id
        self.agent_id    = agent_id
        self.messages    = []          # list of {"role": "user"|"assistant", "content": str}
        self.created_at  = time.time()
        self.last_active = time.time()

    def add(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
        if len(self.messages) > MAX_HISTORY:
            self.messages = self.messages[-MAX_HISTORY:]
        self.last_active = time.time()


class ChatHandler:
    """Manages chat sessions and routes messages to the multi-agent orchestrator."""

    def __init__(self):
        self._sessions: dict[str, ChatSession] = {}
        from agent.multi_agent_orchestrator import AgentOrchestrator
        self._orchestrator = AgentOrchestrator()

    def create_session(self, agent_id: str = "gemini") -> str:
        sid = str(uuid.uuid4())[:12]
        self._sessions[sid] = ChatSession(sid, agent_id)
        return sid

    def chat(
        self,
        message: str,
        session_id: Optional[str] = None,
        agent_id: str = "gemini",
        context: dict = None,
    ) -> dict:
        # Get or create session
        if session_id and session_id in self._sessions:
            session = self._sessions[session_id]
            if agent_id and agent_id != session.agent_id:
                session.agent_id = agent_id   # allow mid-session switch
        else:
            session_id = self.create_session(agent_id)
            session    = self._sessions[session_id]

        session.add("user", message)

        try:
            reply = self._orchestrator.route(
                session.agent_id,
                session.messages,
                context or {},
            )
        except Exception as e:
            logger.error(f"ChatHandler error: {e}")
            reply = "I encountered an error. Please try again."

        session.add("assistant", reply)

        return {
            "session_id": session_id,
            "agent_id":   session.agent_id,
            "reply":      reply,
            "timestamp":  time.time(),
        }

    def get_history(self, session_id: str) -> list[dict]:
        s = self._sessions.get(session_id)
        return s.messages if s else []

    def clear_session(self, session_id: str):
        self._sessions.pop(session_id, None)

    def purge_old_sessions(self, max_age_seconds: int = 3600):
        now = time.time()
        stale = [k for k, v in self._sessions.items() if now - v.last_active > max_age_seconds]
        for k in stale:
            del self._sessions[k]
