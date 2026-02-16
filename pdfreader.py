import os
from pypdf import PdfReader

def read_pdf(pdf_path):
    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"The file {pdf_path} does not exist.")
    
    reader = PdfReader(pdf_path)
    pages = [page.extract_text() for page in reader.pages]
    return pages


def read_pdf_text(pdf_path: str) -> str:
    pages = read_pdf(pdf_path)
    cleaned_pages = [page for page in pages if page]
    return "\n\n".join(cleaned_pages)