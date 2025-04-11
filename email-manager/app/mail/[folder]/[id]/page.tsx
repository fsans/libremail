'use client';

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MailDisplay } from '@/components/mail/mail-display';
import { useEmail } from '@/lib/hooks/use-api-queries';
import type { Message } from '@/lib/db/schema';
import { useMailContext } from '@/app/mail/layout';

export default function MessagePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const messageId = Number(params.id as string);
  
  // Get account ID from URL query parameter or use default
  const accountIdParam = searchParams.get('accountId');
  const accountId = accountIdParam ? Number(accountIdParam) : 1;
  
  const { setSelectedMessageId, setCurrentFolder } = useMailContext();
  
  // Use React Query hook for email
  const { 
    data: message, 
    isLoading: loading,
    isError,
    error
  } = useEmail(messageId, accountId);
  
  // Update the selected message ID and current folder in the context
  useEffect(() => {
    if (messageId) {
      console.log('Setting selectedMessageId in MessagePage:', messageId);
      console.log('MessageId type:', typeof messageId);
      setSelectedMessageId(messageId);
    }
    
    // Update the current folder in the context
    if (params.folder) {
      setCurrentFolder(params.folder as string);
    }
    
    // No cleanup function - we'll let navigation handle this
    // This prevents issues with Fast Refresh during development
  }, [messageId, params.folder, setSelectedMessageId, setCurrentFolder]);
  
  // Handle error by redirecting to folder page
  useEffect(() => {
    if (isError) {
      console.error('Error loading message:', error);
      router.push(`/mail/${params.folder}?accountId=${accountId}`);
    }
  }, [isError, error, router, params.folder, accountId]);
  
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