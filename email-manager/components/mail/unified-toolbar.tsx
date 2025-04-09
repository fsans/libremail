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
  MoreHorizontal,
  ChevronLeft
} from 'lucide-react';

interface UnifiedToolbarProps {
  currentFolder: string;
  selectedMessageId: number | null;
  onRefresh?: () => Promise<void>;
}

export function UnifiedToolbar({
  currentFolder,
  selectedMessageId,
  onRefresh
}: UnifiedToolbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Debug the selectedMessageId value
  console.log('UnifiedToolbar selectedMessageId:', selectedMessageId);
  console.log('UnifiedToolbar selectedMessageId type:', typeof selectedMessageId);
  console.log('Condition result:', selectedMessageId !== null && selectedMessageId !== undefined);
  
  // Add useEffect to log when the component renders with different selectedMessageId values
  useEffect(() => {
    console.log('UnifiedToolbar useEffect - selectedMessageId:', selectedMessageId);
  }, [selectedMessageId]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    // Redirect to search results page
    router.push(`/mail/search?q=${encodeURIComponent(searchQuery)}&folder=${currentFolder}`);
  };

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
    <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 bg-white dark:bg-gray-950">
      {/* Left section - Actions */}
      <div className="flex items-center space-x-1">
        {/* Back button - only active when viewing a message */}
        <button 
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 mr-1 ${
            selectedMessageId === null ? 'opacity-50 cursor-not-allowed hidden' : ''
          }`}
          title="Back to list"
          onClick={() => {
            if (selectedMessageId !== null) {
              // Navigate back to the folder view
              router.push(`/mail/${currentFolder}`);
            }
          }}
          disabled={selectedMessageId === null}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        {/* Always show folder name */}
        <h2 className="text-lg font-semibold capitalize text-gray-900 dark:text-gray-100 mr-4">
          {currentFolder}
        </h2>
        
        {/* Mailbox list actions - always visible, disabled when not in list view */}
        <button 
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
            selectedMessageId !== null ? 'opacity-50' : ''
          }`}
          title="Refresh"
          onClick={handleRefresh}
          disabled={false} // Always enabled
        >
          <RefreshCw className="h-5 w-5" />
        </button>
        
        <button 
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
            selectedMessageId !== null ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Filter"
          disabled={selectedMessageId !== null}
        >
          <Filter className="h-5 w-5" />
        </button>
        
        <button 
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
            selectedMessageId !== null ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Toggle Conversation View"
          disabled={selectedMessageId !== null}
        >
          <MessageSquare className="h-5 w-5" />
        </button>
        
        <div className="h-8 border-l border-gray-200 dark:border-gray-700 mx-2"></div>
        
        {/* Message actions - always visible, disabled when not in message view */}
        <button 
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
            selectedMessageId === null ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Archive"
          onClick={handleArchive}
          disabled={selectedMessageId === null}
        >
          <Archive className="h-5 w-5" />
        </button>
        
        <button 
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
            selectedMessageId === null ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Delete"
          onClick={handleDelete}
          disabled={selectedMessageId === null}
        >
          <Trash2 className="h-5 w-5" />
        </button>
        
        <button 
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
            selectedMessageId === null ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Mark as Junk"
          onClick={handleMarkAsJunk}
          disabled={selectedMessageId === null}
        >
          <AlertTriangle className="h-5 w-5" />
        </button>
        
        <div className="h-8 border-l border-gray-200 dark:border-gray-700 mx-2"></div>
        
        {/* Reply actions */}
        <Link
          href={selectedMessageId !== null ? `/mail/compose?reply=${selectedMessageId}` : '#'}
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
            selectedMessageId === null ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
          }`}
          title="Reply"
          onClick={e => selectedMessageId === null && e.preventDefault()}
        >
          <Reply className="h-5 w-5" />
        </Link>
        
        <Link
          href={selectedMessageId !== null ? `/mail/compose?replyAll=${selectedMessageId}` : '#'}
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
            selectedMessageId === null ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
          }`}
          title="Reply All"
          onClick={e => selectedMessageId === null && e.preventDefault()}
        >
          <ReplyAll className="h-5 w-5" />
        </Link>
        
        <Link
          href={selectedMessageId !== null ? `/mail/compose?forward=${selectedMessageId}` : '#'}
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
            selectedMessageId === null ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
          }`}
          title="Forward"
          onClick={e => selectedMessageId === null && e.preventDefault()}
        >
          <Forward className="h-5 w-5" />
        </Link>
        
        <div className="h-8 border-l border-gray-200 dark:border-gray-700 mx-2"></div>
        
        {/* More message actions */}
        <button 
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
            selectedMessageId === null ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Flag"
          onClick={handleFlag}
          disabled={selectedMessageId === null}
        >
          <Flag className="h-5 w-5" />
        </button>
        
        <button 
          className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 ${
            selectedMessageId === null ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title="Move to Folder"
          disabled={selectedMessageId === null}
        >
          <FolderClosed className="h-5 w-5" />
        </button>
        
        <div className="h-8 border-l border-gray-200 dark:border-gray-700 mx-2 md:inline-block hidden"></div>
        
        {/* Compose - always enabled */}
        <Link
          href="/mail/compose"
          className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 md:inline-block hidden"
          title="Compose"
        >
          <PenSquare className="h-5 w-5" />
        </Link>
      </div>
      
      {/* Right section - Search */}
      <div className="relative w-full max-w-md">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search emails..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}