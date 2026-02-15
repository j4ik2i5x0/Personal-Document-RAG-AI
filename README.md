# SimpleRAG (Gemini + ChromaDB)

A minimal Retrieval-Augmented Generation (RAG) pipeline using:
- Gemini embeddings + Gemini LLM (google-genai)
- ChromaDB (hosted) for vector storage
- PDF ingestion via pypdf

## Project Structure

- chunker.py: text chunking utilities
- pdfreader.py: PDF text extraction
- embedder.py: Gemini embedding calls
- vectorstore.py: ChromaDB storage and search helpers
- dataprocessor.py: ingestion pipeline (PDF -> chunks -> embeddings -> Chroma)
- QueryProcessor.py: query pipeline (query -> embedding -> retrieval -> LLM)
- llm.py: Gemini LLM call with context
- resources/: store PDFs for ingestion

## Setup

1) Clone the repo

```powershell
git clone https://github.com/j4ik2i5x0/Personal-Document-RAG-AI.git
cd RAG-Model
```

2) Create and activate a virtual environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

3) Install dependencies

```powershell
pip install -r requirements.txt
```

4) Configure environment variables

Create/update .env with your values (example keys below):

```dotenv
CHROMA_HOST=api.trychroma.com
CHROMA_API_KEY=your_chroma_api_key
CHROMA_TENANT=your_tenant_id
CHROMA_DATABASE=rag-model
CHROMA_COLLECTION=rag-chunks
GEMINI_API_KEY=your_gemini_api_key
GEMINI_EMBEDDING_MODEL=models/gemini-embedding-001
GEMINI_LLM_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.4
```

Notes:
- If your Chroma instance does not use tenant/database, leave them blank.
- If your Gemini account exposes different embedding models, update GEMINI_EMBEDDING_MODEL.

## Ingest Documents

Put a PDF in resources/ (default: resources/OOPS.pdf), then run:

```powershell
python .\dataprocessor.py
```

This will extract text, chunk it, embed each chunk, and store vectors in ChromaDB.

## Query

```powershell
python .\QueryProcessor.py
```

This embeds the user query, retrieves top matches from ChromaDB, and sends query+context to Gemini.

## Security

Never commit real API keys. Rotate any keys that have been exposed.
