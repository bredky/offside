"use client";
import React, { useState, useEffect } from "react";

interface ScorebatVideo {
  title: string;
  date: string;
  competition: string;
  thumbnail: string;
  videos: { title: string; embed: string }[];
}

const ChatInput: React.FC = () => {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<any>(null);
  const [highlights, setHighlights] = useState<ScorebatVideo[]>([]);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const res = await fetch("/api/scorebat");
        const data = await res.json();
        setHighlights(data.response);
      } catch (error) {
        console.error("Failed to fetch highlights:", error);
      }
    };

    fetchHighlights();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const response = await fetch("api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    const data = await response.json();
    setParsed(data.result);
    setInput("");
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about a football highlight..."
          style={{ flex: 1, padding: "8px" }}
        />
        <button type="submit">Send</button>
      </form>

      {parsed && (
        <pre style={{ background: "#f4f4f4", padding: "12px" }}>
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )}

      <h2 style={{ marginTop: "24px" }}>Recent Highlights</h2>
      {highlights.slice(0, 5).map((match, idx) => (
        <div key={idx} style={{ marginBottom: "32px" }}>
          <h3>{match.title}</h3>
          <p>{new Date(match.date).toLocaleString()}</p>
          {match.videos[0] && (
            <div dangerouslySetInnerHTML={{ __html: match.videos[0].embed }} />
          )}
        </div>
      ))}
    </>
  );
};

export default ChatInput;
