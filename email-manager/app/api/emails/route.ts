/**
 * @api {get} /api/emails Get Emails
 * @apiName GetEmails
 * @apiGroup Emails
 * @apiVersion 1.0.0
 * 
 * @apiDescription Retrieves emails based on various query parameters. Can fetch a single email by ID,
 * search emails by query string, or list emails in a specific folder.
 *
 * @apiParam {Number} [id] ID of a specific email to retrieve.
 * @apiParam {Number} [folderId] ID of the folder to retrieve emails from.
 * @apiParam {Number} [accountId] Account ID for searching emails (required when using query parameter).
 * @apiParam {String} [query] Search query string to filter emails by.
 * @apiParam {Number} [page=1] Page number for pagination.
 * @apiParam {Number} [limit=50] Number of emails per page.
 * @apiParam {String} [sortBy=date] Field to sort by ('date', 'from', 'subject').
 * @apiParam {String} [sortOrder=desc] Sort order ('asc' or 'desc').
 *
 * @apiExample {curl} Example usage - Get email by ID:
 *     curl -i http://localhost:3000/api/emails?id=123
 *
 * @apiExample {curl} Example usage - Get emails in folder:
 *     curl -i http://localhost:3000/api/emails?folderId=5&page=1&limit=25&sortBy=date&sortOrder=desc
 *
 * @apiExample {curl} Example usage - Search emails:
 *     curl -i http://localhost:3000/api/emails?accountId=1&query=important&page=1&limit=25
 *
 * @apiSuccess {Object} message Single email object (when id is provided).
 * @apiSuccess {Object[]} messages List of email objects (when folderId or search query is provided).
 * @apiSuccess {Number} message.id Unique identifier for the email.
 * @apiSuccess {Number} message.account_id Account ID the email belongs to.
 * @apiSuccess {Number} message.folder_id Folder ID the email is stored in.
 * @apiSuccess {String} message.subject Email subject line.
 * @apiSuccess {String} message.from Sender information.
 * @apiSuccess {String} message.to Recipient information.
 * @apiSuccess {String} [message.cc] Carbon copy recipients.
 * @apiSuccess {String} [message.bcc] Blind carbon copy recipients.
 * @apiSuccess {String} message.date Date the email was sent.
 * @apiSuccess {Number} message.size Email size in bytes.
 * @apiSuccess {Number} message.seen Whether the email has been read (1) or not (0).
 * @apiSuccess {Number} message.flagged Whether the email is flagged/starred (1) or not (0).
 * @apiSuccess {String} [message.text_plain] Plain text content of the email.
 * @apiSuccess {String} [message.text_html] HTML content of the email.
 * @apiSuccess {String} [message.attachments] JSON string of attachments.
 *
 * @apiSuccessExample {json} Success Response - Single email:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 123,
 *       "account_id": 1,
 *       "folder_id": 5,
 *       "subject": "Meeting tomorrow",
 *       "from": "John Doe <john@example.com>",
 *       "to": "Jane Smith <jane@example.com>",
 *       "cc": "team@example.com",
 *       "date": "2025-04-09T12:00:00.000Z",
 *       "size": 25600,
 *       "seen": 1,
 *       "flagged": 0,
 *       "text_plain": "Let's meet tomorrow at 10 AM.",
 *       "text_html": "<div>Let's meet tomorrow at 10 AM.</div>",
 *       "attachments": "[{\"filename\":\"agenda.pdf\",\"mime_type\":\"application/pdf\",\"size\":15360}]"
 *     }
 *
 * @apiSuccessExample {json} Success Response - Email list:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": [
 *         {
 *           "id": 123,
 *           "subject": "Meeting tomorrow",
 *           "from": "John Doe <john@example.com>",
 *           "date": "2025-04-09T12:00:00.000Z",
 *           "seen": 1,
 *           "flagged": 0
 *         },
 *         {
 *           "id": 124,
 *           "subject": "Project update",
 *           "from": "Jane Smith <jane@example.com>",
 *           "date": "2025-04-08T15:30:00.000Z",
 *           "seen": 0,
 *           "flagged": 1
 *         }
 *       ],
 *       "meta": {
 *         "total": 150,
 *         "page": 1,
 *         "limit": 25
 *       }
 *     }
 *
 * @apiError {Object} Error Error object with message.
 * @apiError {String} Error.error Error message.
 *
 * @apiErrorExample {json} Error Response - Missing parameters:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Folder ID or message ID is required"
 *     }
 *
 * @apiErrorExample {json} Error Response - Message not found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Message not found"
 *     }
 */

/**
 * @api {patch} /api/emails Update Email Status
 * @apiName UpdateEmail
 * @apiGroup Emails
 * @apiVersion 1.0.0
 * 
 * @apiDescription Updates an email's status (seen, flagged, or deleted).
 *
 * @apiBody {Number} id ID of the email to update.
 * @apiBody {String} action Action to perform ('seen', 'flag', or 'delete').
 * @apiBody {Boolean} [value] Value for the flag action (true to flag, false to unflag).
 *
 * @apiExample {curl} Example usage - Mark as seen:
 *     curl -X PATCH -H "Content-Type: application/json" -d '{"id":123,"action":"seen"}' http://localhost:3000/api/emails
 *
 * @apiExample {curl} Example usage - Flag email:
 *     curl -X PATCH -H "Content-Type: application/json" -d '{"id":123,"action":"flag","value":true}' http://localhost:3000/api/emails
 *
 * @apiExample {curl} Example usage - Delete email:
 *     curl -X PATCH -H "Content-Type: application/json" -d '{"id":123,"action":"delete"}' http://localhost:3000/api/emails
 *
 * @apiSuccess {Object} Success Success response.
 * @apiSuccess {Boolean} Success.success Indicates successful operation.
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true
 *     }
 *
 * @apiError {Object} Error Error object with message.
 * @apiError {String} Error.error Error message.
 *
 * @apiErrorExample {json} Error Response - Missing parameters:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Message ID and action are required"
 *     }
 *
 * @apiErrorExample {json} Error Response - Invalid action:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Invalid action"
 *     }
 */
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