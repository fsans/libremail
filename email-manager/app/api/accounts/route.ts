/**
 * @api {get} /api/accounts Get Email Accounts
 * @apiName GetAccounts
 * @apiGroup Accounts
 * @apiVersion 1.0.0
 * 
 * @apiDescription Retrieves all email accounts or a specific account by ID.
 *
 * @apiParam {Number} [id] Optional account ID to retrieve a specific account.
 *
 * @apiSuccess {Object[]} accounts List of account objects when no ID is provided.
 * @apiSuccess {Number} accounts.id Unique identifier for the account.
 * @apiSuccess {String} accounts.email Email address associated with the account.
 * @apiSuccess {String} accounts.name User's name associated with the account.
 * @apiSuccess {String} accounts.host IMAP/SMTP server hostname.
 * @apiSuccess {Number} accounts.port Server port number.
 * @apiSuccess {String} accounts.username Login username for the account.
 * @apiSuccess {String} accounts.status Account status (active, error, etc.).
 * @apiSuccess {String} accounts.created_at Timestamp when the account was created.
 * @apiSuccess {String} accounts.updated_at Timestamp when the account was last updated.
 *
 * @apiExample {curl} Example usage - All accounts:
 *     curl -i http://localhost:3000/api/accounts
 *
 * @apiExample {curl} Example usage - Specific account:
 *     curl -i http://localhost:3000/api/accounts?id=1
 *
 * @apiSuccessExample {json} Success Response - All accounts:
 *     HTTP/1.1 200 OK
 *     [
 *       {
 *         "id": 1,
 *         "email": "user@example.com",
 *         "name": "John Doe",
 *         "host": "imap.example.com",
 *         "port": 993,
 *         "username": "user@example.com",
 *         "status": "active",
 *         "created_at": "2025-04-09T12:00:00.000Z",
 *         "updated_at": "2025-04-09T12:00:00.000Z"
 *       }
 *     ]
 *
 * @apiSuccessExample {json} Success Response - Specific account:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "email": "user@example.com",
 *       "name": "John Doe",
 *       "host": "imap.example.com",
 *       "port": 993,
 *       "username": "user@example.com",
 *       "status": "active",
 *       "created_at": "2025-04-09T12:00:00.000Z",
 *       "updated_at": "2025-04-09T12:00:00.000Z"
 *     }
 *
 * @apiError {Object} Error Error object with message.
 * @apiError {String} Error.error Error message.
 *
 * @apiErrorExample {json} Error Response - Account not found:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Account not found"
 *     }
 *
 * @apiErrorExample {json} Error Response - Server error:
 *     HTTP/1.1 500 Internal Server Error
 *     {
 *       "error": "Failed to fetch accounts"
 *     }
 */
import { NextResponse } from 'next/server';
import { getAccounts, getAccountById } from '@/lib/db/queries';

// GET /api/accounts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const account = await getAccountById(Number(id));
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
      return NextResponse.json(account);
    }
    
    const accounts = await getAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accounts' },
      { status: 500 }
    );
  }
}