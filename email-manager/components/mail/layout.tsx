// For /components/mail/layout.tsx
// app/mail/layout.tsx
import Link from 'next/link';

export default function MailLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="w-64 border-r border-gray-200 overflow-auto">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold">LibreMail</h1>
        </div>
        <nav className="p-2">
          <ul className="space-y-1">
            <li>
              <Link href="/mail/inbox" className="block px-3 py-2 rounded-md hover:bg-gray-100">
                Inbox
              </Link>
            </li>
            <li>
              <Link href="/mail/sent" className="block px-3 py-2 rounded-md hover:bg-gray-100">
                Sent
              </Link>
            </li>
            <li>
              <Link href="/mail/drafts" className="block px-3 py-2 rounded-md hover:bg-gray-100">
                Drafts
              </Link>
            </li>
            <li>
              <Link href="/mail/trash" className="block px-3 py-2 rounded-md hover:bg-gray-100">
                Trash
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="flex flex-col flex-1">
        <div className="h-14 border-b border-gray-200 flex items-center px-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search emails..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="ml-4">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <span>👤</span>
            </button>
          </div>
        </div>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}