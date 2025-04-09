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
                    ${!message.seen ? 'font-semibold' : ''}
                  `}
                  onClick={() => handleSelectMessage(message.id)}
                >
                  <Link 
                    href={`/mail/${currentFolder}/${message.id}`}
                    className="block px-4 py-3"
                  >
                    <div className="flex justify-between">
                      <span className="text-xs">{fromName}</span>
                      <span className="text-xs text-gray-500">
                        {formatEmailDate(message.date || new Date())}
                      </span>
                    </div>
                    <div className="text-xs truncate">{message.subject}</div>
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