import { useState } from 'react';
import { PencilIcon } from '@heroicons/react/24/outline';

interface ChatSectionProps {
  chat: {
    id: string;
    name: string;
  };
  isSelected: boolean;
  onSelect: () => void;
  onRename: (newName: string) => void;
}

export default function ChatSection({ chat, isSelected, onSelect, onRename }: ChatSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(chat.name);

  const handleRename = () => {
    if (editName.trim()) {
      onRename(editName);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group p-3 rounded-lg cursor-pointer flex items-center justify-between ${
        isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'
      }`}
      onClick={onSelect}
    >
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleRename}
          onKeyPress={(e) => e.key === 'Enter' && handleRename()}
          className="flex-1 bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          autoFocus
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-700">{chat.name}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <PencilIcon className="h-4 w-4 text-gray-500" />
          </button>
        </>
      )}
    </div>
  );
} 