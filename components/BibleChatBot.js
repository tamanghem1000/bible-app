import { useState } from 'react';

export default function BibleChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', content: 'Peace be with you! Ask me any Bible-related question.' }]);
  const [input, setInput] = useState('');

 async function sendMessage() {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: "Error: " + (data.error || "Could not reach the Bible assistant.") }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', content: "Network error. Please check your connection." }]);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && <button onClick={() => setIsOpen(true)} className="bg-yellow-600 p-4 rounded-full shadow-lg">📖</button>}
      {isOpen && (
        <div className="w-80 h-96 bg-[#0c0c0c] border border-slate-800 rounded-2xl p-4 flex flex-col shadow-2xl">
          <div className="flex-1 overflow-y-auto mb-4 space-y-2">
            {messages.map((m, i) => (
              <div key={i} className={`p-2 rounded-lg text-sm ${m.role === 'user' ? 'bg-yellow-600/20 text-right' : 'bg-[#151515]'}`}>{m.content}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} className="flex-1 bg-[#151515] p-2 rounded-lg border border-slate-800" placeholder="Ask about the Bible..." />
            <button onClick={sendMessage} className="bg-yellow-600 px-4 rounded-lg font-bold">Ask</button>
            <button onClick={() => setIsOpen(false)} className="text-slate-500">✕</button>
          </div>
        </div>
      )}
    </div>
  );
}