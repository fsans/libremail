'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MailDisplay } from '@/components/mail/mail-display';
import type { Message } from '@/lib/db/schema';
import { useMailContext } from '@/app/mail/layout';

export default function MessagePage() {
  const params = useParams();
  const router = useRouter();
  const messageId = params.id as string;
  const { setSelectedMessageId, setCurrentFolder } = useMailContext();
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<Message | null>(null);
  
  useEffect(() => {
    async function loadMessage() {
      setLoading(true);
      try {
        const response = await fetch(`/api/emails?id=${messageId}`);
        if (!response.ok) {
          throw new Error('Failed to load message');
        }
        const data = await response.json();
        setMessage(data);
        
        // Update the selected message ID in the context
        const numericMessageId = Number(messageId);
        console.log('Setting selectedMessageId in MessagePage:', numericMessageId);
        console.log('MessageId type before conversion:', typeof messageId);
        console.log('MessageId type after conversion:', typeof numericMessageId);
        setSelectedMessageId(numericMessageId);
        
        // Update the current folder in the context
        if (params.folder) {
          setCurrentFolder(params.folder as string);
        }
      } catch (error) {
        console.error('Error loading message:', error);
        router.push(`/mail/${params.folder}`);
      } finally {
        setLoading(false);
      }
    }
    
    loadMessage();
    
    // No cleanup function - we'll let navigation handle this
    // This prevents issues with Fast Refresh during development
  }, [messageId, params.folder, router, setSelectedMessageId, setCurrentFolder]);
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Loading...</div>
          <div className="text-gray-500">Fetching message content</div>
        </div>
      </div>
    );
  }
  
  if (!message) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Message not found</div>
          <div className="text-gray-500">
            The message you're looking for doesn't exist or was deleted
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <MailDisplay message={message} />
    </div>
  );
}