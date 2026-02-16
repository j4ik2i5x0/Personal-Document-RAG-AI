# SimpleRAG (Gemini + ChromaDB)

A minimal Retrieval-Augmented Generation (RAG) pipeline using:
- Gemini embeddings + Gemini LLM (google-genai)
- ChromaDB (cloud) for vector storage
- PDF ingestion via pypdf

The UI is a Next.js app styled like NotebookLM and calls the Python pipeline through API routes.

## Project Structure

- chunker.py: text chunking utilities
- pdfreader.py: PDF text extraction
- embedder.py: Gemini embedding calls
- vectorstore.py: ChromaDB storage and search helpers (cloud)
- dataprocessor.py: ingestion pipeline (PDF -> chunks -> embeddings -> Chroma)
- QueryProcessor.py: query pipeline (query -> embedding -> retrieval -> LLM)
- web/: Next.js UI
- llm.py: Gemini LLM call with context

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
- If your Gemini account exposes different embedding models, update GEMINI_EMBEDDING_MODEL.

## Ingest Documents

Run the CLI ingestion with an explicit PDF path:

```powershell
python .\dataprocessor.py path\to\your.pdf
```

This will extract text, chunk it, embed each chunk, and store vectors in ChromaDB.

## Query

```powershell
python .\QueryProcessor.py
```

This embeds the user query, retrieves top matches from ChromaDB, and sends query+context to Gemini.

## Next.js UI

Install frontend dependencies:

```powershell
cd web
npm install
```

Start the web app:

```powershell
npm run dev
```

Open http://localhost:3000 and upload PDFs before chatting.

Optional: set PYTHON_EXECUTABLE in web/.env.local if your Python binary is not on PATH:

```dotenv
PYTHON_EXECUTABLE=C:\\path\\to\\python.exe
```

## Security

Never commit real API keys. Rotate any keys that have been exposed.

Note: The Next.js API routes shell out to the Python pipeline from the repo root.
