import React from 'react';
import ChatInput from './app/ChatInput';

function App() {
  return (
    <div className="App" style={{ padding: "40px", maxWidth: 600, margin: "0 auto" }}>
      <h2>Football Highlight Assistant</h2>
      <ChatInput />
    </div>
  );
}

export default App;