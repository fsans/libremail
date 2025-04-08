import { NextResponse } from 'next/server';
import { getAccounts, getAccountById } from '@/lib/db/queries';

// GET /api/accounts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      console.log(`Fetching account with ID: ${id}`);
      const account = await getAccountById(Number(id));
      console.log('Account found:', account);
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
      return NextResponse.json(account);
    }
    
    console.log('Fetching all accounts');
    const accounts = await getAccounts();
    console.log(`Found ${accounts.length} accounts:`, accounts);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}