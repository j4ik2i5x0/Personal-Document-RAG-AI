from embedder import embed_User_query
from vectorstore import search_in_chroma
from llm import query_llm_with_context

def process_user_query(query: str):
    query_vector = embed_User_query(query)
    matched_chunks = search_in_chroma(query_vector)
    context = "\n\n".join(matched_chunks)
    generated_response = query_llm_with_context(query, context)
    print(generated_response)

if __name__ == "__main__":
    user_query = "What is Single Inheritence and what are the other types? Can you explain in detail?"
    process_user_query(user_query)