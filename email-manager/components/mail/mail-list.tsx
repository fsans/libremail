import { useState } from 'react';
import Link from 'next/link';
import { formatEmailDate } from '@/lib/utils/date-formatter';
import { parseEmailAddresses } from '@/lib/utils/email-parser';
import type { Message } from '@/lib/db/schema';

interface MailListProps {
  messages: Message[];
  currentFolder: string;
  onSelectMessage?: (id: number) => void;
}

export function MailList({ messages, currentFolder, onSelectMessage }: MailListProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  
  const handleSelectMessage = (id: number) => {
    setSelectedId(id);
    if (onSelectMessage) {
      onSelectMessage(id);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-semibold capitalize">{currentFolder}</h2>
        <div className="flex space-x-2">
          <button className="p-2 rounded hover:bg-gray-100">
            <span>🔄</span>
          </button>
          <button className="p-2 rounded hover:bg-gray-100">
            <span>⚙️</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No messages in this folder
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {messages.map((message) => {
              // Parse the from field which is now a text field containing email addresses
              const fromAddresses = parseEmailAddresses(message.from || '');
              const fromName = fromAddresses[0]?.name || fromAddresses[0]?.address || 'Unknown';
              
              return (
                <li 
                  key={message.id}
                  className={`
                    hover:bg-gray-50 cursor-pointer
                    ${selectedId === message.id ? 'bg-blue-50' : ''}
                    ${!message.seen ? 'font-semibold' : ''}
                  `}
                  onClick={() => handleSelectMessage(message.id)}
                >
                  <Link 
                    href={`/mail/${currentFolder}/${message.id}`}
                    className="block px-4 py-3"
                  >
                    <div className="flex justify-between">
                      <span className="text-sm">{fromName}</span>
                      <span className="text-xs text-gray-500">
                        {formatEmailDate(message.date || new Date())}
                      </span>
                    </div>
                    <div className="text-sm truncate">{message.subject}</div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}