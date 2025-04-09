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
  const [relatedFolders, setRelatedFolders] = useState<Folder[]>([]);
  
  // Standard mailbox names (case insensitive)
  const standardMailboxes = ['inbox', 'drafts', 'sent', 'junk', 'spam', 'trash', 'bin', 'archive'];
  
  // Check if the current folder is a standard mailbox
  const isStandardMailbox = standardMailboxes.includes(folderName.toLowerCase());
  
  useEffect(() => {
    async function loadFolders() {
      try {
        const response = await fetch(`/api/folders?accountId=${accountId}`);
        const data = await response.json();
        
        if (isStandardMailbox) {
          // For standard mailboxes, find all related folders
          // For example, for "Sent" find both "Sent" and "INBOX.Sent"
          const related = data.filter((f: Folder) => {
            const name = f.name?.toLowerCase() || '';
            
            // Direct match (e.g., "sent" matches "Sent")
            if (name === folderName.toLowerCase()) return true;
            
            // INBOX prefix match (e.g., "inbox.sent" matches "Sent")
            if (name.startsWith('inbox.') && name.substring(6) === folderName.toLowerCase()) return true;
            
            // Special cases for alternative names
            if (folderName.toLowerCase() === 'junk' && name === 'spam') return true;
            if (folderName.toLowerCase() === 'junk' && name === 'inbox.spam') return true;
            if (folderName.toLowerCase() === 'trash' && name === 'bin') return true;
            if (folderName.toLowerCase() === 'trash' && name === 'inbox.bin') return true;
            
            return false;
          });
          
          setRelatedFolders(related);
          
          // Set the primary folder for display purposes
          const primaryFolder = related.find((f: Folder) => 
            f.name?.toLowerCase() === folderName.toLowerCase()
          ) || related[0];
          
          if (primaryFolder) {
            setCurrentFolder(primaryFolder);
          }
        } else {
          // For custom folders, just find the exact match
          const folder = data.find((f: Folder) => 
            f.name?.toLowerCase() === folderName.toLowerCase()
          );
          
          if (folder) {
            setCurrentFolder(folder);
            setRelatedFolders([folder]);
          }
        }
      } catch (error) {
        console.error('Error loading folders:', error);
      }
    }
    
    loadFolders();
  }, [accountId, folderName, isStandardMailbox]);
  
  useEffect(() => {
    async function loadMessages() {
      if (relatedFolders.length === 0) return;
      
      setLoading(true);
      try {
        // For standard mailboxes, fetch messages from all related folders
        const allMessages: Message[] = [];
        
        // Fetch messages from each related folder
        for (const folder of relatedFolders) {
          const response = await fetch(`/api/emails?folderId=${folder.id}&accountId=${accountId}`);
          const data = await response.json();
          allMessages.push(...data);
        }
        
        // Sort all messages by date (newest first)
        allMessages.sort((a: Message, b: Message) => {
          return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        });
        
        setMessages(allMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadMessages();
  }, [relatedFolders, accountId]);
  
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