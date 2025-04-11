'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Mail, 
  Search, 
  Inbox, 
  Send, 
  File, 
  Trash2, 
  Settings, 
  //User, 
  //Plus,
  Menu,
  Archive,
  AlertCircle
} from 'lucide-react';
import { AccountSwitcher } from '@/components/mail/account-switcher';
import type { Folder } from '@/lib/db/schema';

export default function MailLayout({ children }: { children: React.ReactNode }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(1); // Default to account ID 1
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper functions for folder categorization
  const getStandardFolders = () => {
    const standardNames = ['inbox', 'drafts', 'sent', 'junk', 'spam', 'trash', 'bin', 'archive'];
    return folders.filter(f => 
      f.name && standardNames.includes(f.name.toLowerCase())
    );
  };

  const getCustomFolders = () => {
    const standardNames = ['inbox', 'drafts', 'sent', 'junk', 'spam', 'trash', 'bin', 'archive'];
    return folders.filter(f => 
      f.name && !standardNames.includes(f.name.toLowerCase())
    );
  };

  // Load folders when account changes
  useEffect(() => {
    async function loadFolders() {
      setLoading(true);
      try {
        const response = await fetch(`/api/folders?accountId=${selectedAccountId}`);
        const data = await response.json();
        setFolders(data);
      } catch (error) {
        console.error('Error loading folders:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadFolders();
  }, [selectedAccountId]);

  const handleAccountChange = (accountId: number) => {
    setSelectedAccountId(accountId);
    
    // Update the URL with the new account ID
    const url = new URL(window.location.href);
    url.searchParams.set('accountId', accountId.toString());
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-950">
      {/* Mobile sidebar toggle */}
      <button
        className="absolute top-4 left-4 z-50 md:hidden text-gray-700 dark:text-gray-300"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <div className={`
        ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-200 ease-in-out
        w-64 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex flex-col h-full md:relative absolute z-40
      `}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">EmailManager</h1>
          </div>
        </div>
        
        {/* Account Switcher */}
        <div className="p-2 border-b border-gray-200 dark:border-gray-800">
          <AccountSwitcher 
            selectedAccountId={selectedAccountId}
            onAccountChange={handleAccountChange}
          />
        </div>
        
        <nav className="flex-1 overflow-auto p-2">
          {loading ? (
            <div className="text-center p-4 text-gray-500 dark:text-gray-400">Loading folders...</div>
          ) : (
            <div className="space-y-1">
              {/* Standard folders */}
              {getStandardFolders().map((folder) => (
                <Link
                  key={folder.id}
                  href={`/mail/${folder.name?.toLowerCase()}`}
                  className="flex items-center px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                >
                  {folder.name?.toLowerCase() === 'inbox' && <Inbox className="h-4 w-4 mr-2" />}
                  {folder.name?.toLowerCase() === 'sent' && <Send className="h-4 w-4 mr-2" />}
                  {folder.name?.toLowerCase() === 'drafts' && <File className="h-4 w-4 mr-2" />}
                  {(folder.name?.toLowerCase() === 'trash' || folder.name?.toLowerCase() === 'bin') && 
                    <Trash2 className="h-4 w-4 mr-2" />}
                  {folder.name?.toLowerCase() === 'archive' && <Archive className="h-4 w-4 mr-2" />}
                  {(folder.name?.toLowerCase() === 'junk' || folder.name?.toLowerCase() === 'spam') && 
                    <AlertCircle className="h-4 w-4 mr-2" />}
                  <span className="truncate">{folder.name}</span>
                  {folder.count && folder.count > 0 ? (
                    <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                      {folder.count}
                    </span>
                  ) : null}
                </Link>
              ))}
              
              {/* Custom folders */}
              {getCustomFolders().length > 0 && (
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Folders
                  </h3>
                  <div className="mt-2 space-y-1">
                    {getCustomFolders().map((folder) => (
                      <Link
                        key={folder.id}
                        href={`/mail/${folder.name?.toLowerCase()}`}
                        className="flex items-center px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      >
                        <span className="truncate">{folder.name}</span>
                        {folder.count && folder.count > 0 ? (
                          <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full px-2 py-0.5">
                            {folder.count}
                          </span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Settings</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage your account</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-4 bg-white dark:bg-gray-950">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <input
              type="search"
              placeholder="Search emails..."
              className="w-full pl-8 h-9 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 text-sm shadow-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}