import os

from dotenv import load_dotenv

load_dotenv()


def _get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is missing in .env")
    try:
        from google import genai
    except ImportError as exc:
        raise RuntimeError("google-genai package is not installed") from exc
    return genai.Client(api_key=api_key)


def query_llm_with_context(query: str, context: str) -> str:
    system_content = (
        "You are a helpful assistant for answering user queries based on provided context. "
        "Use the context to provide accurate and relevant answers. Do not make assumptions beyond the context provided. "
        "If the context does not contain enough information to answer the query, "
        "say that you cannot provide an answer based on the given context."
    )
    prompt = f"Query: {query}\n\nContext:\n{context}"

    client = _get_gemini_client()
    model = os.getenv("GEMINI_LLM_MODEL", "gemini-2.5-flash")
    temperature = os.getenv("GEMINI_TEMPERATURE", "0.4").strip()
    try:
        temperature_value = float(temperature)
    except ValueError:
        temperature_value = 0.4

    try:
        response = client.models.generate_content(
            model=model,
            contents=[system_content, prompt],
            generation_config={"temperature": temperature_value},
        )
    except TypeError:
        response = client.models.generate_content(
            model=model,
            contents=[system_content, prompt],
        )
    return response.text or ""