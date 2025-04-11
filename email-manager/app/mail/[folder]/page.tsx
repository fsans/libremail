'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MailList } from '@/components/mail/mail-list';
import { useFolders, useMultipleFolderEmails } from '@/lib/hooks/use-api-queries';
import type { Message, Folder } from '@/lib/db/schema';

export default function FolderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const folderName = params.folder as string;
  
  // Get account ID from URL query parameter or use default
  const accountIdParam = searchParams.get('accountId');
  const accountId = accountIdParam ? Number(accountIdParam) : 1;
  
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [relatedFolders, setRelatedFolders] = useState<Folder[]>([]);
  const [folderIds, setFolderIds] = useState<number[]>([]);
  
  // Standard mailbox names (case insensitive)
  const standardMailboxes = ['inbox', 'drafts', 'sent', 'junk', 'spam', 'trash', 'bin', 'archive'];
  
  // Check if the current folder is a standard mailbox
  const isStandardMailbox = standardMailboxes.includes(folderName.toLowerCase());
  
  // Use React Query to fetch folders
  const { 
    data: folders = [], 
    isLoading: foldersLoading 
  } = useFolders(accountId);
  
  // Use React Query to fetch emails from multiple folders
  const { 
    data: messages = [], 
    isLoading: messagesLoading 
  } = useMultipleFolderEmails(folderIds, accountId);
  
  // Find related folders when folders data is available
  useEffect(() => {
    if (!folders.length) return;
    
    if (isStandardMailbox) {
      // For standard mailboxes, find all related folders
      // For example, for "Sent" find both "Sent" and "INBOX.Sent"
      const related = folders.filter((f: Folder) => {
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
      
      // Extract folder IDs for email fetching
      setFolderIds(related.map(f => f.id));
    } else {
      // For custom folders, just find the exact match
      const folder = folders.find((f: Folder) => 
        f.name?.toLowerCase() === folderName.toLowerCase()
      );
      
      if (folder) {
        setCurrentFolder(folder);
        setRelatedFolders([folder]);
        setFolderIds([folder.id]);
      }
    }
  }, [folders, folderName, isStandardMailbox]);
  
  const loading = foldersLoading || messagesLoading || !currentFolder;
  
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