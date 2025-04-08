import { NextResponse } from 'next/server';
import { getFoldersByAccount, getFolderById } from '@/lib/db/queries';

// GET /api/folders
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const id = searchParams.get('id');
    
    if (id) {
      const folder = await getFolderById(Number(id));
      if (!folder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
      }
      return NextResponse.json(folder);
    }
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    const folders = await getFoldersByAccount(Number(accountId));
    return NextResponse.json(folders);
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}