/**
 * @api {get} /api/outbox Get Outbox Messages
 * @apiName GetOutboxMessages
 * @apiGroup Outbox
 * @apiVersion 1.0.0
 * 
 * @apiDescription Retrieves outbox messages or draft messages for a specific account.
 *
 * @apiParam {Number} accountId Account ID to retrieve messages for.
 * @apiParam {Boolean} [drafts=false] Set to true to retrieve draft messages instead of outbox messages.
 *
 * @apiExample {curl} Example usage - Outbox messages:
 *     curl -i http://localhost:3000/api/outbox?accountId=1
 *
 * @apiExample {curl} Example usage - Draft messages:
 *     curl -i http://localhost:3000/api/outbox?accountId=1&drafts=true
 *
 * @apiSuccess {Object[]} messages List of outbox or draft message objects.
 * @apiSuccess {Number} messages.id Unique identifier for the message.
 * @apiSuccess {Number} messages.account_id Account ID the message belongs to.
 * @apiSuccess {String} messages.subject Message subject line.
 * @apiSuccess {String} messages.from Sender information.
 * @apiSuccess {String} messages.to Recipient information.
 * @apiSuccess {String} [messages.cc] Carbon copy recipients.
 * @apiSuccess {String} [messages.bcc] Blind carbon copy recipients.
 * @apiSuccess {String} messages.created_at Timestamp when the message was created.
 * @apiSuccess {String} messages.updated_at Timestamp when the message was last updated.
 * @apiSuccess {Number} messages.status Message status (0: draft, 1: queued, 2: sent, 3: error).
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": 1,
 *         "account_id": 1,
 *         "subject": "Meeting tomorrow",
 *         "from": "John Doe <john@example.com>",
 *         "to": "Jane Smith <jane@example.com>",
 *         "cc": "team@example.com",
 *         "bcc": null,
 *         "created_at": "2025-04-09T12:00:00.000Z",
 *         "updated_at": "2025-04-09T12:00:00.000Z",
 *         "status": 0
 *       }
 *     ]
 *
 * @apiError {Object} Error Error object with message.
 * @apiError {String} Error.error Error message.
 *
 * @apiErrorExample {json} Error Response - Missing account ID:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Account ID is required"
 *     }
 */

/**
 * @api {post} /api/outbox Create Draft Message
 * @apiName CreateDraft
 * @apiGroup Outbox
 * @apiVersion 1.0.0
 * 
 * @apiDescription Creates a new draft message.
 *
 * @apiBody {Number} accountId Account ID to create the draft for.
 * @apiBody {Object} draft Draft message data.
 * @apiBody {String} draft.subject Subject line of the draft.
 * @apiBody {String} draft.from Sender information.
 * @apiBody {String} draft.to Recipient information.
 * @apiBody {String} [draft.cc] Carbon copy recipients.
 * @apiBody {String} [draft.bcc] Blind carbon copy recipients.
 * @apiBody {String} [draft.text_plain] Plain text content of the draft.
 * @apiBody {String} [draft.text_html] HTML content of the draft.
 *
 * @apiExample {curl} Example usage:
 *     curl -X POST -H "Content-Type: application/json" \
 *     -d '{"accountId":1,"draft":{"subject":"Meeting","from":"john@example.com","to":"jane@example.com","text_plain":"Let's meet tomorrow"}}' \
 *     http://localhost:3000/api/outbox
 *
 * @apiSuccess {Object} Success Success response with the created draft ID.
 * @apiSuccess {Number} Success.id ID of the created draft.
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 5
 *     }
 *
 * @apiError {Object} Error Error object with message.
 * @apiError {String} Error.error Error message.
 *
 * @apiErrorExample {json} Error Response - Missing parameters:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Account ID and draft data are required"
 *     }
 */

/**
 * @api {patch} /api/outbox Update Draft Message
 * @apiName UpdateDraft
 * @apiGroup Outbox
 * @apiVersion 1.0.0
 * 
 * @apiDescription Updates an existing draft message.
 *
 * @apiBody {Number} id ID of the draft to update.
 * @apiBody {Object} draft Updated draft message data.
 * @apiBody {String} [draft.subject] Subject line of the draft.
 * @apiBody {String} [draft.from] Sender information.
 * @apiBody {String} [draft.to] Recipient information.
 * @apiBody {String} [draft.cc] Carbon copy recipients.
 * @apiBody {String} [draft.bcc] Blind carbon copy recipients.
 * @apiBody {String} [draft.text_plain] Plain text content of the draft.
 * @apiBody {String} [draft.text_html] HTML content of the draft.
 *
 * @apiExample {curl} Example usage:
 *     curl -X PATCH -H "Content-Type: application/json" \
 *     -d '{"id":5,"draft":{"subject":"Updated Meeting","text_plain":"Let's meet tomorrow at 2 PM"}}' \
 *     http://localhost:3000/api/outbox
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
 *       "error": "Draft ID and draft data are required"
 *     }
 */
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