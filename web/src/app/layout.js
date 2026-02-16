import "./globals.css";

export const metadata = {
  title: "SimpleRAG",
  description: "Notebook-style RAG UI powered by Gemini and ChromaDB",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
