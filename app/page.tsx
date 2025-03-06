'use client';

import { useState } from 'react';
import ChatSection from './components/ChatSection';
import ChatWindow from './components/ChatWindow';

type Model = 'deepseek-r1:1.5b' | 'claude-3-haiku';

export default function Home() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model>('deepseek-r1:1.5b');
  const [chats, setChats] = useState<{ id: string; name: string }[]>([]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      name: '新对话'
    };
    setChats([...chats, newChat]);
    setSelectedChat(newChat.id);
  };

  const updateChatName = (id: string, newName: string) => {
    setChats(chats.map(chat => 
      chat.id === id ? { ...chat, name: newName } : chat
    ));
  };

  return (
    <div className="flex h-screen bg-white">
      {/* 聊天列表 */}
      <div className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold flex items-center">
            Voice conversation
          </h2>
        </div>
        <div className="p-4">
          <button
            onClick={createNewChat}
            className="w-full bg-black text-white rounded-lg py-2 mb-4 hover:bg-gray-800"
          >
            新建对话
          </button>
          <div className="space-y-2">
            {chats.map(chat => (
              <ChatSection
                key={chat.id}
                chat={chat}
                isSelected={selectedChat === chat.id}
                onSelect={() => setSelectedChat(chat.id)}
                onRename={(newName) => updateChatName(chat.id, newName)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Engineer Growth Lab Agent</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as Model)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="deepseek-r1:1.5b">Deepseek R1 1.5B</option>
              <option value="claude-3-haiku">Claude 3 Haiku</option>
            </select>
            <button className="text-gray-600 hover:text-gray-800">
              Save conversation
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              Conversation details
            </button>
          </div>
        </div>
        <ChatWindow chatId={selectedChat} model={selectedModel} />
      </div>
    </div>
  );
} 