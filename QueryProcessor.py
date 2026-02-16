from embedder import embed_User_query
from llm import query_llm_with_context
from vectorstore import search_in_chroma

def process_user_query(
    query: str,
    *,
    top_k: int = 4,
) -> tuple[str, list[str]]:
    query_vector = embed_User_query(query)
    matched_chunks = search_in_chroma(query_vector, top_k=top_k)
    context = "\n\n".join(matched_chunks)
    generated_response = query_llm_with_context(query, context)
    return generated_response, matched_chunks

if __name__ == "__main__":
    user_query = input("Enter your query: ").strip()
    if user_query:
        answer, _ = process_user_query(user_query)
        print(answer)