from __future__ import annotations

import os
from typing import List

from dotenv import load_dotenv

load_dotenv()

GEMINI_EMBEDDING_MODEL = os.getenv(
    "GEMINI_EMBEDDING_MODEL",
    "models/gemini-embedding-001",
)


def _get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is missing in .env")
    try:
        from google import genai
    except ImportError as exc:
        raise RuntimeError("google-genai package is not installed") from exc
    return genai.Client(api_key=api_key)


def _extract_embedding_values(embedding) -> List[float]:
    values = getattr(embedding, "values", None)
    if values is None and isinstance(embedding, dict):
        values = embedding.get("values")
    if values is None:
        raise RuntimeError("Unexpected embedding response format from Gemini.")
    return list(values)


def _normalize_model_name(model_name: str) -> str:
    if not model_name:
        return "models/gemini-embedding-001"
    if model_name.startswith("models/"):
        return model_name
    return f"models/{model_name}"


def _embed_with_gemini(client, texts: List[str]) -> List[List[float]]:
    response = client.models.embed_content(
        model=_normalize_model_name(GEMINI_EMBEDDING_MODEL),
        contents=texts,
    )
    embeddings = getattr(response, "embeddings", None)
    if embeddings is None and isinstance(response, dict):
        embeddings = response.get("embeddings")
    if not embeddings:
        raise RuntimeError("Gemini returned no embeddings.")
    return [_extract_embedding_values(embedding) for embedding in embeddings]


def embed_chunks(chunks: List[str]) -> List[List[float]]:
    """Embeds chunks using Gemini."""
    if not chunks:
        return []

    client = _get_gemini_client()
    return _embed_with_gemini(client, chunks)


def embed_User_query(query: str) -> List[float]:
    """Embeds a user query using Gemini."""
    if not query:
        return []

    client = _get_gemini_client()
    return _embed_with_gemini(client, [query])[0]



