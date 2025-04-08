# LibreMail Email Manager

A modern web interface for LibreMail built with Next.js and shadcn/ui.

## Overview

Email Manager is a Next.js application that provides a modern user interface for the LibreMail system. It connects to the same MySQL database used by the LibreMail sync component to display and manage emails.

## Features

- View and manage email accounts
- Browse folders and messages
- Compose and send new emails
- Search through your email archive
- Modern, responsive UI built with shadcn/ui components

## Prerequisites

- Node.js 18.0.0 or later
- LibreMail sync component running and connected to a MySQL database
- MySQL database with LibreMail schema

## Getting Started

### Installation

1. Clone the repository (if not already done)
2. Navigate to the email-manager directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env.local` file with your database configuration:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=libremail
DB_PORT=3306

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

Build the application for production:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

- `/app` - Next.js App Router pages and API routes
- `/components` - Reusable UI components
- `/lib` - Utility functions and database access
  - `/db` - Database schema and queries
  - `/utils` - Helper functions

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [MySQL](https://www.mysql.com/) - Database

## License

This project is licensed under the same license as the main LibreMail project.
