import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatEmailDate } from '@/lib/utils/date-formatter';
import { parseEmailAddresses } from '@/lib/utils/email-parser';
import type { Message } from '@/lib/db/schema';
import { useMailContext } from '@/app/mail/layout';

interface MailListProps {
  messages: Message[];
  currentFolder: string;
}

export function MailList({ messages, currentFolder }: MailListProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { setSelectedMessageId, setCurrentFolder } = useMailContext();
  
  // Update the current folder in the context when it changes
  useEffect(() => {
    setCurrentFolder(currentFolder);
  }, [currentFolder, setCurrentFolder]);
  
  const handleSelectMessage = (id: number) => {
    setSelectedId(id);
    setSelectedMessageId(id);
  };
  
  return (
    <div className="h-full flex flex-col">
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
                    relative
                  `}
                  onClick={() => handleSelectMessage(message.id)}
                >
                  {!message.seen && (
                    <div className="absolute left-3 top-3 transform -translate-y-1/2 w-2 h-2 rounded-full bg-blue-700 z-10"></div>
                  )}
                  <Link 
                    href={`/mail/${currentFolder}/${message.id}`}
                    className="block px-4 py-1"
                  >
                    <div className="flex justify-between pl-3">
                      <span className="text-[10px] font-semibold">{fromName}</span>
                      <span className="text-[10px] text-gray-500">
                        {formatEmailDate(message.date || new Date())}
                      </span>
                    </div>
                    <div className="text-[10px] truncate pl-3">{message.subject}</div>
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