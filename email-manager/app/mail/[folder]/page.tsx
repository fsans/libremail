'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MailList } from '@/components/mail/mail-list';
import { useFolders, useMultipleFolderEmails, useSearchEmails } from '@/lib/hooks/use-api-queries';
import type { Folder, Message } from '@/lib/db/schema';

export default function FolderPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const folderName = params.folder as string;
  
  // Get account ID from URL query parameter or use default
  const accountIdParam = searchParams.get('accountId');
  const accountId = accountIdParam ? Number(accountIdParam) : 1;
  
  // Get search query if present
  const searchQuery = searchParams.get('q');
  const isSearchMode = !!searchQuery;
  
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
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
  
  // Use React Query to fetch emails from multiple folders (when not searching)
  const { 
    data: folderMessages = [], 
    isLoading: folderMessagesLoading 
  } = useMultipleFolderEmails(folderIds, accountId);
  
  // Use React Query to search emails (when searching)
  const {
    data: searchResults = [],
    isLoading: searchLoading
  } = useSearchEmails(accountId, searchQuery);
  
  // Determine which messages to display based on whether we're searching or not
  const messages = isSearchMode ? searchResults : folderMessages;
  const messagesLoading = isSearchMode ? searchLoading : folderMessagesLoading;
  
  // Find related folders when folders data is available
  useEffect(() => {
    // Skip if we don't have folders data yet
    if (!folders.length) return;
    
    // Always set up the folder IDs regardless of search mode
    // This ensures we have folder data ready when search is cleared
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
        setFolderIds([folder.id]);
      }
    }
  }, [folders, folderName, isStandardMailbox, isSearchMode]);
  
  // Determine loading state based on different conditions
  const loading = foldersLoading || 
                 (isSearchMode ? searchLoading : folderMessagesLoading) || 
                 // Only show loading if we're not in search mode, don't have a folder, 
                 // and we've already loaded the folders list (to prevent infinite loading)
                 (!isSearchMode && !currentFolder && folders.length > 0);
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">Loading...</div>
          <div className="text-gray-500">
            {isSearchMode 
              ? `Searching for "${searchQuery}"...` 
              : 'Fetching your emails'}
          </div>
        </div>
      </div>
    );
  }
  
  // For search results with no matches
  if (isSearchMode && messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-2">No results found</div>
          <div className="text-gray-500">
            No emails matching "{searchQuery}" were found
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full">
      {isSearchMode && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">
            Search Results: "{searchQuery}"
          </h2>
          <p className="text-sm text-gray-500">
            {messages.length} {messages.length === 1 ? 'result' : 'results'} found
          </p>
        </div>
      )}
      
      <MailList 
        messages={messages} 
        currentFolder={folderName}
        isSearchMode={isSearchMode}
        searchQuery={searchQuery}
      />
    </div>
  );
}