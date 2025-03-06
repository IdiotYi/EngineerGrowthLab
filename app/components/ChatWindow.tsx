'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon, HandThumbUpIcon, HandThumbDownIcon } from '@heroicons/react/24/outline';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface ChatWindowProps {
  chatId: string | null;
  model: 'deepseek-r1:1.5b' | 'claude-3-haiku';
}

export default function ChatWindow({ chatId, model }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (chatId) {
      const initialMessage: Message = {
        id: 'initial',
        content: `Hello, I am Engineer Growth Lab Agent (${model}). How may I assist you today?`,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([initialMessage]);
    }
  }, [chatId, model]);

  const sendMessage = async () => {
    if (!input.trim() || !chatId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          model: model
        }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
        throw new Error(errorData.detail || 'Network response was not ok');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : '发生了未知错误。',
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!chatId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        请选择或创建一个对话
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              {message.role === 'assistant' && (
                <>
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">EGL</span>
                  </div>
                  <span className="text-sm text-gray-500">Engineer Growth Lab Agent</span>
                  <span className="text-sm text-gray-400">{message.timestamp}</span>
                </>
              )}
              {message.role === 'user' && (
                <>
                  <span className="text-sm text-gray-500">You</span>
                  <span className="text-sm text-gray-400">{message.timestamp}</span>
                </>
              )}
            </div>
            <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-gray-100'
                  : 'bg-white border border-gray-200'
              }`}>
                <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
            {message.role === 'assistant' && (
              <div className="flex items-center space-x-2 ml-10">
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ArrowDownTrayIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ArrowUpTrayIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <HandThumbUpIcon className="w-4 h-4 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <HandThumbDownIcon className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-sm">EGL</span>
            </div>
            <div className="bg-white border border-gray-200 text-gray-800 rounded-lg p-4">
              正在思考...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex space-x-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message as a customer"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 disabled:bg-gray-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 