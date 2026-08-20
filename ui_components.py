"""
UI components for the Advanced RAG application
"""
import streamlit as st
from config import (
    PAGE_TITLE, PAGE_ICON, LAYOUT, SIDEBAR_STATE, 
    FILE_CATEGORIES, UPLOAD_PLACEHOLDER_TITLE, UPLOAD_PLACEHOLDER_TEXT
)
from utils import format_file_size


def setup_page_config():
    """Sets up Streamlit page settings and injects Claymorphism CSS"""
    st.set_page_config(
        page_title=PAGE_TITLE, 
        page_icon=PAGE_ICON,
        layout=LAYOUT,
        initial_sidebar_state=SIDEBAR_STATE
    )
    
    # Inject Claymorphism CSS
    st.markdown("""
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        html, body, [class*="css"], .stApp {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
        }
        
        h1, h2, h3, h4, h5, h6, .stMarkdown p strong {
            color: #f8fafc !important;
        }
        
        p, .stMarkdown p {
            color: #94a3b8;
        }
        
        .clay-card {
            background: #1e293b;
            border-radius: 20px;
            box-shadow: 
                6px 6px 14px #0b1120, 
                -6px -6px 14px #27354a, 
                inset 1px 1px 2px rgba(255, 255, 255, 0.1), 
                inset -1px -1px 2px rgba(0, 0, 0, 0.4);
            padding: 24px;
            margin-bottom: 24px;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            color: #f8fafc;
        }
        
        .clay-card:hover {
            transform: translateY(-3px) scale(1.01);
            box-shadow: 
                8px 8px 18px #0b1120, 
                -8px -8px 18px #27354a,
                inset 1px 1px 2px rgba(255, 255, 255, 0.1),
                inset -1px -1px 2px rgba(0, 0, 0, 0.4);
        }
        
        .clay-badge {
            background: linear-gradient(135deg, #6366f1, #38bdf8);
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            display: inline-block;
            box-shadow: 4px 4px 8px #0b1120, -4px -4px 8px #27354a;
            margin-bottom: 12px;
        }
        
        .clay-hero {
            text-align: center;
            padding: 40px 20px;
            background: #1e293b;
            border-radius: 24px;
            box-shadow: 
                inset 6px 6px 12px #0b1120, 
                inset -6px -6px 12px #27354a;
            margin-bottom: 30px;
        }
        
        .metric-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #f8fafc;
        }
        
        .metric-label {
            font-size: 0.85rem;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* Streamlit Native Elements Customization */
        .stFileUploader, [data-testid="stSidebar"], div[data-baseweb="input"], [data-testid="stExpander"] {
            background-color: #1e293b !important;
            border-radius: 16px !important;
            box-shadow: inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,0.05) !important;
            border: none !important;
        }

        /* Override sidebar background specifically */
        [data-testid="stSidebar"] > div:first-child {
            background-color: #0f172a !important;
        }
        
        /* Fix input text color */
        div[data-baseweb="input"] input {
            color: #f8fafc !important;
        }
    </style>
    """, unsafe_allow_html=True)


