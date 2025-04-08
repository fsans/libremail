'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MailList } from '@/components/mail/mail-list';
import type { Message, Folder } from '@/lib/db/schema';

export default function FolderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const folderName = params.folder as string;
  
  // Get account ID from URL query parameter or use default
  const accountIdParam = searchParams.get('accountId');
  const accountId = accountIdParam ? Number(accountIdParam) : 1;
  
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  
  useEffect(() => {
    async function loadFolders() {
      try {
        const response = await fetch(`/api/folders?accountId=${accountId}`);
        const data = await response.json();
        
        // Find the current folder
        const folder = data.find((f: Folder) => 
          f.name?.toLowerCase() === folderName.toLowerCase()
        );
        
        if (folder) {
          setCurrentFolder(folder);
        }
      } catch (error) {
        console.error('Error loading folders:', error);
      }
    }
    
    loadFolders();
  }, [accountId, folderName]);
  
  useEffect(() => {
    async function loadMessages() {
      if (!currentFolder) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/emails?folderId=${currentFolder.id}&accountId=${accountId}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMessages();
  }, [currentFolder, accountId]);
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Loading...</div>
          <div className="text-gray-500">Fetching your emails</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      <MailList 
        messages={messages} 
        currentFolder={folderName} 
      />
    </div>
  );
}