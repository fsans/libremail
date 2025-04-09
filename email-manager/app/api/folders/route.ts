/**
 * @api {get} /api/folders Get Email Folders
 * @apiName GetFolders
 * @apiGroup Folders
 * @apiVersion 1.0.0
 * 
 * @apiDescription Retrieves all folders for a specific account or a single folder by ID.
 *
 * @apiParam {Number} [id] Optional folder ID to retrieve a specific folder.
 * @apiParam {Number} [accountId] Account ID to retrieve all folders for (required if id is not provided).
 *
 * @apiExample {curl} Example usage - All folders for an account:
 *     curl -i http://localhost:3000/api/folders?accountId=1
 *
 * @apiExample {curl} Example usage - Specific folder:
 *     curl -i http://localhost:3000/api/folders?id=5
 *
 * @apiSuccess {Object} folder Single folder object (when id is provided).
 * @apiSuccess {Object[]} folders List of folder objects (when accountId is provided).
 * @apiSuccess {Number} folder.id Unique identifier for the folder.
 * @apiSuccess {Number} folder.account_id Account ID the folder belongs to.
 * @apiSuccess {String} folder.name Folder name.
 * @apiSuccess {String} [folder.display_name] Display name for the folder.
 * @apiSuccess {Number} [folder.parent_id] Parent folder ID for nested folders.
 * @apiSuccess {Number} folder.uid_validity UID validity value for the folder.
 * @apiSuccess {Number} folder.attributes Folder attributes as a bitmask.
 * @apiSuccess {Number} [folder.unread_count] Number of unread messages in the folder.
 * @apiSuccess {Number} [folder.total_count] Total number of messages in the folder.
 * @apiSuccess {String} folder.created_at Timestamp when the folder was created.
 * @apiSuccess {String} folder.updated_at Timestamp when the folder was last updated.
 *
 * @apiSuccessExample {json} Success Response - All folders:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": 1,
 *         "account_id": 1,
 *         "name": "INBOX",
 *         "display_name": "Inbox",
 *         "parent_id": null,
 *         "uid_validity": 123456789,
 *         "attributes": 0,
 *         "unread_count": 5,
 *         "total_count": 120,
 *         "created_at": "2025-04-09T12:00:00.000Z",
 *         "updated_at": "2025-04-09T12:00:00.000Z"
 *       },
 *       {
 *         "id": 2,
 *         "account_id": 1,
 *         "name": "Sent",
 *         "display_name": "Sent",
 *         "parent_id": null,
 *         "uid_validity": 123456790,
 *         "attributes": 0,
 *         "unread_count": 0,
 *         "total_count": 45,
 *         "created_at": "2025-04-09T12:00:00.000Z",
 *         "updated_at": "2025-04-09T12:00:00.000Z"
 *       }
 *     ]
 *
 * @apiSuccessExample {json} Success Response - Specific folder:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "account_id": 1,
 *       "name": "INBOX",
 *       "display_name": "Inbox",
 *       "parent_id": null,
 *       "uid_validity": 123456789,
 *       "attributes": 0,
 *       "unread_count": 5,
 *       "total_count": 120,
 *       "created_at": "2025-04-09T12:00:00.000Z",
 *       "updated_at": "2025-04-09T12:00:00.000Z"
 *     }
 *
 * @apiError {Object} Error Error object with message.
 * @apiError {String} Error.error Error message.
 *
 * @apiErrorExample {json} Error Response - Missing account ID:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": "Account ID is required"
 *     }
 *
 * @apiErrorExample {json} Error Response - Folder not found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Folder not found"
 *     }
 */
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