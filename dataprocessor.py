import os
import sys

from chunker import chunk_pages
from embedder import embed_chunks
from pdfreader import read_pdf
from vectorstore import store_in_chroma


def run(pdf_path: str) -> None:
    pages = read_pdf(pdf_path)

    # Chunk the extracted text into manageable pieces
    chunks = chunk_pages(pages, chunk_size=900, chunk_overlap=150)

    embedded_chunks = embed_chunks(chunks)
    
    store_in_chroma(chunks, embedded_chunks)

    print(f"chunks:{len(chunks)}")
   
    
if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit("Usage: python dataprocessor.py <path_to_pdf>")

    run(sys.argv[1])