import React, { useState } from "react";

const ChatInput: React.FC = () => {
  const [input, setInput] = useState("");
  const [parsed, setParsed] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const response = await fetch("../api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    const data = await response.json();
    setParsed(data.result); // Show the parsed result

    setInput("");
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: "8px" }}>
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
        <pre style={{ marginTop: "16px", background: "#f4f4f4", padding: "12px" }}>
          {JSON.stringify(parsed, null, 2)}
        </pre>
      )}
    </>
  );
};

export default ChatInput;