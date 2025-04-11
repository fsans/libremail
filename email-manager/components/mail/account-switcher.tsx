'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, User } from 'lucide-react';
import type { Account } from '@/lib/db/schema';
import { useAccounts } from '@/lib/hooks/use-api-queries';

interface AccountSwitcherProps {
  selectedAccountId: number;
  onAccountChange: (accountId: number) => void;
}

export function AccountSwitcher({ selectedAccountId, onAccountChange }: AccountSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  
  // Use the React Query hook instead of direct fetch
  const { data: accounts = [], isLoading } = useAccounts();

  useEffect(() => {
    // Set the selected account whenever accounts or selectedAccountId changes
    if (accounts.length > 0) {
      const account = accounts.find((a: Account) => a.id === selectedAccountId);
      if (account) {
        setSelectedAccount(account);
      } else if (accounts.length > 0) {
        setSelectedAccount(accounts[0]);
        onAccountChange(accounts[0].id);
      }
    }
  }, [accounts, selectedAccountId, onAccountChange]);

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    onAccountChange(account.id);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center p-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="ml-2">
          Loading accounts...
        </div>
      </div>
    );
  }

  if (!selectedAccount) {
    return (
      <div className="flex items-center p-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="ml-2">
          Loading accounts...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button 
        className="flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </div>
        <div className="ml-2 flex-1 text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedAccount.name || selectedAccount.email}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{selectedAccount.email}</p>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </button>
      
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md shadow-lg z-10">
          {accounts.map((account) => (
            <button
              key={account.id}
              className={`flex items-center w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 ${
                account.id === selectedAccount.id ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
              onClick={() => handleAccountSelect(account)}
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{account.name || account.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{account.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}