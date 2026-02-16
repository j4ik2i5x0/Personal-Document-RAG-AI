"use client";

import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const formatBytes = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export default function HomePage() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Welcome to SimpleRAG. Upload PDFs on the left, index them, and ask your questions here.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const totalBytes = useMemo(
    () => files.reduce((acc, file) => acc + file.size, 0),
    [files]
  );

  const handleIndex = async () => {
    if (!files.length) {
      setStatus("Please upload at least one PDF before indexing.");
      return;
    }

    setIndexing(true);
    setStatus("Indexing documents...");

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    try {
      const response = await fetch("/api/ingest", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Indexing failed.");
      }
      setStatus(`Indexed ${payload.chunks} chunks.`);
    } catch (error) {
      setStatus(error.message);
    } finally {
      setIndexing(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage.content }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error || "Request failed.");
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: payload.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Error: ${error.message}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleCopy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1200);
    } catch (error) {
      setCopiedKey("copy-failed");
    }
  };

  const renderers = {
    code({ inline, className, children }) {
      const content = String(children).replace(/\n$/, "");
      const language = className?.replace("language-", "") || "text";

      if (inline) {
        return <code className="chat-inline-code">{content}</code>;
      }

      return (
        <div className="code-block">
          <div className="code-block-header">
            <span>{language}</span>
            <button
              type="button"
              onClick={() => handleCopy(`code-${language}-${content.length}`, content)}
            >
              {copiedKey === `code-${language}-${content.length}`
                ? "Copied"
                : "Copy"}
            </button>
          </div>
          <pre className="code-block-body">
            <code>{content}</code>
          </pre>
        </div>
      );
    },
  };

  return (
    <main className="min-h-screen px-6 py-10 md:px-12">
      <section className="mx-auto max-w-6xl">
        <div className="glass-panel rounded-3xl p-8 md:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <span className="badge">NOTEBOOK MODE</span>
              <h1 className="mt-4 font-display text-3xl md:text-4xl">
                SimpleRAG Workspace
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-mist/70">
                A notebook-style assistant for your documents. Upload PDFs, index
                them in Chroma Cloud, and chat with Gemini-powered answers.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-mist/80">
              Gemini + Chroma Cloud
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_2fr]">
          <section className="glass-panel rounded-3xl p-6">
            <h2 className="section-title">Sources</h2>
            <p className="mt-2 text-sm text-mist/60">
              Upload PDFs and index them before chatting.
            </p>

            <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4">
              <input
                type="file"
                accept="application/pdf"
                multiple
                onChange={(event) =>
                  setFiles(event.target.files ? Array.from(event.target.files) : [])
                }
                className="w-full text-sm text-mist/70 file:mr-4 file:rounded-full file:border-0 file:bg-neon/20 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-neon"
              />
            </div>

            {files.length > 0 && (
              <div className="mt-4 space-y-2 text-xs text-mist/70">
                <p>Selected files:</p>
                <ul className="space-y-1">
                  {files.map((file) => (
                    <li key={file.name} className="flex justify-between">
                      <span>{file.name}</span>
                      <span>{formatBytes(file.size)}</span>
                    </li>
                  ))}
                </ul>
                <p className="pt-2">Total: {formatBytes(totalBytes)}</p>
              </div>
            )}

            <button
              type="button"
              disabled={indexing}
              onClick={handleIndex}
              className="mt-6 w-full rounded-full bg-neon px-4 py-3 text-sm font-semibold text-night transition hover:bg-neon/90 disabled:opacity-60"
            >
              {indexing ? "Indexing..." : "Index PDFs"}
            </button>

            {status && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-mist/70">
                {status}
              </div>
            )}
          </section>

          <section className="glass-panel rounded-3xl p-6">
            <h2 className="section-title">Chat</h2>
            <div className="mt-4 flex max-h-[560px] flex-col gap-4 overflow-y-auto pr-2">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    message.role === "user"
                      ? "chat-bubble-user self-end"
                      : "chat-bubble-ai self-start"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-mist/60">
                    <span>{message.role === "user" ? "You" : "SimpleRAG"}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${message.role}-${index}`, message.content)}
                      className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-mist/70 hover:border-white/30 hover:text-mist"
                    >
                      {copiedKey === `${message.role}-${index}` ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="chat-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={renderers}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask a question about your uploads..."
                className="min-h-[96px] w-full rounded-2xl border border-white/10 bg-night/60 px-4 py-3 text-sm text-mist focus:border-neon/60 focus:outline-none"
              />
              <button
                type="button"
                disabled={sending}
                onClick={handleSend}
                className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-mist transition hover:bg-white/20 disabled:opacity-60"
              >
                {sending ? "Thinking..." : "Send"}
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
