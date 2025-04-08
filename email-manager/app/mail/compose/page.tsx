'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MailCompose } from '@/components/mail/mail-compose';
import type { OutboxMessage } from '@/lib/db/schema';

function ComposeContent() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draft');
  const replyTo = searchParams.get('reply');
  
  const [loading, setLoading] = useState(Boolean(draftId || replyTo));
  const [draft, setDraft] = useState<OutboxMessage | undefined>(undefined);
  const [replyData, setReplyData] = useState<{
    to: string;
    subject: string;
    body: string;
  } | undefined>(undefined);
  
  // For now, we'll use a hardcoded account ID
  const accountId = 1;
  
  useEffect(() => {
    async function loadDraft() {
      if (draftId) {
        setLoading(true);
        try {
          // This would be replaced with an actual API call to get the draft
          const response = await fetch(`/api/outbox?id=${draftId}`);
          if (!response.ok) {
            throw new Error('Failed to load draft');
          }
          const data = await response.json();
          setDraft(data);
        } catch (error) {
          console.error('Error loading draft:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    async function loadReply() {
      if (replyTo) {
        setLoading(true);
        try {
          // This would be replaced with an actual API call to get the message
          const response = await fetch(`/api/emails?id=${replyTo}`);
          if (!response.ok) {
            throw new Error('Failed to load message');
          }
          const data = await response.json();
          
          // Create reply data
          setReplyData({
            to: data.from || '',
            subject: `Re: ${data.subject || ''}`,
            body: `\n\nOn ${new Date(data.date).toLocaleString()}, ${data.from} wrote:\n> ${data.text_plain?.split('\n').join('\n> ') || ''}`
          });
        } catch (error) {
          console.error('Error loading message for reply:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    
    if (draftId) {
      loadDraft();
    } else if (replyTo) {
      loadReply();
    }
  }, [draftId, replyTo]);
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Loading...</div>
          <div className="text-gray-500">Preparing your message</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full p-4">
      <MailCompose 
        accountId={accountId} 
        draft={draft} 
        replyTo={replyData}
      />
    </div>
  );
}

export default function ComposePage() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center">Loading...</div>}>
      <ComposeContent />
    </Suspense>
  );
}