def render_header():
    """Shows the main header section with Claymorphism"""
    st.markdown("""
    <div class="clay-hero">
        <div class="clay-badge">DocuMind - Enterprise Multimodal RAG Engine</div>
        <h1 style="margin: 0; padding-bottom: 10px; color: #f8fafc;">DocuMind Advanced RAG</h1>
        <p style="color: #94a3b8; font-size: 1.1rem;">Intelligent Document Search & Analysis powered by LangGraph</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Feature highlights in Clay cards
    col1, col2, col3 = st.columns(3)
    
    with col1:
        st.markdown("""
        <div class="clay-card">
            <h4 style="margin-top:0; color: #f8fafc;">🔍 Smart Search</h4>
            <p style="color: #94a3b8; font-size: 0.9rem;">Advanced retrieval with fallback to online sources</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        st.markdown("""
        <div class="clay-card">
            <h4 style="margin-top:0; color: #f8fafc;">📄 Multi-Format</h4>
            <p style="color: #94a3b8; font-size: 0.9rem;">PDF, Images, Word, Excel, Code files supported</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        st.markdown("""
        <div class="clay-card">
            <h4 style="margin-top:0; color: #f8fafc;">🤖 LLM-Powered</h4>
            <p style="color: #94a3b8; font-size: 0.9rem;">LangGraph workflow with hallucination detection</p>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)


def render_sidebar(document_loader):
    """Shows the sidebar with app info, file types, and telemetry metrics"""
    with st.sidebar:
        # App info in Clay card
        st.markdown("""
        <div class="clay-card">
            <h4 style="margin-top:0; color: #f8fafc;">🧠 DocuMind Status</h4>
            <div style="margin-bottom: 10px;">
                <span class="metric-label">Routing</span><br>
                <span class="metric-value" style="color: #38bdf8;">Dynamic (Active)</span>
            </div>
            <div>
                <span class="metric-label">Self-Eval Chains</span><br>
                <span class="metric-value" style="color: #38bdf8;">Active</span>
            </div>
        </div>
        """, unsafe_allow_html=True)
        
        st.markdown("### 📋 Supported Formats")
        
        # Organized file type display
        for category, formats in FILE_CATEGORIES.items():
            with st.expander(category, expanded=False):
                for fmt in formats:
                    st.markdown(f"• {fmt}")


def render_upload_section(document_loader):
    """Shows the document upload section"""
    st.markdown("## 📤 Document Upload")
    
    # Upload area with simple styling
    st.info("📁 **Drag & Drop Your Document**\n\nSupported: PDF, Word, Excel, Text, Code files")
    
    # Show current supported extensions
    with st.expander("ℹ️ View All Supported Formats", expanded=False):
        col1, col2 = st.columns(2)
        with col1:
            st.write(f"**Supported extensions:** {document_loader.get_supported_extensions_display()}")
        with col2:
            st.write(f"**Total formats:** {len(document_loader.get_supported_extensions())}")
    
    # File uploader
    user_file = st.file_uploader(
        "Choose a file", 
        type=document_loader.get_supported_extensions(),
        help="Upload any supported document type.",
        label_visibility="collapsed"
    )
    
    return user_file


def render_file_analysis(file_info):
    """Shows file analysis metrics"""
    st.markdown("### 📊 File Analysis")
    
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.markdown("**📄 Filename**")
        st.write(file_info['filename'])
    
    with col2:
        st.markdown("**📏 Size**")
        size_display = format_file_size(file_info['size'])
        st.write(size_display)
    
    with col3:
        st.markdown("**🏷️ Type**")
        st.write(f".{file_info['extension'].upper()}")
    
    with col4:
        st.markdown("**📋 Status**")
        status_icon = "✅" if file_info['is_supported'] else "❌"
        status_text = "Supported" if file_info['is_supported'] else "Unsupported"
        st.write(f"{status_icon} {status_text}")


def render_upload_placeholder():
    """Shows placeholder when no file is uploaded"""
    st.markdown(f"""
    <div style="text-align: center; padding: 3rem; background: #1e293b; border-radius: 16px; margin: 2rem 0; box-shadow: inset 2px 2px 5px rgba(0,0,0,0.3), inset -2px -2px 5px rgba(255,255,255,0.05);">
        <h3 style="color: #f8fafc;">{UPLOAD_PLACEHOLDER_TITLE}</h3>
        <p style="color: #94a3b8;">{UPLOAD_PLACEHOLDER_TEXT}</p>
    </div>
    """, unsafe_allow_html=True)


def render_question_section(user_file):
    """Shows the question input section"""
    st.markdown("### 💬 Ask Questions About Your Document")
    
    # Display current file info
    file_display = f"📄 **Current Document:** {user_file.name}"
    if hasattr(user_file, 'type') and user_file.type:
        file_display += f" ({user_file.type})"
    
    st.markdown(f"""
    <div class="clay-card" style="padding: 12px 24px; margin-bottom: 16px;">
        <p style="margin: 0; color: #94a3b8;">{file_display}</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Question input
    col1, col2 = st.columns([4, 1])
    
    with col1:
        question = st.text_input(
            'Enter your question:', 
            placeholder="What is the main topic of this document?",
            disabled=not user_file,
            help="Ask any question about the content of your uploaded document",
            label_visibility="collapsed"
        )
    
    with col2:
        ask_button = st.button("Ask", use_container_width=True)
    
    return question, ask_button


def render_answer_section(result):
    """Shows the answer section with Claymorphism"""
    st.markdown("### 📝 Response")
    
    # Extract latency, faithfulness score, and source tags if available in result
    # Fallback appropriately to maintain stability
    latency = result.get('latency', 'N/A')
    
    score_display = 'N/A'
    if 'document_relevance_score' in result and hasattr(result['document_relevance_score'], 'confidence'):
        score_display = f"{result['document_relevance_score'].confidence:.2f}"
        
    search_method = result.get('search_method', 'Unknown')
    source_tag = "🌐 Online" if search_method == 'online' else "📄 Documents"
    
    st.markdown(f"""
    <div class="clay-card">
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 15px;">
            <div>
                <span class="clay-badge" style="margin-bottom: 0;">Source: {source_tag}</span>
            </div>
            <div style="text-align: right;">
                <span class="metric-label">Faithfulness:</span> <span style="font-weight: 600; color: #38bdf8;">{score_display}</span>
                &nbsp;|&nbsp;
                <span class="metric-label">Latency:</span> <span style="font-weight: 600; color: #38bdf8;">{latency}</span>
            </div>
        </div>
        <div style="color: #f8fafc; line-height: 1.6; white-space: pre-wrap;">
{result.get('solution', 'No answer provided.')}
        </div>
    </div>
    """, unsafe_allow_html=True)
