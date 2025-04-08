import { ReactNode } from 'react';
import Link from 'next/link';

interface MailLayoutProps {
  children: ReactNode;
}

export default function MailLayout({ children }: MailLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">LibreMail</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="mb-4">
            <div className="px-3 py-2 text-sm font-medium text-gray-500">
              Mailboxes
            </div>
            <ul className="space-y-1">
              <li>
                <Link 
                  href="/mail/inbox"
                  className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                >
                  <span className="mr-2">📥</span>
                  Inbox
                </Link>
              </li>
              <li>
                <Link 
                  href="/mail/sent"
                  className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                >
                  <span className="mr-2">📤</span>
                  Sent
                </Link>
              </li>
              <li>
                <Link 
                  href="/mail/drafts"
                  className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                >
                  <span className="mr-2">📝</span>
                  Drafts
                </Link>
              </li>
              <li>
                <Link 
                  href="/mail/trash"
                  className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                >
                  <span className="mr-2">🗑️</span>
                  Trash
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <div className="px-3 py-2 text-sm font-medium text-gray-500">
              Folders
            </div>
            <ul className="space-y-1">
              {/* This will be populated dynamically */}
              <li>
                <Link 
                  href="/mail/archive"
                  className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                >
                  <span className="mr-2">🗂️</span>
                  Archive
                </Link>
              </li>
              <li>
                <Link 
                  href="/mail/spam"
                  className="flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-200"
                >
                  <span className="mr-2">⚠️</span>
                  Spam
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <Link
            href="/mail/compose"
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