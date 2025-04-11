'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive,
  RefreshCw,
  Trash2,
  AlertTriangle,
  Reply,
  ReplyAll,
  Forward,
  Flag,
  FolderClosed,
  Search,
  Filter,
  MessageSquare,
  PenSquare,
  //MoreHorizontal,
  ChevronLeft
} from 'lucide-react';
import { useMailContext } from '@/app/mail/layout';

interface UnifiedToolbarProps {
  currentFolder: string;
  selectedMessageId: number | null;
  selectedAccountId: number;
  onRefresh?: () => Promise<void>;
}

export function UnifiedToolbar({
  currentFolder,
  selectedMessageId,
  selectedAccountId,
  onRefresh
}: UnifiedToolbarProps) {
  const router = useRouter();
  const { resetSelectedMessageId } = useMailContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [accountName, setAccountName] = useState('Account');
  const [messageCount, setMessageCount] = useState(0);

  // Add useEffect to log when the component renders with different selectedMessageId values
  useEffect(() => {
  }, [selectedMessageId]);

  // Fetch account information
  useEffect(() => {
    // Skip the effect if selectedAccountId is not yet available
    if (selectedAccountId === undefined) return;
    
    async function fetchAccountInfo() {
      try {
        // Get accounts
        const accountsResponse = await fetch('/api/accounts');
        const accountsData = await accountsResponse.json();
        
        // Ensure accounts is an array
        const accounts = Array.isArray(accountsData) ? accountsData : [];
        
        // Find the selected account or use the first one
        if (accounts.length > 0) {
          const selectedAccount = accounts.find(account => account.id === selectedAccountId);
          if (selectedAccount) {
            setAccountName(selectedAccount.email || 'Account');
          } else {
            setAccountName(accounts[0].email || 'Account');
          }
        }
        
        // Get folder message count
        const foldersResponse = await fetch(`/api/folders?accountId=${selectedAccountId}`);
        const foldersData = await foldersResponse.json();
        
        // Ensure folders is an array before using array methods
        const folders = Array.isArray(foldersData) ? foldersData : [];
        
        // Find the current folder to get message count
        const folder = folders.find((f) => 
          f.name?.toLowerCase() === currentFolder.toLowerCase()
        );
        
        if (folder && folder.count) {
          setMessageCount(folder.count);
        } else {
          setMessageCount(0);
        }
      } catch (error) {
        console.error('Error fetching account info:', error);
        setMessageCount(0);
      }
    }
    
    fetchAccountInfo();
  }, [currentFolder, selectedAccountId]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Redirect to the current folder with search query parameter
    router.push(`/mail/${currentFolder}?q=${encodeURIComponent(searchQuery)}&accountId=${selectedAccountId}`);
  };

  // Clear search and return to normal folder view
  const handleClearSearch = () => {
    // Get the current URL to extract the actual folder path
    const url = new URL(window.location.href);
    const pathParts = url.pathname.split('/');
    
    // The folder should be the third part of the path: /mail/[folder]
    // If we can't determine it, default to inbox
    let targetFolder = pathParts.length >= 3 ? pathParts[2] : 'inbox';
    
    // If the folder contains special characters (like in "Search: term"), use inbox
    if (targetFolder.includes(':') || targetFolder.includes(' ')) {
      targetFolder = 'inbox';
    }
    
    setSearchQuery('');
    setIsSearching(false);
    
    // Redirect to the appropriate folder without search query parameter
    router.push(`/mail/${targetFolder}?accountId=${selectedAccountId}`);
  };

  // Sync search state with URL
  useEffect(() => {
    // Need to run this effect on component mount and when URL changes
    const syncSearchStateWithUrl = () => {
      try {
        // Check if the URL has a search query parameter
        const url = new URL(window.location.href);
        const hasSearchParam = url.searchParams.has('q');
        
        // Update isSearching state based on URL
        setIsSearching(hasSearchParam);
        
        // If there's a search parameter in the URL, update the search query state
        if (hasSearchParam) {
          const queryParam = url.searchParams.get('q');
          if (queryParam) {
            setSearchQuery(queryParam);
          }
        }
      } catch (error) {
        console.error('Error parsing URL:', error);
      }
    };
    
    // Run on mount and when router changes
    syncSearchStateWithUrl();
    
    // Listen for URL changes (for browser back/forward navigation)
    window.addEventListener('popstate', syncSearchStateWithUrl);
    
    // Clean up listener on unmount
    return () => {
      window.removeEventListener('popstate', syncSearchStateWithUrl);
    };
  }, []);

  // Handle refresh button click
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  // Handle message actions
  const handleArchive = async () => {
    if (!selectedMessageId) return;
    
    try {
      await fetch(`/api/emails/${selectedMessageId}/archive`, {
        method: 'POST',
      });
      router.push(`/mail/${currentFolder}`);
    } catch (error) {
      console.error('Error archiving message:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedMessageId) return;
    
    try {
      await fetch(`/api/emails/${selectedMessageId}/delete`, {
        method: 'POST',
      });
      router.push(`/mail/${currentFolder}`);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const handleMarkAsJunk = async () => {
    if (!selectedMessageId) return;
    
    try {
      await fetch(`/api/emails/${selectedMessageId}/junk`, {
        method: 'POST',
      });
      router.push(`/mail/${currentFolder}`);
    } catch (error) {
      console.error('Error marking message as junk:', error);
    }
  };

  const handleFlag = async () => {
    if (!selectedMessageId) return;
    
    try {
      await fetch(`/api/emails/${selectedMessageId}/flag`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error flagging message:', error);
    }
  };

  return (
    <div className="h-[50px] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white dark:bg-gray-950">
      {/* Left section - Actions */}
      <div className="flex items-center">
        {/* Back button and folder name in a fixed width container */}
        <div style={{ width: '250px', minWidth: '250px', maxWidth: '250px' }} className="flex items-center flex-shrink-0 mr-4 overflow-hidden">
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 mr-2 flex-shrink-0 ${
              selectedMessageId === null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Back to list"
            onClick={() => {
              if (selectedMessageId !== null) {
                // Navigate back to the folder view and reset selectedMessageId
                router.push(`/mail/${currentFolder}`);
                resetSelectedMessageId();
              }
            }}
            disabled={selectedMessageId === null}
          >
            <ChevronLeft className="h-7 w-7" />
          </button>
          
          {/* Always show folder name within the fixed width container - now in two lines */}
          <div className="flex flex-col justify-center flex-1 overflow-hidden">
            <div className="text-xs font-semibold capitalize text-gray-900 dark:text-gray-100 truncate">
              {isSearching ? 'Search' : currentFolder} - {accountName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {/* Placeholder for message count */}
              {messageCount} messages
            </div>
          </div>
        </div>
        
        {/* Mailbox list actions with consistent spacing */}
        <div className="flex items-center space-x-1">
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId !== null ? 'opacity-50' : ''
            }`}
            title="Refresh"
            onClick={handleRefresh}
            disabled={false} // Always enabled
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId !== null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Filter"
            disabled={selectedMessageId !== null}
          >
            <Filter className="h-3.5 w-3.5" />
          </button>
          
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId !== null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Toggle Conversation View"
            disabled={selectedMessageId !== null}
          >
            <MessageSquare className="h-3.5 w-3.5" />
          </button>
          
          <div className="h-6 border-l border-gray-200 dark:border-gray-700 mx-2"></div>
          
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId !== null ? 'opacity-50' : ''
            }`}
            title="Refresh"
            onClick={handleRefresh}
            disabled={false} // Always enabled
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>

          {/* Compose - always enabled and visible */}
          <Link
            href="/mail/compose"
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
            title="Compose"
          >
            <PenSquare className="h-3.5 w-3.5" />
          </Link>
          
          <div className="h-6 border-l border-gray-200 dark:border-gray-700 mx-2"></div>
          
          {/* Message actions - always visible, disabled when not in message view */}
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId === null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Archive"
            onClick={handleArchive}
            disabled={selectedMessageId === null}
          >
            <Archive className="h-3.5 w-3.5" />
          </button>
          
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId === null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Delete"
            onClick={handleDelete}
            disabled={selectedMessageId === null}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId === null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Mark as Junk"
            onClick={handleMarkAsJunk}
            disabled={selectedMessageId === null}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
          </button>
          
          <div className="h-6 border-l border-gray-200 dark:border-gray-700 mx-2"></div>
          
          {/* Reply actions */}
          <Link
            href={selectedMessageId !== null ? `/mail/compose?reply=${selectedMessageId}` : '#'}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId === null ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
            }`}
            title="Reply"
            onClick={e => selectedMessageId === null && e.preventDefault()}
          >
            <Reply className="h-3.5 w-3.5" />
          </Link>
          
          <Link
            href={selectedMessageId !== null ? `/mail/compose?replyAll=${selectedMessageId}` : '#'}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId === null ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
            }`}
            title="Reply All"
            onClick={e => selectedMessageId === null && e.preventDefault()}
          >
            <ReplyAll className="h-3.5 w-3.5" />
          </Link>
          
          <Link
            href={selectedMessageId !== null ? `/mail/compose?forward=${selectedMessageId}` : '#'}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId === null ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
            }`}
            title="Forward"
            onClick={e => selectedMessageId === null && e.preventDefault()}
          >
            <Forward className="h-3.5 w-3.5" />
          </Link>
          
          <div className="h-6 border-l border-gray-200 dark:border-gray-700 mx-2"></div>
          
          {/* More message actions */}
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId === null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Flag"
            onClick={handleFlag}
            disabled={selectedMessageId === null}
          >
            <Flag className="h-3.5 w-3.5" />
          </button>
          
          <button 
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
              selectedMessageId === null ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Move to Folder"
            disabled={selectedMessageId === null}
          >
            <FolderClosed className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      {/* Right section - Search */}
      <div className="relative w-full max-w-md">
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search emails..."
              className={`w-full pl-8 ${isSearching ? 'pr-8' : 'pr-4'} py-1 text-sm border rounded-md 
                         ${isSearching ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'} 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <button 
                type="button"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                title="Clear Search"
                onClick={handleClearSearch}
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}