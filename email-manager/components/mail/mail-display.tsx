import { useState, useEffect } from 'react';
import { parseEmailAddresses } from '@/lib/utils/email-parser';
import { formatEmailDate } from '@/lib/utils/date-formatter';
import type { Message, Attachment } from '@/lib/db/schema';
import { ChevronDown, ChevronUp, Paperclip } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { AvatarFallback } from '@/components/ui/avatar';

interface MailDisplayProps {
  message: Message;
}

export function MailDisplay({ message }: MailDisplayProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Parse email addresses
  const fromAddresses = parseEmailAddresses(message.from || '');
  const toAddresses = parseEmailAddresses(message.to || '');
  const ccAddresses = parseEmailAddresses(message.cc || '');
  const bccAddresses = parseEmailAddresses(message.bcc || '');
  
  // Get sender name and email
  const senderName = fromAddresses[0]?.name || fromAddresses[0]?.address || 'Unknown';
  const senderEmail = fromAddresses[0]?.address || '';
  
  // Get sender initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  
  const senderInitials = getInitials(senderName);
  
  // Load attachments
  useEffect(() => {
    async function loadAttachments() {
      if (!message.id) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/attachments?messageId=${message.id}`);
        if (!response.ok) {
          throw new Error('Failed to load attachments');
        }
        const data = await response.json();
        setAttachments(data);
      } catch (error) {
        console.error('Error loading attachments:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadAttachments();
  }, [message.id]);
  
  // Mark message as read if not already
  useEffect(() => {
    async function markAsRead() {
      if (!message.id || message.seen) return;
      
      try {
        await fetch(`/api/emails/${message.id}/read`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    }
    
    markAsRead();
  }, [message.id, message.seen]);
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-950">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            {message.subject}
          </h1>
          
          <div className="flex items-start">
            <Avatar className="h-10 w-10 mr-4">
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {senderInitials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {senderName}
                  </div>
                  <div className="text-sm text-gray-500">
                    {senderEmail}
                  </div>
                </div>
                
                <div className="text-sm text-gray-500">
                  {formatEmailDate(message.date || new Date(), true)}
                </div>
              </div>
              
              <div className="mt-1 flex items-center">
                <div className="text-sm text-gray-500 mr-2">
                  To: {toAddresses.map(a => a.name || a.address).join(', ')}
                </div>
                
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  {showDetails ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Show details
                    </>
                  )}
                </button>
              </div>
              
              {showDetails && (
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {ccAddresses.length > 0 && (
                    <div>
                      <span className="font-medium">Cc: </span>
                      {ccAddresses.map(a => a.name || a.address).join(', ')}
                    </div>
                  )}
                  
                  {bccAddresses.length > 0 && (
                    <div>
                      <span className="font-medium">Bcc: </span>
                      {bccAddresses.map(a => a.name || a.address).join(', ')}
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium">Date: </span>
                    {formatEmailDate(message.date || new Date(), true)}
                  </div>
                  
                  {message.message_id && (
                    <div>
                      <span className="font-medium">Message ID: </span>
                      <span className="break-all">{message.message_id}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mb-6 border-t border-b border-gray-200 dark:border-gray-800 py-4">
            <div className="flex items-center mb-2">
              <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {attachments.length} Attachment{attachments.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.id} 
                  className="flex items-center p-2 border border-gray-200 dark:border-gray-800 rounded-md"
                >
                  <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {attachment.filename}
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round((attachment.size || 0) / 1024)} KB
                    </div>
                  </div>
                  <a 
                    href={`/api/attachments/${attachment.id}/download`}
                    download={attachment.filename}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                  >
                    Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Message body */}
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: message.text_html || message.text_plain || '' }}
        />
      </div>
    </div>
  );
}