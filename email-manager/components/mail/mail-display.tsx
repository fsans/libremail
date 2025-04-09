import { formatFullDate } from '@/lib/utils/date-formatter';
import { parseEmailAddresses } from '@/lib/utils/email-parser';
import { 
  Archive, 
  Trash2, 
  AlertTriangle, 
  Reply, 
  ReplyAll, 
  Forward, 
  Flag, 
  FolderClosed,
  Paperclip
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Attachment, Message } from '@/lib/types';

// CSS to override email HTML styling that might center content or use fixed widths
const emailContentOverrides = `
  .email-content-wrapper {
    text-align: left !important;
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
  }
  .email-content-wrapper * {
    max-width: 100% !important;
    margin-left: 0 !important;
    margin-right: auto !important;
  }
  .email-content-wrapper table,
  .email-content-wrapper div,
  .email-content-wrapper p,
  .email-content-wrapper span,
  .email-content-wrapper td {
    width: auto !important;
    max-width: 100% !important;
    text-align: left !important;
  }
  .email-content-wrapper center {
    text-align: left !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .email-content-wrapper img {
    max-width: 100% !important;
    height: auto !important;
  }
`;

interface MailDisplayProps {
  message: Message;
}

export function MailDisplay({ message }: MailDisplayProps) {
  const fromAddresses = parseEmailAddresses(message.from || '');
  const toAddresses = parseEmailAddresses(message.to || '');
  const ccAddresses = parseEmailAddresses(message.cc || '');
  const fromName = fromAddresses[0]?.name || fromAddresses[0]?.address || 'Unknown';
  const [attachmentList, setAttachmentList] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState<boolean>(false);

  useEffect(() => {
    async function loadAttachments() {
      if (!message.id) return;
      
      setLoadingAttachments(true);
      try {
        // Try to fetch from the attachments table first
        const response = await fetch(`/api/attachments?messageId=${message.id}`);
        const data = await response.json();
        
        if (data && data.length > 0) {
          setAttachmentList(data);
        } else if (message.attachments) {
          // Fall back to the JSON in the message if needed
          try {
            // Check if attachments is already an array or a string that needs parsing
            if (typeof message.attachments === 'string') {
              const parsedAttachments = JSON.parse(message.attachments);
              setAttachmentList(parsedAttachments);
            } else {
              // It's already an Attachment array
              setAttachmentList(message.attachments);
            }
          } catch (e) {
            console.error('Failed to parse attachments JSON:', e);
          }
        }
      } catch (error) {
        console.error('Error loading attachments:', error);
        
        // Fall back to the JSON in the message
        if (message.attachments) {
          try {
            // Check if attachments is already an array or a string that needs parsing
            if (typeof message.attachments === 'string') {
              const parsedAttachments = JSON.parse(message.attachments);
              setAttachmentList(parsedAttachments);
            } else {
              // It's already an Attachment array
              setAttachmentList(message.attachments);
            }
          } catch (e) {
            console.error('Failed to parse attachments JSON:', e);
          }
        }
      } finally {
        setLoadingAttachments(false);
      }
    }
    
    loadAttachments();
  }, [message.id, message.attachments]);
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
        
        <div className="flex items-center space-x-3  px-4 py-2 rounded-md mx-3">
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded" title="Archive">
            <Archive className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded" title="Delete">
            <Trash2 className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded" title="Junk">
            <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="h-8 border-l border-gray-200 mx-2"></div>
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded" title="Reply">
            <Reply className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded" title="Reply All">
            <ReplyAll className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded" title="Forward">
            <Forward className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="h-8 border-l border-gray-200 mx-2"></div>
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded" title="Flag">
            <Flag className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <div className="relative">
            <button className="p-2 text-gray-500 hover:bg-gray-200 rounded" title="Move to...">
              <FolderClosed className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-3 ml-2 border-b border-gray-200">
        <div id="mail-header" className="flex items-start mb-2 pt-4 pr-6">
          <div id="mail-avatar" className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
            {fromName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex justify-between" id="mail-header-info">
              <div>
                <div id="mail-from" className="text-xs font-semibold">{fromName}</div>
                <div id="mail-from-address" className="text-xs text-gray-500">
                  {fromAddresses[0]?.address}
                </div>
                <div id="mail-subject" className="text-xs font-semibold">
                  {message.subject}
                </div>
              </div>
              <div id="mail-date" className="text-xs text-gray-500 mr-8 pr-4 pl-4">
                {formatFullDate(message.date || new Date())}
              </div>
            </div>
            <div id="mail-to" className="text-xs mt-1">
              <span className="text-gray-500">To:</span> {toAddresses.map(a => a.name || a.address).join(', ')}
            </div>
            {ccAddresses.length > 0 && (
              <div id="mail-cc" className="text-xs mt-1">
                <span className="text-gray-500">Cc:</span> {ccAddresses.map(a => a.name || a.address).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Attachments section */}
      {attachmentList.length > 0 && (
      <div className="p-3 ml-2 border-b border-gray-200">
        <div className="text-xs font-semibold mb-2">Attachments:</div>
        <div className="flex flex-wrap gap-2">
          {attachmentList.map((attachment, index) => (
            <div 
              key={index} 
              className="flex items-center p-2 bg-gray-50 rounded border border-gray-200"
            >
              <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
              <a 
                href={`/api/attachments/download?id=${attachment.id}`}
                className="text-xs text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {attachment.origName ?? attachment.filename}
              </a>
              <span className="text-xs text-gray-500 ml-2">
                ({Math.round(attachment.size / 1024)}KB)
              </span>
            </div>
          ))}
        </div>
      </div>
    )}
      
      <div className="flex-1 p-3 overflow-auto">
        <style>{emailContentOverrides}</style>
        {message.text_html ? (
          <div className="email-content-wrapper w-full" dangerouslySetInnerHTML={{ __html: message.text_html }} />
        ) : message.text_plain ? (
          <pre className="whitespace-pre-wrap font-sans w-full">{message.text_plain}</pre>
        ) : (
          <div className="prose max-w-none w-full">
            <p>No content available for this email.</p>
          </div>
        )}
      </div>
    </div>
  );
}