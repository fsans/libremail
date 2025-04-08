import { NextResponse } from 'next/server';
import { 
  getMessagesByFolder, 
  getMessageById, 
  searchMessages,
  markMessageAsSeen,
  toggleMessageFlag,
  markMessageAsDeleted
} from '@/lib/db/queries';

// GET /api/emails
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');
    const id = searchParams.get('id');
    const accountId = searchParams.get('accountId');
    const query = searchParams.get('query');
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;
    const sortBy = searchParams.get('sortBy') as 'date' | 'from' | 'subject' || 'date';
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc';
    
    // Get a single message by ID
    if (id) {
      const message = await getMessageById(Number(id));
      if (!message) {
        return NextResponse.json({ error: 'Message not found' }, { status: 404 });
      }
      
      // Mark the message as seen when it's viewed
      await markMessageAsSeen(Number(id));
      
      return NextResponse.json(message);
    }
    
    // Search messages
    if (query && accountId) {
      const messages = await searchMessages(
        Number(accountId),
        query,
        page,
        limit
      );
      return NextResponse.json(messages);
    }
    
    // Get messages in a folder
    if (folderId) {
      const messages = await getMessagesByFolder(
        Number(folderId),
        page,
        limit,
        sortBy,
        sortOrder
      );
      return NextResponse.json(messages);
    }
    
    return NextResponse.json(
      { error: 'Folder ID or message ID is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}

// PATCH /api/emails
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, action, value } = body;
    
    if (!id || !action) {
      return NextResponse.json(
        { error: 'Message ID and action are required' },
        { status: 400 }
      );
    }
    
    switch (action) {
      case 'seen':
        await markMessageAsSeen(id);
        break;
      case 'flag':
        await toggleMessageFlag(id, value === true);
        break;
      case 'delete':
        await markMessageAsDeleted(id);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating email:', error);
    return NextResponse.json(
      { error: 'Failed to update email' },
      { status: 500 }
    );
  }
}