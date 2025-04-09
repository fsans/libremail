'use client';

import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Inbox, 
  Send, 
  FileText, 
  Trash2, 
  Archive, 
  AlertCircle,
  FolderIcon,
  User,
  Plus,
  Settings,
  Search,
  Bell,
  HelpCircle,
  Menu as MenuIcon,
  RefreshCw,
  PenSquare
} from 'lucide-react';
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
      (f.name?.toLowerCase() === name.toLowerCase()) || 
      (name === 'junk' && f.name?.toLowerCase() === 'spam') ||
      (name === 'trash' && f.name?.toLowerCase() === 'bin')
    );
  };
  
  const getCustomFolders = () => {
    return folders.filter(f => 
      f.name && !standardMailboxes.includes(f.name.toLowerCase())
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
      <div className="w-64 flex-shrink-0 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-bold">EmailManager</h1>
          </div>
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
                      <Inbox className="h-4 w-4 mr-2 text-gray-600" />
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
                      <FileText className="h-4 w-4 mr-2 text-gray-600" />
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
                      <Send className="h-4 w-4 mr-2 text-gray-600" />
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
                      <AlertCircle className="h-4 w-4 mr-2 text-gray-600" />
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
                      <Trash2 className="h-4 w-4 mr-2 text-gray-600" />
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
                      <Archive className="h-4 w-4 mr-2 text-gray-600" />
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
                          <FolderIcon className="h-4 w-4 mr-2 text-gray-600" />
                          <span className="truncate">{folder.name}</span>
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
            <Plus className="h-4 w-4 mr-2 text-white" />
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
                <Search className="h-4 w-4" />
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-full hover:bg-gray-100" title="Get Mail">
              <RefreshCw className="h-5 w-5 text-gray-600" />
            </button>
            <Link
              href={`/mail/compose?accountId=${selectedAccountId}`}
              className="p-2 rounded-full hover:bg-gray-100"
              title="New Message"
            >
              <PenSquare className="h-5 w-5 text-gray-600" />
            </Link>
            
            <div className="h-8 border-l border-gray-300 mx-2"></div>
            
            <button className="p-2 rounded-full hover:bg-gray-100" title="Notifications">
              <Bell className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100" title="Settings">
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100" title="Help">
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100" title="Account">
              <User className="h-5 w-5 text-gray-600" />
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