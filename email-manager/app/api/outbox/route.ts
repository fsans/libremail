import { NextResponse } from 'next/server';
import { 
  getOutboxMessages, 
  getDraftMessages, 
  createDraft, 
  updateDraft 
} from '@/lib/db/queries';

// GET /api/outbox
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    const drafts = searchParams.get('drafts') === 'true';
    
    if (!accountId) {
      return NextResponse.json(
        { error: 'Account ID is required' },
        { status: 400 }
      );
    }
    
    if (drafts) {
      const messages = await getDraftMessages(Number(accountId));
      return NextResponse.json(messages);
    } else {
      const messages = await getOutboxMessages(Number(accountId));
      return NextResponse.json(messages);
    }
  } catch (error) {
    console.error('Error fetching outbox messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outbox messages' },
      { status: 500 }
    );
  }
}

// POST /api/outbox
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { accountId, draft } = body;
    
    if (!accountId || !draft) {
      return NextResponse.json(
        { error: 'Account ID and draft data are required' },
        { status: 400 }
      );
    }
    
    const draftId = await createDraft(Number(accountId), draft);
    return NextResponse.json({ id: draftId });
  } catch (error) {
    console.error('Error creating draft:', error);
    return NextResponse.json(
      { error: 'Failed to create draft' },
      { status: 500 }
    );
  }
}

// PATCH /api/outbox
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, draft } = body;
    
    if (!id || !draft) {
      return NextResponse.json(
        { error: 'Draft ID and draft data are required' },
        { status: 400 }
      );
    }
    
    await updateDraft(Number(id), draft);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating draft:', error);
    return NextResponse.json(
      { error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}