import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { OutboxMessage } from '@/lib/db/schema';

interface MailComposeProps {
  accountId: number;
  draft?: OutboxMessage;
  replyTo?: {
    to: string;
    subject: string;
    body: string;
  };
}

export function MailCompose({ accountId, draft, replyTo }: MailComposeProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  
  const [to, setTo] = useState(draft?.to || replyTo?.to || '');
  const [cc, setCc] = useState(draft?.cc || '');
  const [bcc, setBcc] = useState(draft?.bcc || '');
  const [subject, setSubject] = useState(draft?.subject || (replyTo?.subject ? `Re: ${replyTo.subject}` : ''));
  const [body, setBody] = useState(draft?.text_plain || replyTo?.body || '');
  
  const handleSubmit = async (e: FormEvent, asDraft: boolean = false) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      const emailData = {
        to,
        cc,
        bcc,
        subject,
        text_plain: body,
        draft: asDraft
      };
      
      if (draft?.id) {
        // Update existing draft
        await fetch('/api/outbox', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: draft.id,
            draft: emailData
          })
        });
      } else {
        // Create new draft or send email
        await fetch('/api/outbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accountId,
            draft: emailData
          })
        });
      }
      
      if (!asDraft) {
        router.push('/mail/inbox');
      }
    } catch (error) {
      console.error('Error saving email:', error);
      alert('Failed to save email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {draft?.id ? 'Edit Draft' : 'New Message'}
        </h1>
        <div className="flex space-x-2">
          <button
            type="button"
            className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => router.back()}
          >
            Cancel
          </button>
        </div>
      </div>
      
      <form className="flex-1 flex flex-col" onSubmit={(e) => handleSubmit(e, false)}>
        <div className="p-4 space-y-4">
          <div>
            <label htmlFor="to" className="block text-sm font-medium text-gray-700">
              To
            </label>
            <input
              type="text"
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="cc" className="block text-sm font-medium text-gray-700">
              Cc
            </label>
            <input
              type="text"
              id="cc"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="bcc" className="block text-sm font-medium text-gray-700">
              Bcc
            </label>
            <input
              type="text"
              id="bcc"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="flex-1">
            <label htmlFor="body" className="block text-sm font-medium text-gray-700">
              Message
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={15}
              required
            />
          </div>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-200 flex justify-between">
          <button
            type="button"
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSending}
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSending}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}