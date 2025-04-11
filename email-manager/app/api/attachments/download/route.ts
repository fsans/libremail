/**
 * @api {get} /api/attachments/download Download Attachment
 * @apiName DownloadAttachment
 * @apiGroup Attachments
 * @apiVersion 1.0.0
 * 
 * @apiDescription Downloads an attachment file.
 *
 * @apiParam {Number} id The ID of the attachment to download.
 *
 * @apiExample {curl} Example usage:
 *     curl -i http://localhost:3000/api/attachments/download?id=123
 *
 * @apiSuccess {File} file The attachment file.
 *
 * @apiError {Object} Error Error object with message.
 * @apiError {String} Error.error Error message.
 */
import { getDb } from '@/lib/db/client';
import { attachments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
//import { Attachment } from '@/lib/types';

// Configure the base path for attachment storage
const ATTACHMENTS_BASE_PATH = process.env.ATTACHMENTS_PATH || '../sync/attachments';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Attachment ID is required' }, { status: 400 });
  }
  
  try {
    const db = await getDb();
    const [attachment] = await db.query.attachments.findMany({
      where: eq(attachments.id, parseInt(id)),
      limit: 1
    });
    
    if (!attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 });
    }
    
    // Determine the file path
    let filePath = '';
    if (attachment.filepath) {
      // Use the new filepath field if available
      filePath = path.join(ATTACHMENTS_BASE_PATH, attachment.filepath);
    } else {
      // Fallback to a legacy path structure if filepath is not available
      // This is just an example - adjust based on your actual legacy structure
      filePath = path.join(ATTACHMENTS_BASE_PATH, `${attachment.message_id}/${attachment.filename}`);
    }
    
    try {
      // Check if the file exists
      await fs.access(filePath);
      
      // Read the file
      const fileBuffer = await fs.readFile(filePath);
      
      // Determine the content type
      const contentType = attachment.mime_type || 'application/octet-stream';
      
      // Determine the filename for the download
      const downloadFilename = attachment.origName ?? attachment.filename ?? 'attachment';
      
      // Create the response with the file content
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${encodeURIComponent(downloadFilename)}"`,
          'Content-Length': fileBuffer.length.toString()
        }
      });
    } catch (fileError) {
      console.error('Error accessing attachment file:', fileError);
      return NextResponse.json({ error: 'Attachment file not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching attachment:', error);
    return NextResponse.json({ error: 'Failed to fetch attachment' }, { status: 500 });
  }
}