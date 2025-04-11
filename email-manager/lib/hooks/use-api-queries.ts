import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Account, Folder, Message, Attachment } from '@/lib/db/schema';

// Module-level cache for accounts and folders
// This ensures data is only fetched once per session, regardless of React Query cache
const CACHE = {
  accounts: null as Account[] | null,
  folders: {} as Record<number, Folder[]>,
  accountsPromise: null as Promise<Account[]> | null,
  foldersPromises: {} as { [accountId: number]: Promise<Folder[]> | undefined }
};

// Fetch accounts with module-level caching
export function useAccounts() {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async () => {
      // If we already have accounts data cached, return it immediately
      if (CACHE.accounts) {
        console.log('Using cached accounts data (module cache)');
        return CACHE.accounts;
      }
      
      // If we're already fetching accounts, reuse the promise
      if (CACHE.accountsPromise) {
        console.log('Reusing in-flight accounts request');
        return CACHE.accountsPromise;
      }
      
      // Otherwise, fetch accounts from API
      console.log('Fetching accounts from API (first time)');
      CACHE.accountsPromise = fetch('/api/accounts')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch accounts');
          }
          return response.json();
        })
        .then(data => {
          // Store the result in our cache
          CACHE.accounts = data;
          return data;
        })
        .catch(error => {
          // Clear the promise on error so we can retry
          CACHE.accountsPromise = null;
          throw error;
        });
      
      return CACHE.accountsPromise;
    },
    staleTime: Infinity, // Never consider accounts stale (manual refresh only)
    gcTime: Infinity, // Never garbage collect accounts data
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Manual refresh function for accounts
export function refreshAccounts() {
  const queryClient = useQueryClient();
  
  console.log('Manually refreshing accounts data');
  CACHE.accounts = null;
  CACHE.accountsPromise = null;
  
  // Force React Query to refetch
  return queryClient.invalidateQueries({ queryKey: ['accounts'] });
}

// Fetch folders for an account with module-level caching
export function useFolders(accountId: number) {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['folders', accountId],
    queryFn: async () => {
      // If we already have folders data cached for this account, return it immediately
      if (CACHE.folders[accountId]) {
        console.log(`Using cached folders data for account ${accountId} (module cache)`);
        return CACHE.folders[accountId];
      }
      
      // If we're already fetching folders for this account, reuse the promise
      if (CACHE.foldersPromises[accountId]) {
        console.log(`Reusing in-flight folders request for account ${accountId}`);
        return CACHE.foldersPromises[accountId];
      }
      
      // Otherwise, fetch folders from API
      console.log(`Fetching folders from API for account ${accountId} (first time)`);
      CACHE.foldersPromises[accountId] = fetch(`/api/folders?accountId=${accountId}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch folders');
          }
          return response.json();
        })
        .then(data => {
          // Store the result in our cache
          CACHE.folders[accountId] = data;
          return data;
        })
        .catch(error => {
          // Clear the promise on error so we can retry
          delete CACHE.foldersPromises[accountId];
          throw error;
        });
      
      return CACHE.foldersPromises[accountId];
    },
    enabled: !!accountId, // Only run if accountId is provided
    staleTime: Infinity, // Never consider folders stale (manual refresh only)
    gcTime: Infinity, // Never garbage collect folders data
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

// Manual refresh function for folders
export function refreshFolders(accountId: number) {
  const queryClient = useQueryClient();
  
  console.log(`Manually refreshing folders data for account ${accountId}`);
  delete CACHE.folders[accountId];
  delete CACHE.foldersPromises[accountId];
  
  // Force React Query to refetch
  return queryClient.invalidateQueries({ queryKey: ['folders', accountId] });
}

// Fetch emails for a folder
export function useEmails(folderId: number, accountId: number) {
  return useQuery({
    queryKey: ['emails', folderId, accountId],
    queryFn: async () => {
      const response = await fetch(`/api/emails?folderId=${folderId}&accountId=${accountId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch emails');
      }
      return response.json() as Promise<Message[]>;
    },
    enabled: !!folderId && !!accountId,
    staleTime: 2 * 60 * 1000, // 2 minutes - emails can change state
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch a single email
export function useEmail(messageId: number, accountId: number) {
  return useQuery({
    queryKey: ['email', messageId, accountId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/emails?id=${messageId}&accountId=${accountId}`);
        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to fetch email: ${response.status} ${response.statusText}${errorData ? ` - ${errorData}` : ''}`);
        }
        return response.json() as Promise<Message>;
      } catch (error) {
        console.error(`Error fetching email ID ${messageId} for account ${accountId}:`, error);
        throw error; // Re-throw for React Query to handle
      }
    },
    enabled: !!messageId && !!accountId, // Only run if both IDs are provided
    retry: 1, // Only retry once to avoid excessive requests for missing emails
    staleTime: 5 * 60 * 1000, // 5 minutes - individual emails rarely change except drafts
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Fetch emails for multiple folders
export function useMultipleFolderEmails(folderIds: number[], accountId: number) {
  return useQuery({
    queryKey: ['emails', folderIds, accountId],
    queryFn: async () => {
      if (!folderIds.length) return [];
      
      // Create an array to store all messages
      let allMessages: Message[] = [];
      
      // Fetch messages for each folder in parallel
      const promises = folderIds.map(folderId => 
        fetch(`/api/emails?folderId=${folderId}&accountId=${accountId}`)
          .then(res => {
            if (!res.ok) {
              console.error(`Error fetching emails for folder ${folderId}`);
              return [];
            }
            return res.json();
          })
          .catch(error => {
            console.error(`Error fetching emails for folder ${folderId}:`, error);
            return [];
          })
      );
      
      const results = await Promise.all(promises);
      
      // Combine all messages
      allMessages = results.flat();
      
      // Sort all messages by date (newest first)
      allMessages.sort((a: Message, b: Message) => {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      });
      
      return allMessages;
    },
    enabled: folderIds.length > 0 && !!accountId, // Only run if we have folder IDs and an account ID
    staleTime: 2 * 60 * 1000, // 2 minutes - emails can change state
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Fetch attachments for a message
export function useAttachments(messageId: number) {
  return useQuery({
    queryKey: ['attachments', messageId],
    queryFn: async () => {
      const response = await fetch(`/api/attachments?messageId=${messageId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attachments');
      }
      return response.json() as Promise<Attachment[]>;
    },
    enabled: !!messageId, // Only run if messageId is provided
    staleTime: 60 * 60 * 1000, // 60 minutes - attachments never change once created
    gcTime: 120 * 60 * 1000, // 2 hours
  });
}

// Fetch a single attachment by ID
export function useAttachment(attachmentId: number) {
  return useQuery({
    queryKey: ['attachment', attachmentId],
    queryFn: async () => {
      try {
        // This endpoint returns the file data directly, not JSON
        // So we just return the URL for the component to use
        return `/api/attachments/download?id=${attachmentId}`;
      } catch (error) {
        console.error(`Error preparing attachment URL for ID ${attachmentId}:`, error);
        throw error;
      }
    },
    enabled: !!attachmentId, // Only run if attachmentId is provided
    staleTime: 24 * 60 * 60 * 1000, // 24 hours - attachments don't change once created
  });
}