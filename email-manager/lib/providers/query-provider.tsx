'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRef, ReactNode, useEffect } from 'react';

// Global variable to ensure QueryClient persistence across navigations
// This is needed because Next.js App Router remounts components during navigation
let globalQueryClient: QueryClient | null = null;

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const queryClientRef = useRef<QueryClient | null>(null);
  
  if (!queryClientRef.current) {
    // Use the global instance if it exists, otherwise create a new one
    if (globalQueryClient) {
      queryClientRef.current = globalQueryClient;
      console.log('Using existing QueryClient instance');
    } else {
      console.log('Creating new QueryClient instance');
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            // Default settings for all queries
            staleTime: 5 * 60 * 1000, // 5 minutes default stale time
            gcTime: 10 * 60 * 1000, // 10 minutes default garbage collection time
            refetchOnWindowFocus: false,
            retry: 1,
            refetchOnMount: false, // Prevent refetching when components mount
            refetchOnReconnect: false, // Prevent refetching on reconnect
            structuralSharing: true, // Enable structural sharing between query results
          },
        },
      });
      
      queryClientRef.current = client;
      globalQueryClient = client;
    }
  }

  // Set up event listeners to prevent cache invalidation during navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Function to handle route change start (preserve cache)
      const handleRouteChangeStart = () => {
        console.log('Route change detected - preserving query cache');
        
        // Force persist the current cache state
        if (queryClientRef.current) {
          const currentCache = queryClientRef.current.getQueryCache().getAll();
          
          // Mark specific query types as fresh to prevent refetching during navigation
          currentCache.forEach(query => {
            const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : null;
            
            // Only preserve specific query types during navigation
            if (queryKey === 'accounts' || queryKey === 'folders') {
              // Reset update count and update timestamp to prevent refetching
              query.state.dataUpdateCount = 0;
              query.state.dataUpdatedAt = Date.now();
              
              // Force the query to be considered fresh
              queryClientRef.current?.setQueryData(query.queryKey, query.state.data);
            }
          });
        }
      };
      
      // Add custom event listeners for Next.js navigation
      // This is a workaround since Next.js App Router doesn't expose navigation events directly
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;
      
      window.history.pushState = function() {
        handleRouteChangeStart();
        return originalPushState.apply(this, arguments as any);
      };
      
      window.history.replaceState = function() {
        handleRouteChangeStart();
        return originalReplaceState.apply(this, arguments as any);
      };
      
      // Also handle popstate events (back/forward navigation)
      window.addEventListener('popstate', handleRouteChangeStart);
      
      // Clean up
      return () => {
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
        window.removeEventListener('popstate', handleRouteChangeStart);
      };
    }
  }, []);

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}