"""
app.py — Streamlit frontend for the HeLa AI Information Agent.

A premium dark-themed chat interface with custom CSS styling,
HeLa branding, sidebar API key management, and streaming chat.
"""

import streamlit as st
from agent import build_agent, run_agent

# ---------------------------------------------------------------------------
# Page configuration — must be the FIRST Streamlit call
# ---------------------------------------------------------------------------
st.set_page_config(
    page_title="HeLa AI Agent",
    page_icon="🔗",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ---------------------------------------------------------------------------
# Custom CSS — overrides all default Streamlit styling for a premium look
# ---------------------------------------------------------------------------
CUSTOM_CSS = """
<style>
    /* ── Import Google Fonts ── */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    /* ── Root variables ── */
    :root {
        --hela-teal: #1D9E75;
        --hela-teal-light: #24C791;
        --hela-teal-dark: #167A5B;
        --hela-teal-glow: rgba(29, 158, 117, 0.35);
        --bg-primary: #0B0F19;
        --bg-secondary: #111827;
        --bg-card: #161E2E;
        --bg-input: #1C2537;
        --text-primary: #F0F4F8;
        --text-secondary: #94A3B8;
        --text-muted: #64748B;
        --border-color: #1E293B;
        --border-glow: rgba(29, 158, 117, 0.25);
        --danger: #EF4444;
        --warning: #F59E0B;
        --radius: 12px;
    }

    /* ── Global resets ── */
    html, body, [data-testid="stAppViewContainer"], [data-testid="stApp"] {
        background-color: var(--bg-primary) !important;
        color: var(--text-primary) !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif !important;
    }

    /* ── Hide default Streamlit chrome ── */
    #MainMenu, footer, [data-testid="stToolbar"],
    header[data-testid="stHeader"] {
        display: none !important;
    }
    .stDeployButton { display: none !important; }

    /* ── Sidebar ── */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0D1320 0%, #111827 100%) !important;
        border-right: 1px solid var(--border-color) !important;
    }
    [data-testid="stSidebar"] * {
        color: var(--text-primary) !important;
        font-family: 'Inter', sans-serif !important;
    }
    [data-testid="stSidebar"] .stTextInput > div > div > input {
        background-color: var(--bg-input) !important;
        border: 1px solid var(--border-color) !important;
        border-radius: 8px !important;
        color: var(--text-primary) !important;
        padding: 10px 14px !important;
        font-size: 14px !important;
        transition: border-color 0.3s ease, box-shadow 0.3s ease !important;
    }
    [data-testid="stSidebar"] .stTextInput > div > div > input:focus {
        border-color: var(--hela-teal) !important;
        box-shadow: 0 0 0 3px var(--hela-teal-glow) !important;
    }
    [data-testid="stSidebar"] .stTextInput label {
        font-weight: 500 !important;
        font-size: 13px !important;
        letter-spacing: 0.02em !important;
        color: var(--text-secondary) !important;
        text-transform: uppercase !important;
    }

    /* ── Main content area ── */
    .main .block-container {
        padding-top: 2rem !important;
        padding-bottom: 2rem !important;
        max-width: 900px !important;
    }

    /* ── Custom header with glow ── */
    .hela-header {
        text-align: center;
        padding: 28px 0 12px 0;
        margin-bottom: 8px;
    }
    .hela-header h1 {
        font-family: 'Inter', sans-serif;
        font-size: 2.4rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        background: linear-gradient(135deg, var(--hela-teal-light) 0%, var(--hela-teal) 50%, #15B87A 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: none;
        filter: drop-shadow(0 0 30px var(--hela-teal-glow));
        margin: 0;
    }
    .hela-subtitle {
        font-size: 0.95rem;
        color: var(--text-muted);
        margin-top: 6px;
        font-weight: 400;
        letter-spacing: 0.01em;
    }

    /* ── Chat container ── */
    .chat-container {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 12px 0;
    }

    /* ── Chat bubbles ── */
    .chat-message {
        display: flex;
        gap: 12px;
        max-width: 85%;
        animation: fadeSlideIn 0.35s ease-out;
    }
    .chat-message.user {
        align-self: flex-end;
        flex-direction: row-reverse;
    }
    .chat-message.assistant {
        align-self: flex-start;
    }
    .chat-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
        font-weight: 700;
    }
    .chat-avatar.user-avatar {
        background: linear-gradient(135deg, #3B82F6, #6366F1);
    }
    .chat-avatar.agent-avatar {
        background: linear-gradient(135deg, var(--hela-teal-dark), var(--hela-teal-light));
    }
    .chat-bubble {
        padding: 14px 18px;
        border-radius: var(--radius);
        line-height: 1.65;
        font-size: 14.5px;
        font-weight: 400;
    }
    .chat-bubble.user-bubble {
        background: linear-gradient(135deg, #1E3A5F, #1A2E4A);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-top-right-radius: 4px;
        color: var(--text-primary);
    }
    .chat-bubble.agent-bubble {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-top-left-radius: 4px;
        color: var(--text-primary);
    }

    /* ── Source badge ── */
    .source-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        margin-top: 8px;
        padding: 4px 10px;
        background: rgba(29, 158, 117, 0.1);
        border: 1px solid rgba(29, 158, 117, 0.25);
        border-radius: 20px;
        font-size: 11px;
        color: var(--hela-teal-light);
        font-weight: 500;
    }
    .source-badge::before {
        content: "●";
        font-size: 6px;
    }

    /* ── Loading spinner ── */
    .loading-container {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius);
        max-width: 280px;
        animation: pulse 1.8s ease-in-out infinite;
    }
    .loading-dots {
        display: flex;
        gap: 5px;
    }
    .loading-dots span {
        width: 8px;
        height: 8px;
        background: var(--hela-teal);
        border-radius: 50%;
        animation: dotBounce 1.4s ease-in-out infinite;
    }
    .loading-dots span:nth-child(2) { animation-delay: 0.15s; }
    .loading-dots span:nth-child(3) { animation-delay: 0.3s; }
    .loading-text {
        font-size: 13px;
        color: var(--text-secondary);
        font-weight: 500;
    }

    /* ── Chat input styling ── */
    [data-testid="stChatInput"] {
        background-color: var(--bg-secondary) !important;
        border-top: 1px solid var(--border-color) !important;
    }
    [data-testid="stChatInput"] textarea {
        background-color: var(--bg-input) !important;
        border: 1px solid var(--border-color) !important;
        border-radius: 10px !important;
        color: var(--text-primary) !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 14px !important;
        padding: 12px 16px !important;
    }
    [data-testid="stChatInput"] textarea:focus {
        border-color: var(--hela-teal) !important;
        box-shadow: 0 0 0 3px var(--hela-teal-glow) !important;
    }
    [data-testid="stChatInput"] button {
        background-color: var(--hela-teal) !important;
        color: white !important;
        border-radius: 8px !important;
        border: none !important;
        transition: background-color 0.2s ease !important;
    }
    [data-testid="stChatInput"] button:hover {
        background-color: var(--hela-teal-light) !important;
    }

    /* ── Sidebar branding ── */
    .sidebar-brand {
        text-align: center;
        padding: 20px 0 24px 0;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 24px;
    }
    .sidebar-logo {
        width: 56px;
        height: 56px;
        background: linear-gradient(135deg, var(--hela-teal-dark), var(--hela-teal-light));
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px auto;
        font-size: 26px;
        font-weight: 800;
        color: white;
        box-shadow: 0 4px 20px var(--hela-teal-glow);
    }
    .sidebar-title {
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0;
    }
    .sidebar-version {
        font-size: 11px;
        color: var(--text-muted);
        margin-top: 4px;
        letter-spacing: 0.05em;
    }

    /* ── Status indicator ── */
    .status-connected {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: rgba(29, 158, 117, 0.08);
        border: 1px solid rgba(29, 158, 117, 0.2);
        border-radius: 8px;
        margin-top: 16px;
        font-size: 12px;
        color: var(--hela-teal-light);
        font-weight: 500;
    }
    .status-dot {
        width: 7px;
        height: 7px;
        background: var(--hela-teal-light);
        border-radius: 50%;
        animation: pulse-dot 2s ease-in-out infinite;
    }
    .status-disconnected {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 12px;
        background: rgba(239, 68, 68, 0.08);
        border: 1px solid rgba(239, 68, 68, 0.2);
        border-radius: 8px;
        margin-top: 16px;
        font-size: 12px;
        color: #F87171;
        font-weight: 500;
    }

    /* ── Welcome card ── */
    .welcome-card {
        background: linear-gradient(135deg, var(--bg-card) 0%, rgba(29, 158, 117, 0.05) 100%);
        border: 1px solid var(--border-color);
        border-radius: 16px;
        padding: 32px;
        text-align: center;
        margin: 24px 0;
    }
    .welcome-card h3 {
        color: var(--text-primary);
        font-size: 1.3rem;
        font-weight: 700;
        margin-bottom: 8px;
    }
    .welcome-card p {
        color: var(--text-secondary);
        font-size: 0.9rem;
        line-height: 1.6;
        margin-bottom: 20px;
    }
    .example-prompts {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
    }
    .example-chip {
        display: inline-block;
        padding: 8px 16px;
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: 20px;
        font-size: 13px;
        color: var(--text-secondary);
        cursor: default;
        transition: all 0.2s ease;
    }
    .example-chip:hover {
        border-color: var(--hela-teal);
        color: var(--hela-teal-light);
        background: rgba(29, 158, 117, 0.06);
    }

    /* ── Divider ── */
    .sidebar-divider {
        height: 1px;
        background: var(--border-color);
        margin: 20px 0;
    }

    /* ── Keyframes ── */
    @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes dotBounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
    }
    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
    }
    @keyframes pulse-dot {
        0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(36, 199, 145, 0.4); }
        50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(36, 199, 145, 0); }
    }

    /* ── Scrollbar styling ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: var(--bg-primary); }
    ::-webkit-scrollbar-thumb { background: var(--border-color); border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

    /* ── Responsive ── */
    @media (max-width: 768px) {
        .main .block-container { padding: 1rem !important; }
        .hela-header h1 { font-size: 1.8rem; }
        .chat-message { max-width: 95%; }
        .welcome-card { padding: 20px; }
        .example-prompts { flex-direction: column; align-items: center; }
    }

    /* ── Override stMarkdown text color ── */
    .stMarkdown, .stMarkdown p, .stMarkdown li, .stMarkdown h1,
    .stMarkdown h2, .stMarkdown h3, .stMarkdown h4 {
        color: var(--text-primary) !important;
    }

    /* ── Sidebar info text ── */
    .sidebar-info {
        font-size: 11.5px;
        color: var(--text-muted);
        line-height: 1.55;
        margin-top: 6px;
    }
</style>
"""

st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# Helper functions for rendering chat UI
# ---------------------------------------------------------------------------

def render_message(role: str, content: str, sources: list[str] | None = None):
    """Render a single chat message as a styled HTML bubble."""
    if role == "user":
        avatar_class = "user-avatar"
        bubble_class = "user-bubble"
        msg_class = "user"
        avatar_text = "You"
    else:
        avatar_class = "agent-avatar"
        bubble_class = "agent-bubble"
        msg_class = "assistant"
        avatar_text = "H"

    # Build source badges HTML
    sources_html = ""
    if sources:
        badges = "".join(
            f'<span class="source-badge">{s}</span> ' for s in sources
        )
        sources_html = f'<div style="margin-top: 8px;">{badges}</div>'

    html = f"""
    <div class="chat-message {msg_class}">
        <div class="chat-avatar {avatar_class}">{avatar_text}</div>
        <div>
            <div class="chat-bubble {bubble_class}">{content}</div>
            {sources_html}
        </div>
    </div>
    """
    st.markdown(html, unsafe_allow_html=True)


def render_loading():
    """Render an animated loading indicator."""
    html = """
    <div class="chat-message assistant">
        <div class="chat-avatar agent-avatar">H</div>
        <div class="loading-container">
            <div class="loading-dots">
                <span></span><span></span><span></span>
            </div>
            <span class="loading-text">Researching HeLa data…</span>
        </div>
    </div>
    """
    return st.markdown(html, unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# Sidebar — branding, API keys, status
# ---------------------------------------------------------------------------

with st.sidebar:
    # Brand header
    st.markdown("""
        <div class="sidebar-brand">
            <div class="sidebar-logo">H</div>
            <div class="sidebar-title">HeLa AI Agent</div>
            <div class="sidebar-version">v1.0 • Information Agent</div>
        </div>
    """, unsafe_allow_html=True)

    st.markdown("#### 🔑 API Configuration")
    st.markdown(
        '<p class="sidebar-info">Enter your Google Gemini API key below. '
        'It is <strong>free</strong> to get from Google AI Studio! '
        'Key is stored in your browser session only — never saved to disk.</p>',
        unsafe_allow_html=True,
    )

    # API key input — only Gemini needed now!
    gemini_key = st.text_input(
        "Gemini API Key",
        type="password",
        placeholder="AIza…",
        key="gemini_key_input",
        help="Get yours FREE at aistudio.google.com/apikey",
    )

    # Store key in session state
    if gemini_key:
        st.session_state["gemini_api_key"] = gemini_key

    # Connection status indicator
    has_gemini = bool(st.session_state.get("gemini_api_key"))

    if has_gemini:
        st.markdown("""
            <div class="status-connected">
                <div class="status-dot"></div>
                Agent ready — Gemini key active
            </div>
        """, unsafe_allow_html=True)
    else:
        st.markdown("""
            <div class="status-disconnected">
                ⚠ Missing: Gemini API Key
            </div>
        """, unsafe_allow_html=True)

    st.markdown('<div class="sidebar-divider"></div>', unsafe_allow_html=True)

    # Clear chat button
    if st.button("🗑️  Clear Chat History", use_container_width=True):
        st.session_state["chat_history"] = []
        st.rerun()

    st.markdown('<div class="sidebar-divider"></div>', unsafe_allow_html=True)

    # Info footer
    st.markdown("""
        <div style="padding: 8px 0;">
            <p class="sidebar-info">
                <strong>How it works:</strong><br>
                1. Enter your free Gemini API key above<br>
                2. Ask any question about HeLa Labs<br>
                3. The agent fetches live data and responds<br><br>
                <strong>Powered by:</strong> Google Gemini 3.0 Flash Preview + LangChain<br>
                <strong>Search:</strong> DuckDuckGo (free, no key needed)<br>
                <strong>Data:</strong> helalabs.com • docs • helascan.io
            </p>
        </div>
    """, unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# Main content area
# ---------------------------------------------------------------------------

# Header
st.markdown("""
    <div class="hela-header">
        <h1>⬡ HeLa AI Agent</h1>
        <p class="hela-subtitle">Your intelligent assistant for everything HeLa Labs — powered by live data</p>
    </div>
""", unsafe_allow_html=True)

# Initialise chat history in session state
if "chat_history" not in st.session_state:
    st.session_state["chat_history"] = []

# Show welcome card when chat is empty
if not st.session_state["chat_history"]:
    st.markdown("""
        <div class="welcome-card">
            <h3>👋 Welcome to the HeLa AI Agent</h3>
            <p>
                Ask me anything about HeLa Labs — from architecture and tokenomics
                to the latest news and on-chain data. I'll fetch real-time information
                and give you a concise answer.
            </p>
            <div class="example-prompts">
                <span class="example-chip">What is HeLa Labs?</span>
                <span class="example-chip">Explain HLUSD stablecoin</span>
                <span class="example-chip">Latest HeLa news</span>
                <span class="example-chip">HeLa tokenomics</span>
                <span class="example-chip">Show network stats</span>
                <span class="example-chip">How does HeLa consensus work?</span>
            </div>
        </div>
    """, unsafe_allow_html=True)

# Render existing chat history
chat_container = st.container()
with chat_container:
    st.markdown('<div class="chat-container">', unsafe_allow_html=True)
    for msg in st.session_state["chat_history"]:
        render_message(
            role=msg["role"],
            content=msg["content"],
            sources=msg.get("sources"),
        )
    st.markdown('</div>', unsafe_allow_html=True)


# ---------------------------------------------------------------------------
# Chat input handling
# ---------------------------------------------------------------------------

user_input = st.chat_input("Ask about HeLa Labs…", key="chat_input")

if user_input:
    # Validate API key before proceeding
    if not st.session_state.get("gemini_api_key"):
        st.error("⚠️ Please enter your **Gemini API key** in the sidebar to continue. Get one FREE at [aistudio.google.com](https://aistudio.google.com/apikey)")
        st.stop()

    # Add user message to history
    st.session_state["chat_history"].append({
        "role": "user",
        "content": user_input,
    })

    # Re-render chat with the new user message
    with chat_container:
        render_message("user", user_input)

    # Show loading animation
    with chat_container:
        loading_placeholder = st.empty()
        with loading_placeholder:
            render_loading()

    # Build the agent and run it
    try:
        agent = build_agent(
            gemini_api_key=st.session_state["gemini_api_key"],
        )

        # Prepare history for the agent (exclude the message we just added)
        history_for_agent = st.session_state["chat_history"][:-1]

        result = run_agent(
            agent=agent,
            user_message=user_input,
            chat_history=history_for_agent,
        )

        response_text = result["response"]
        sources = result["sources"]

    except Exception as exc:
        response_text = (
            f"⚠️ **Error:** {str(exc)}\n\n"
            "Please check your API keys and try again."
        )
        sources = []

    # Remove loading animation
    loading_placeholder.empty()

    # Add agent response to history
    st.session_state["chat_history"].append({
        "role": "assistant",
        "content": response_text,
        "sources": sources if sources else ["hela_docs_scraper"],
    })

    # Re-render to show the agent response
    st.rerun()
