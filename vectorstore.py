import os
from typing import List

import chromadb
from dotenv import load_dotenv

load_dotenv()

CHROMA_COLLECTION = os.getenv("CHROMA_COLLECTION", "rag-chunks")


def _get_chroma_client() -> chromadb.HttpClient:
    host = os.getenv("CHROMA_HOST", "").strip()
    api_key = os.getenv("CHROMA_API_KEY", "").strip()
    tenant = os.getenv("CHROMA_TENANT", "").strip()
    database = os.getenv("CHROMA_DATABASE", "").strip()

    if not host:
        raise RuntimeError("CHROMA_HOST is missing in .env")
    if not api_key:
        raise RuntimeError("CHROMA_API_KEY is missing in .env")

    headers = {"X-Chroma-Token": api_key}

    kwargs = {
        "host": host,
        "port": 443,
        "ssl": True,
        "headers": headers,
    }
    if tenant:
        kwargs["tenant"] = tenant
    if database:
        kwargs["database"] = database

    try:
        return chromadb.HttpClient(**kwargs)
    except TypeError:
        kwargs.pop("tenant", None)
        kwargs.pop("database", None)
        return chromadb.HttpClient(**kwargs)


def _get_collection(client: chromadb.HttpClient):
    return client.get_or_create_collection(
        name=CHROMA_COLLECTION,
        metadata={"hnsw:space": "cosine"},
    )


def store_in_chroma(chunks: List[str], embeddings: List[List[float]]):
    if not chunks:
        return
    if len(chunks) != len(embeddings):
        raise ValueError("chunks and embeddings must be the same length")

    client = _get_chroma_client()
    collection = _get_collection(client)

    ids = [f"chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"chunk_index": i} for i in range(len(chunks))]
    collection.add(documents=chunks, embeddings=embeddings, ids=ids, metadatas=metadatas)


def search_in_chroma(query_vector: List[float], top_k: int = 4) -> List[str]:
    client = _get_chroma_client()
    collection = _get_collection(client)
    results = collection.query(query_embeddings=[query_vector], n_results=top_k)
    documents = results.get("documents", [[]])[0]
    return documents