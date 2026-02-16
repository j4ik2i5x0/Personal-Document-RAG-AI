from typing import List

def chunk_pages(pages: List[str], chunk_size: int = 900, chunk_overlap: int = 150) -> List[str]:
    chunks: List[str] = []
    
    full_text = " ".join(pages)
    text_length = len(full_text)
    
    if text_length == 0:
        return chunks
    
    start = 0
    while start < text_length:
        # Calculate end position
        end = min(start + chunk_size, text_length)

        # Extract chunk
        chunk = full_text[start:end].strip()
        if chunk:  # Only add non-empty chunks
            chunks.append(chunk)

        # If this was the last chunk (we reached the end), break
        if end >= text_length:
            break
        
        # Calculate next starting position
        start = end - chunk_overlap
    
    return chunks


def chunk_text(text: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and < chunk_size")

    if not text:
        return []

    chunks: List[str] = []
    start = 0
    length = len(text)

    while start < length:
        end = min(start + chunk_size, length)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end >= length:
            break
        start = end - overlap

    return chunks