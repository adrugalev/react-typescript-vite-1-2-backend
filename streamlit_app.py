from pathlib import Path

import streamlit as st
import streamlit.components.v1 as components


APP_DIR = Path(__file__).resolve().parent
DIST_DIR = APP_DIR / "dist"
INDEX_FILE = DIST_DIR / "index.html"


st.set_page_config(
    page_title="Страны мира",
    layout="wide",
    initial_sidebar_state="collapsed",
)

st.markdown(
    """
    <style>
      header[data-testid="stHeader"],
      [data-testid="stToolbar"],
      [data-testid="stDecoration"] {
        display: none !important;
      }

      [data-testid="stMainBlockContainer"] {
        max-width: none;
        padding: 0 !important;
      }

      [data-testid="stAppViewContainer"] {
        background: #eef3f7;
      }

      [data-testid="stVerticalBlock"] {
        gap: 0;
      }

      iframe[title="countries_world_quiz"] {
        border: 0;
      }
    </style>
    """,
    unsafe_allow_html=True,
)

if not INDEX_FILE.is_file():
    st.error("Не найдена готовая сборка приложения в папке dist.")
    st.code("npm install\nnpm run build", language="bash")
    st.stop()

quiz = components.declare_component(
    "countries_world_quiz",
    path=str(DIST_DIR),
)

quiz(key="countries-world-quiz")
