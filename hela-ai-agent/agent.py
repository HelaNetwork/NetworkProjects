"""
agent.py — LangChain agent logic for the HeLa AI Information Agent.

Orchestrates Google Gemini with a set of custom tools to answer
questions about HeLa Labs using live data from docs, web search,
and the block explorer.
"""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_core.tools import StructuredTool
from langgraph.prebuilt import create_react_agent

from tools import hela_docs_scraper, hela_web_search, hela_explorer


# ---------------------------------------------------------------------------
# System prompt — gives the agent its persona, instructions and boundaries
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are the **HeLa AI Agent** — an expert assistant specialised in 
everything related to HeLa Labs and the HeLa blockchain ecosystem.

Your job is to answer the user's questions accurately using ONLY information 
retrieved from your tools.  Never fabricate facts.

## Behaviour Rules
1. **Always use tools first.** Before answering, call the most appropriate 
   tool to fetch real-time data.  If the first tool returns insufficient 
   information, try a different tool.
2. **Cite your sources.** At the end of every answer, include a small 
   "Sources" section listing the URLs or tool names you used.
3. **Stay on topic.** If the user asks about something completely unrelated 
   to HeLa Labs, politely redirect them.
4. **Be concise and professional.** Use short paragraphs, bullet points, 
   and markdown formatting to make answers easy to read.
5. **If no data is found**, say so honestly.  Never hallucinate information.
6. **Format responses nicely** with headers, bullet points, and emphasis 
   where appropriate.  Avoid code blocks unless the user asks for code.

## Tool Selection Guide
- **hela_docs_scraper** — Use for questions about HeLa's features, 
  architecture, tokenomics, HLUSD, consensus, wallets, nodes, roadmap, 
  grants, and other topics covered in official docs.
- **hela_web_search** — Use for recent news, announcements, partnerships, 
  price data, social media updates, or anything time-sensitive.
- **hela_explorer** — Use for on-chain data: blocks, transactions, 
  validators, network statistics.

## About HeLa Labs (reference context)
HeLa is a next-generation Layer-1 blockchain combining personalized AI 
with native yields. Key features: EVM compatibility, modular architecture, 
HLUSD fiat-backed stablecoin as gas fee, Decentralized Identity (DID), 
Tendermint BFT consensus.  Explorer: helascan.io. Docs: docs.helalabs.com.
"""


def build_agent(gemini_api_key: str):
    """
    Construct and return a LangGraph ReAct agent powered by Google Gemini.

    Args:
        gemini_api_key: The user's Google Gemini API key.

    Returns:
        A compiled LangGraph agent ready to be invoked.
    """
    # Initialise the Gemini LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview",
        google_api_key=gemini_api_key,
        temperature=0.3,
        max_output_tokens=4096,
    )

    # Prepare the tool list — no API keys needed for any tool now!
    tools = [
        hela_docs_scraper,      # No key needed
        hela_web_search,        # DuckDuckGo — free, no key needed
        hela_explorer,          # Explorer API + DuckDuckGo fallback
    ]

    # Build a ReAct agent via LangGraph
    agent = create_react_agent(
        model=llm,
        tools=tools,
        prompt=SYSTEM_PROMPT,
    )

    return agent


def run_agent(agent, user_message: str, chat_history: list[dict]) -> dict:
    """
    Invoke the agent with a user message and existing chat history.

    Args:
        agent:        The compiled LangGraph agent.
        user_message: The latest message from the user.
        chat_history: A list of prior messages in {"role": ..., "content": ...} format.

    Returns:
        A dict with:
          - "response": The agent's final text answer.
          - "sources":  A list of tool names / sources used.
    """
    # Convert chat history into LangChain message objects
    messages = []
    for msg in chat_history:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    # Add the new user message
    messages.append(HumanMessage(content=user_message))

    try:
        # Stream the agent's execution and collect the final state
        result = agent.invoke({"messages": messages})

        # Extract the final AI response
        final_messages = result.get("messages", [])
        response_text = ""
        sources_used = set()

        for msg in final_messages:
            # Collect tool names that were called
            if hasattr(msg, "name") and msg.name:
                sources_used.add(msg.name)
            # The last AIMessage is the final answer
            if isinstance(msg, AIMessage):
                extracted_text = ""
                if isinstance(msg.content, list):
                    # Gemini sometimes returns a list of blocks like [{'type': 'text', 'text': '...'}]
                    extracted_text = "".join(
                        block.get("text", "") for block in msg.content if isinstance(block, dict) and block.get("type") == "text"
                    )
                elif isinstance(msg.content, str):
                    extracted_text = msg.content

                if extracted_text:
                    if not hasattr(msg, "tool_calls") or not msg.tool_calls:
                        response_text = extracted_text
                    else:
                        # If the message has both content and tool_calls, check if it's the last one
                        if msg == final_messages[-1]:
                            response_text = extracted_text

        if not response_text:
            response_text = "I wasn't able to find an answer. Please try rephrasing your question."

        return {
            "response": response_text,
            "sources": list(sources_used),
        }

    except Exception as exc:
        error_msg = str(exc)

        # Provide user-friendly error messages
        if "authentication" in error_msg.lower() or "api key" in error_msg.lower() or "invalid" in error_msg.lower():
            return {
                "response": "⚠️ **Authentication Error** — Your Gemini API key appears to be invalid. Please check your key in the sidebar and try again.",
                "sources": [],
            }
        elif "rate" in error_msg.lower() and "limit" in error_msg.lower():
            return {
                "response": "⚠️ **Rate Limit Reached** — You've hit the API rate limit. Please wait a moment and try again.",
                "sources": [],
            }
        elif "quota" in error_msg.lower():
            return {
                "response": "⚠️ **Quota Exceeded** — Your Gemini API quota has been exceeded. The free tier allows generous usage, but you may need to wait or check your Google AI Studio dashboard.",
                "sources": [],
            }
        else:
            return {
                "response": f"⚠️ **Agent Error** — Something went wrong while processing your request.\n\n`{error_msg}`\n\nPlease try again or rephrase your question.",
                "sources": [],
            }
