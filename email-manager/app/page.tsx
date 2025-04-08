import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-20 text-center">
        <h1 className="text-6xl font-bold">
          Welcome to{' '}
          <span className="text-blue-600">
            LibreMail
          </span>
        </h1>

        <p className="mt-3 text-2xl">
          Your modern email client
        </p>

        <div className="flex flex-wrap items-center justify-around max-w-4xl mt-6 sm:w-full">
          <Link
            href="/mail/inbox"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600 bg-white shadow-md hover:shadow-lg transition-all"
          >
            <h3 className="text-2xl font-bold">Go to Inbox &rarr;</h3>
            <p className="mt-4 text-xl">
              View and manage your emails
            </p>
          </Link>

          <Link
            href="/mail/compose"
            className="p-6 mt-6 text-left border w-96 rounded-xl hover:text-blue-600 focus:text-blue-600 bg-white shadow-md hover:shadow-lg transition-all"
          >
            <h3 className="text-2xl font-bold">Compose Email &rarr;</h3>
            <p className="mt-4 text-xl">
              Write a new email message
            </p>
          </Link>
        </div>
      </main>

      <footer className="w-full h-24 border-t border-gray-200 flex items-center justify-center">
        <p>
          Powered by{' '}
          <span className="font-bold">
            LibreMail
          </span>
        </p>
      </footer>
    </div>
  );
}