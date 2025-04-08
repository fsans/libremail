import { formatFullDate } from '@/lib/utils/date-formatter';
import { parseEmailAddresses } from '@/lib/utils/email-parser';
import type { Message } from '@/lib/db/schema';

interface MailDisplayProps {
  message: Message;
}

export function MailDisplay({ message }: MailDisplayProps) {
  const fromAddresses = parseEmailAddresses(message.from || '');
  const toAddresses = parseEmailAddresses(message.to || '');
  const ccAddresses = parseEmailAddresses(message.cc || '');
  const fromName = fromAddresses[0]?.name || fromAddresses[0]?.address || 'Unknown';
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{message.subject}</h1>
        <div className="flex space-x-2">
          <button className="p-2 rounded hover:bg-gray-100">
            <span>↩️</span>
          </button>
          <button className="p-2 rounded hover:bg-gray-100">
            <span>⏩</span>
          </button>
          <button className="p-2 rounded hover:bg-gray-100">
            <span>🗑️</span>
          </button>
        </div>
      </div>
      
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start mb-2">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold mr-3">
            {fromName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold">{fromName}</div>
                <div className="text-sm text-gray-500">
                  {fromAddresses[0]?.address}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {formatFullDate(message.date || new Date())}
              </div>
            </div>
            <div className="text-sm mt-1">
              <span className="text-gray-500">To:</span> {toAddresses.map(a => a.name || a.address).join(', ')}
            </div>
            {ccAddresses.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-500">Cc:</span> {ccAddresses.map(a => a.name || a.address).join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {message.text_html ? (
          <div dangerouslySetInnerHTML={{ __html: message.text_html }} />
        ) : message.text_plain ? (
          <pre className="whitespace-pre-wrap font-sans">{message.text_plain}</pre>
        ) : (
          <div className="prose max-w-none">
            <p>No content available for this email.</p>
          </div>
        )}
      </div>
    </div>
  );
}