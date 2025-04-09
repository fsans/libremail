'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { AccountSwitcher } from '@/components/mail/account-switcher';
import type { Folder } from '@/lib/db/schema';

interface MailLayoutProps {
  children: ReactNode;
}

export default function MailLayout({ children }: MailLayoutProps) {
  const [selectedAccountId, setSelectedAccountId] = useState(1); // Default to account ID 1
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Standard mailbox names (case insensitive)
  const standardMailboxes = ['inbox', 'drafts', 'sent', 'junk', 'spam', 'trash', 'bin', 'archive'];
  
  // Filter folders into standard and custom
  const getStandardFolder = (name: string) => {
    return folders.find(f => 
      f.name?.toLowerCase() === name.toLowerCase() || 
      (name === 'junk' && f.name?.toLowerCase() === 'spam') ||
      (name === 'trash' && f.name?.toLowerCase() === 'bin')
    );
  };
  
  const getCustomFolders = () => {
    return folders.filter(f => 
      !standardMailboxes.includes(f.name?.toLowerCase() || '')
    );
  };

  const handleAccountChange = (accountId: number) => {
    setSelectedAccountId(accountId);
    
    // Update the URL with the new account ID
    const url = new URL(window.location.href);
    url.searchParams.set('accountId', accountId.toString());
    window.history.pushState({}, '', url.toString());
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">LibreMail</h1>
        </div>
        
        {/* Account Switcher */}
        <div className="p-2 border-b border-gray-200">
          <AccountSwitcher 
            selectedAccountId={selectedAccountId} 
            onAccountChange={handleAccountChange} 
          />
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="text-center p-4 text-gray-500">Loading folders...</div>
          ) : (
            <>
              <div className="mb-4">
                <div className="px-3 py-2 text-sm font-medium text-gray-500">
                  Mailboxes
                </div>
                <ul className="space-y-1">
                  <li>
                    <Link 
                      href={`/mail/inbox?accountId=${selectedAccountId}`}
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                    >
                      <span className="mr-2">📥</span>
                      Inbox
                      {(() => {
                        const folder = getStandardFolder('inbox');
                        return folder?.count && folder.count > 0 ? (
                          <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                            {folder.count}
                          </span>
                        ) : null;
                      })()}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/mail/drafts?accountId=${selectedAccountId}`}
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                    >
                      <span className="mr-2">📝</span>
                      Drafts
                      {(() => {
                        const folder = getStandardFolder('drafts');
                        return folder?.count && folder.count > 0 ? (
                          <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                            {folder.count}
                          </span>
                        ) : null;
                      })()}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/mail/sent?accountId=${selectedAccountId}`}
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                    >
                      <span className="mr-2">📤</span>
                      Sent
                      {(() => {
                        const folder = getStandardFolder('sent');
                        return folder?.count && folder.count > 0 ? (
                          <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                            {folder.count}
                          </span>
                        ) : null;
                      })()}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/mail/junk?accountId=${selectedAccountId}`}
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                    >
                      <span className="mr-2">⚠️</span>
                      Junk
                      {(() => {
                        const folder = getStandardFolder('junk');
                        return folder?.count && folder.count > 0 ? (
                          <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                            {folder.count}
                          </span>
                        ) : null;
                      })()}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/mail/trash?accountId=${selectedAccountId}`}
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                    >
                      <span className="mr-2">🗑️</span>
                      Trash
                      {(() => {
                        const folder = getStandardFolder('trash');
                        return folder?.count && folder.count > 0 ? (
                          <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                            {folder.count}
                          </span>
                        ) : null;
                      })()}
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href={`/mail/archive?accountId=${selectedAccountId}`}
                      className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                    >
                      <span className="mr-2">🗂️</span>
                      Archive
                      {(() => {
                        const folder = getStandardFolder('archive');
                        return folder?.count && folder.count > 0 ? (
                          <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                            {folder.count}
                          </span>
                        ) : null;
                      })()}
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Custom folders */}
              {getCustomFolders().length > 0 && (
                <div>
                  <div className="px-3 py-2 text-sm font-medium text-gray-500">
                    Folders
                  </div>
                  <ul className="space-y-1">
                    {getCustomFolders().map((folder) => (
                      <li key={folder.id}>
                        <Link 
                          href={`/mail/${folder.name?.toLowerCase()}?accountId=${selectedAccountId}`}
                          className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                        >
                          <span className="mr-2">📁</span>
                          {folder.name}
                          {(() => {
                            return folder.count && folder.count > 0 ? (
                              <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-2 py-0.5">
                                {folder.count}
                              </span>
                            ) : null;
                          })()}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Link
            href={`/mail/compose?accountId=${selectedAccountId}`}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Compose
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-gray-200 flex items-center px-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search emails..."
                className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute left-3 top-2.5 text-gray-400">
                🔍
              </span>
            </div>
          </div>
          <div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span>👤</span>
            </button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}