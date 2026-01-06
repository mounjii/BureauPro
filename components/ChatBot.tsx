
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Product } from '../types';
import { geminiService } from '../services/geminiService';

interface ChatBotProps {
  products: Product[];
}

const ChatBot: React.FC<ChatBotProps> = ({ products }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Bonjour ! Je suis votre expert BureauPro. Comment puis-je vous aider aujourd\'hui ?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    const response = await geminiService.getAssistantResponse([...messages, userMessage], products);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isOpen ? (
        <div className="bg-bp-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-80 sm:w-[400px] flex flex-col h-[550px] border border-bp-light overflow-hidden animate-in slide-in-from-bottom-8 duration-500 rounded-lg">
          {/* Header */}
          <div className="bg-bp-green p-5 text-bp-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bp-white flex items-center justify-center text-bp-green">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
              </div>
              <div>
                <p className="font-bold text-sm tracking-wide">Assistant BureauPro</p>
                <p className="text-[10px] text-bp-white/70 uppercase font-bold tracking-widest">En ligne</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-bp-white/60 hover:text-bp-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-grow overflow-y-auto p-6 space-y-6 bg-bp-white">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 text-sm leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-bp-green text-bp-white rounded-l-2xl rounded-tr-none' 
                    : 'bg-bp-light/40 border border-bp-light text-bp-dark rounded-r-2xl rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-bp-light/40 border border-bp-light p-4 flex gap-1.5 rounded-r-2xl rounded-tl-none">
                  <div className="w-1.5 h-1.5 bg-bp-green rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-bp-green rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-bp-green rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-5 border-t border-bp-light bg-bp-white">
            <div className="flex gap-2">
              <input 
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Posez une question..."
                className="flex-grow bg-bp-light/50 border-none px-4 py-3 text-sm focus:ring-1 focus:ring-bp-green outline-none placeholder:text-bp-medium"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim()}
                className="bg-bp-green text-bp-white p-3 disabled:opacity-30 hover:brightness-110 transition-all duration-300 rounded-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-bp-green text-bp-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-500 group"
        >
          <svg className="group-hover:rotate-12 transition-transform" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        </button>
      )}
    </div>
  );
};

export default ChatBot;
