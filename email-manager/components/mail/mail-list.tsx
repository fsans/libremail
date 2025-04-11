import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatEmailDate } from '@/lib/utils/date-formatter';
import { parseEmailAddresses } from '@/lib/utils/email-parser';
import { formatFileSize } from '@/lib/utils/file-size-formatter';
import type { Message } from '@/lib/db/schema';
import { useMailContext } from '@/app/mail/layout';
import { Paperclip, Flag } from 'lucide-react';

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
  
  // Check if a message has attachments
  const hasAttachments = (message: Message): boolean => {
    if (!message.attachments) return false;
    
    try {
      // The attachments field might be a JSON string or already parsed
      const attachmentsData = typeof message.attachments === 'string' 
        ? JSON.parse(message.attachments) 
        : message.attachments;
        
      return Array.isArray(attachmentsData) && attachmentsData.length > 0;
    } catch (error) {
      return false;
    }
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
                    <div className="flex items-start justify-between pl-3">

                      {/* From name and Subject */}
                      <div className="flex flex-col min-w-0 flex-grow">
                        <div className="flex items-center">
                          <span className="text-[10px] font-semibold truncate">{fromName}</span>
                        </div>
                        <div className="text-[10px] truncate">{message.subject}</div>
                      </div>
                      
                      {/* Date and icons */}
                      <div className="flex flex-col items-end ml-2 shrink-0">

                        {/* Date - top row */}
                        <span className="text-[10px] text-gray-500 whitespace-nowrap text-right w-full">
                          {formatEmailDate(message.date || new Date())}
                        </span>
                        
                        {/* Bottom row with icons and size */}
                        <div className="flex justify-end w-full mt-0.5">
                          {/* Attachment indicator */}
                          {hasAttachments(message) && (
                            <Paperclip className="h-2 w-2 text-gray-500 mr-1.5" />
                          )}
                          
                          {/* Flag indicator */}
                          {message.flagged && (
                            <Flag className="h-2 w-2 text-amber-500 mr-1.5" />
                          )}
                          
                          {/* File size indicator */}
                          <span className="text-[10px] text-gray-400">{formatFileSize(message.size)}</span>
                        </div>
                      </div>


                    </div>
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