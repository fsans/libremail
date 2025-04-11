'use client';

import { ReactNode, useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Inbox, 
  Send, 
  FileText as File, 
  Trash2, 
  Settings, 
  User, 
  Plus,
  Menu,
  Archive,
  AlertCircle,
  FolderIcon
} from 'lucide-react';
import { AccountSwitcher } from '@/components/mail/account-switcher';
import { UnifiedToolbar } from '@/components/mail/unified-toolbar';
import { useFolders } from '@/lib/hooks/use-api-queries';
import type { Folder } from '@/lib/db/schema';

interface MailLayoutProps {
  children: ReactNode;
}

// Create a context for mail state
interface MailContextType {
  selectedMessageId: number | null;
  setSelectedMessageId: (id: number | null) => void;
  resetSelectedMessageId: () => void;
  currentFolder: string;
  setCurrentFolder: (folder: string) => void;
}

const MailContext = createContext<MailContextType>({
  selectedMessageId: null,
  setSelectedMessageId: () => {},
  resetSelectedMessageId: () => {},
  currentFolder: 'inbox',
  setCurrentFolder: () => {}
});

// Hook to use the mail context
export function useMailContext() {
  return useContext(MailContext);
}

export default function MailLayout({ children }: MailLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isFileMakerWebViewer, setIsFileMakerWebViewer] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(1); // Default to account ID 1
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>('inbox');
  const router = useRouter();

  // Use React Query hook instead of manual fetch
  const { 
    data: folders = [], 
    isLoading: loading 
  } = useFolders(selectedAccountId);

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
  
  const getStandardFolder = (name: string) => {
    const folder = getStandardFolders().find(f => 
      f.name?.toLowerCase() === name.toLowerCase()
    );
    
    // Add message count if available
    if (folder) {
      return {
        ...folder,
        count: folder.count || 0
      };
    }
    
    return null;
  };

  // Detect if running in FileMaker WebViewer with multiple detection methods
  useEffect(() => {
    function checkFileMakerContext() {
      if (typeof window === 'undefined') return false;
      
      try {
        // Method 1: Direct FileMaker object detection (most reliable)
        if (typeof (window as any).FileMaker === 'object') {
          console.info("FileMaker Context detected via FileMaker object");
          return true;
        }
        
        // Method 2: Check for FileMaker in user agent (some versions)
        if (window.navigator.userAgent.includes('FileMaker')) {
          console.info("FileMaker Context detected via user agent");
          return true;
        }
        
        // Method 3: Force detection for testing (remove in production)
        // Uncomment the next line to force FileMaker mode for testing
        // return true;
        
        return false;
      } catch (e) {
        console.error("Error checking FileMaker context:", e);
        return false;
      }
    }
    
    const isInFileMaker = checkFileMakerContext();
    console.log("FileMaker detection result:", isInFileMaker);
    setIsFileMakerWebViewer(isInFileMaker);
    
    if (isInFileMaker) {
      // Force mobile sidebar to be open always
      setIsMobileSidebarOpen(true);
      
      // Add class to body and html for CSS targeting
      document.documentElement.classList.add('filemaker-webviewer');
      document.body.classList.add('filemaker-webviewer');
      
      // Add specific CSS overrides for FileMaker WebViewer
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        /* FileMaker WebViewer specific overrides - !important flags ensure these take precedence */
        html.filemaker-webviewer,
        body.filemaker-webviewer {
          overflow: hidden !important;
          height: 100% !important;
          width: 100% !important;
        }
        
        /* Force sidebar to be visible and positioned correctly */
        .filemaker-webviewer .sidebar {
          transform: none !important;
          display: block !important;
          position: relative !important;
          left: 0 !important;
          width: 256px !important;
          z-index: 40 !important;
        }
        
        /* Hide mobile toggle in FileMaker */
        .filemaker-webviewer .mobile-toggle {
          display: none !important;
        }
        
        /* Ensure content area adjusts properly */
        .filemaker-webviewer .content-area {
          margin-left: 0 !important;
          width: calc(100% - 256px) !important;
          flex: 1 !important;
        }
        
        /* Override any media queries */
        @media (max-width: 768px) {
          .filemaker-webviewer .sidebar {
            transform: none !important;
            display: block !important;
            position: relative !important;
            width: 256px !important;
          }
          
          .filemaker-webviewer .content-area {
            margin-left: 0 !important;
            width: calc(100% - 256px) !important;
          }
        }
      `;
      document.head.appendChild(styleElement);
      
      // Prevent any resize events from changing the layout
      const preventMobileLayout = () => {
        if (isFileMakerWebViewer) {
          setIsMobileSidebarOpen(true);
        }
      };
      
      window.addEventListener('resize', preventMobileLayout);
      
      return () => {
        window.removeEventListener('resize', preventMobileLayout);
      };
    }
  }, []);

  // Add a useEffect to monitor URL changes and update toolbar state
  useEffect(() => {
    // This function will run on component mount and when the URL changes
    const handleRouteChange = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const isMessageView = /\/mail\/[^\/]+\/\d+$/.test(path);
        
        if (!isMessageView) {
          // If we're not in a message view, ensure selectedMessageId is null
          setSelectedMessageId(null);
        }
      }
    };
    
    // Run once on mount
    handleRouteChange();
    
    // Set up an interval to check for URL changes
    // This is a workaround since Next.js App Router doesn't provide a built-in way to listen for route changes
    const interval = setInterval(handleRouteChange, 100);
    
    return () => clearInterval(interval);
  }, [setSelectedMessageId]);

  // Handle account change
  const handleAccountChange = (accountId: number) => {
    setSelectedAccountId(accountId);
    
    // Reset message selection when changing accounts
    setSelectedMessageId(null);
    
    // Reset to inbox folder when changing accounts
    setCurrentFolder('inbox');
    
    // Navigate to the inbox folder of the new account
    router.push(`/mail/inbox?accountId=${accountId}`);
  };

  // Handle message selection
  const handleMessageSelect = (id: number | null) => {
    // If id is null, just set it directly
    if (id === null) {
      setSelectedMessageId(null);
      return;
    }
    
    // Set the selected message ID (already a number)
    setSelectedMessageId(id);
  };

  // Handle folder selection
  const handleFolderSelect = (folderName: string) => {
    setCurrentFolder(folderName);
    
    // Check if we're in a message view
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const isMessageView = /\/mail\/[^\/]+\/\d+$/.test(path);
      
      if (!isMessageView) {
        // If we're not in a message view, reset the selected message ID
        setSelectedMessageId(null);
      }
    }
  };

  // Handle refresh
  const handleRefresh = async (): Promise<void> => {
    // Force a refresh of the current page
    router.refresh();
    // Return a resolved promise
    return Promise.resolve();
  };

  return (
    <MailContext.Provider value={{
      selectedMessageId,
      setSelectedMessageId: handleMessageSelect,
      resetSelectedMessageId: () => setSelectedMessageId(null),
      currentFolder,
      setCurrentFolder: handleFolderSelect,
    }}>
      <div className={`flex h-screen overflow-hidden bg-white dark:bg-gray-950 ${isFileMakerWebViewer ? 'filemaker-layout' : ''}`}>
        {/* Mobile sidebar toggle - hide in FileMaker WebViewer */}
        <button
          className={`absolute top-4 left-4 z-50 md:hidden ${isFileMakerWebViewer ? 'hidden' : ''} text-gray-700 dark:text-gray-300`}
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Sidebar - force visible and relative positioning in FileMaker WebViewer */}
        <div className={`
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isFileMakerWebViewer ? '!translate-x-0 !relative !block' : ''}
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
          
    
          
          <nav className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="text-center p-4 text-gray-500">Loading folders...</div>
            ) : (
              <>
                <div className="mb-3">
                  <div className="px-2 py-1 text-xs font-medium text-gray-500">
                    Mailboxes
                  </div>
                  <ul className="space-y-0.5">
                    <li>
                      <Link 
                        href={`/mail/inbox?accountId=${selectedAccountId}`}
                        className="flex items-center px-2 py-1.5 text-xs rounded-md hover:bg-gray-200"
                        onClick={() => handleFolderSelect('inbox')}
                      >
                        <Inbox className="h-3.5 w-3.5 mr-2 text-gray-600" />
                        Inbox
                        {(() => {
                          const folder = getStandardFolder('inbox');
                          return folder?.count && folder.count > 0 ? (
                            <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-1.5 py-0.5">
                              {folder.count}
                            </span>
                          ) : null;
                        })()}
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href={`/mail/drafts?accountId=${selectedAccountId}`}
                        className="flex items-center px-2 py-1.5 text-xs rounded-md hover:bg-gray-200"
                        onClick={() => handleFolderSelect('drafts')}
                      >
                        <File className="h-3.5 w-3.5 mr-2 text-gray-600" />
                        Drafts
                        {(() => {
                          const folder = getStandardFolder('drafts');
                          return folder?.count && folder.count > 0 ? (
                            <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-1.5 py-0.5">
                              {folder.count}
                            </span>
                          ) : null;
                        })()}
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href={`/mail/sent?accountId=${selectedAccountId}`}
                        className="flex items-center px-2 py-1.5 text-xs rounded-md hover:bg-gray-200"
                        onClick={() => handleFolderSelect('sent')}
                      >
                        <Send className="h-3.5 w-3.5 mr-2 text-gray-600" />
                        Sent
                        {(() => {
                          const folder = getStandardFolder('sent');
                          return folder?.count && folder.count > 0 ? (
                            <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-1.5 py-0.5">
                              {folder.count}
                            </span>
                          ) : null;
                        })()}
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href={`/mail/junk?accountId=${selectedAccountId}`}
                        className="flex items-center px-2 py-1.5 text-xs rounded-md hover:bg-gray-200"
                        onClick={() => handleFolderSelect('junk')}
                      >
                        <AlertCircle className="h-3.5 w-3.5 mr-2 text-gray-600" />
                        Junk
                        {(() => {
                          const folder = getStandardFolder('junk');
                          return folder?.count && folder.count > 0 ? (
                            <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-1.5 py-0.5">
                              {folder.count}
                            </span>
                          ) : null;
                        })()}
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href={`/mail/trash?accountId=${selectedAccountId}`}
                        className="flex items-center px-2 py-1.5 text-xs rounded-md hover:bg-gray-200"
                        onClick={() => handleFolderSelect('trash')}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2 text-gray-600" />
                        Trash
                        {(() => {
                          const folder = getStandardFolder('trash');
                          return folder?.count && folder.count > 0 ? (
                            <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-1.5 py-0.5">
                              {folder.count}
                            </span>
                          ) : null;
                        })()}
                      </Link>
                    </li>
                    <li>
                      <Link 
                        href={`/mail/archive?accountId=${selectedAccountId}`}
                        className="flex items-center px-2 py-1.5 text-xs rounded-md hover:bg-gray-200"
                        onClick={() => handleFolderSelect('archive')}
                      >
                        <Archive className="h-3.5 w-3.5 mr-2 text-gray-600" />
                        Archive
                        {(() => {
                          const folder = getStandardFolder('archive');
                          return folder?.count && folder.count > 0 ? (
                            <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-1.5 py-0.5">
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
                  <div className="mt-3 mb-2">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500">
                      Folders
                    </div>
                    <ul className="space-y-0.5">
                      {getCustomFolders().map((folder) => (
                        <li key={folder.id}>
                          <Link 
                            href={`/mail/${folder.name?.toLowerCase()}?accountId=${selectedAccountId}`}
                            className="flex items-center px-2 py-1.5 text-xs rounded-md hover:bg-gray-200"
                            onClick={() => folder.name && handleFolderSelect(folder.name)}
                          >
                            <FolderIcon className="h-3.5 w-3.5 mr-2 text-gray-600" />
                            <span className="truncate">{folder.name}</span>
                            {(() => {
                              return folder.count && folder.count > 0 ? (
                                <span className="ml-auto bg-gray-200 text-gray-700 text-xs rounded-full px-1.5 py-0.5">
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
        </div>
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Unified toolbar */}
          <UnifiedToolbar 
            currentFolder={currentFolder}
            selectedMessageId={selectedMessageId}
            selectedAccountId={selectedAccountId}
            onRefresh={handleRefresh}
          />
          
          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </MailContext.Provider>
  );
}