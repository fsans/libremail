/**
 * @api {get} /api/attachments Get Message Attachments
 * @apiName GetAttachments
 * @apiGroup Attachments
 * @apiVersion 1.0.0
 * 
 * @apiDescription Retrieves all attachments for a specific email message.
 *
 * @apiParam {Number} messageId The ID of the message to retrieve attachments for.
 *
 * @apiSuccess {Object[]} attachments List of attachment objects.
 * @apiSuccess {Number} attachments.id Unique identifier for the attachment.
 * @apiSuccess {Number} attachments.message_id ID of the message this attachment belongs to.
 * @apiSuccess {String} attachments.filename Name of the attachment file.
 * @apiSuccess {String} [attachments.origName] Original name of the attachment.
 * @apiSuccess {String} [attachments.origFilename] Original filename of the attachment.
 * @apiSuccess {String} [attachments.filepath] File path for the attachment.
 * @apiSuccess {String} attachments.mime_type MIME type of the attachment.
 * @apiSuccess {Number} attachments.size Size of the attachment in bytes.
 * @apiSuccess {String} [attachments.content_id] Content ID for inline attachments.
 * @apiSuccess {String} [attachments.disposition] Attachment disposition (inline or attachment).
 * @apiSuccess {String} attachments.created_at Timestamp when the attachment was created.
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/api/attachments?messageId=123
 *
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": 1,
 *         "message_id": 123,
 *         "filename": "document.pdf",
 *         "origName": "Original Document.pdf",
 *         "origFilename": "Original Document.pdf",
 *         "filepath": "2025/04/09_abc123_document.pdf",
 *         "mime_type": "application/pdf",
 *         "size": 52428,
 *         "content_id": null,
 *         "disposition": "attachment",
 *         "created_at": "2025-04-09T12:00:00.000Z"
 *       }
 *     ]
 *
 * @apiError {Object} Error Error object with message.
 * @apiError {String} Error.error Error message.
 *
 * @apiErrorExample {json} Error Response:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Message ID is required"
 *     }
 */
import { getDb } from '@/lib/db/client';
import { attachments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
//import { Attachment } from '@/lib/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const messageId = searchParams.get('messageId');
  
  if (!messageId) {
    return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
  }
  
  try {
    const db = await getDb();
    const messageAttachments = await db.query.attachments.findMany({
      where: eq(attachments.message_id, parseInt(messageId))
    });
    
    return NextResponse.json(messageAttachments);
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json({ error: 'Failed to fetch attachments' }, { status: 500 });
  }
}