import { eq, and, like, desc, asc, or } from 'drizzle-orm';
import { getDb } from './client';
import { accounts, folders, messages, outbox, attachments } from './schema';
import type { Account, Folder, Message, OutboxMessage } from './schema';

/**
 * Get all accounts
 */
export async function getAccounts(): Promise<Account[]> {
  const db = await getDb();
  return db.select().from(accounts);
}

/**
 * Get account by ID
 */
export async function getAccountById(id: number): Promise<Account | undefined> {
  const db = await getDb();
  const result = await db.select().from(accounts).where(eq(accounts.id, id));
  return result[0];
}

/**
 * Get all folders for an account
 */
export async function getFoldersByAccount(accountId: number): Promise<Folder[]> {
  const db = await getDb();
  return db
    .select()
    .from(folders)
    .where(and(eq(folders.account_id, accountId), eq(folders.deleted, false)))
    .orderBy(folders.name);
}

/**
 * Get folder by ID
 */
export async function getFolderById(id: number): Promise<Folder | undefined> {
  const db = await getDb();
  const result = await db.select().from(folders).where(eq(folders.id, id));
  return result[0];
}

/**
 * Get messages in a folder
 */
export async function getMessagesByFolder(
  folderId: number, 
  page: number = 1, 
  limit: number = 50,
  sortBy: 'date' | 'from' | 'subject' = 'date',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<Message[]> {
  const db = await getDb();
  const offset = (page - 1) * limit;
  
  let orderByField;
  switch (sortBy) {
    case 'from': orderByField = messages.from; break;
    case 'subject': orderByField = messages.subject; break;
    default: orderByField = messages.date;
  }
  
  return db
    .select()
    .from(messages)
    .where(and(
      eq(messages.folder_id, folderId),
      eq(messages.deleted, false)
    ))
    .orderBy(sortOrder === 'asc' ? asc(orderByField) : desc(orderByField))
    .limit(limit)
    .offset(offset);
}

/**
 * Get message by ID
 */
export async function getMessageById(id: number): Promise<Message | undefined> {
  const db = await getDb();
  const result = await db.select().from(messages).where(eq(messages.id, id));
  return result[0];
}

/**
 * Search messages
 */
export async function searchMessages(
  accountId: number,
  query: string,
  page: number = 1,
  limit: number = 50
): Promise<Message[]> {
  const db = await getDb();
  const offset = (page - 1) * limit;
  const searchTerm = `%${query}%`;
  
  return db
    .select()
    .from(messages)
    .where(and(
      eq(messages.account_id, accountId),
      eq(messages.deleted, false),
      or(
        like(messages.subject, searchTerm),
        like(messages.from, searchTerm),
        like(messages.to, searchTerm)
      )
    ))
    .orderBy(desc(messages.date))
    .limit(limit)
    .offset(offset);
}

/**
 * Get outbox messages
 */
export async function getOutboxMessages(accountId: number): Promise<OutboxMessage[]> {
  const db = await getDb();
  return db
    .select()
    .from(outbox)
    .where(and(
      eq(outbox.account_id, accountId),
      eq(outbox.deleted, false),
      eq(outbox.sent, false)
    ))
    .orderBy(desc(outbox.created_at));
}

/**
 * Get draft messages
 */
export async function getDraftMessages(accountId: number): Promise<OutboxMessage[]> {
  const db = await getDb();
  return db
    .select()
    .from(outbox)
    .where(and(
      eq(outbox.account_id, accountId),
      eq(outbox.deleted, false),
      eq(outbox.draft, true)
    ))
    .orderBy(desc(outbox.updated_at));
}

/**
 * Get attachments for a message
 */
export async function getAttachmentsByMessage(messageId: number) {
  const db = await getDb();
  return db
    .select()
    .from(attachments)
    .where(eq(attachments.message_id, messageId));
}

/**
 * Mark message as seen
 */
export async function markMessageAsSeen(id: number): Promise<void> {
  const db = await getDb();
  await db
    .update(messages)
    .set({ seen: true })
    .where(eq(messages.id, id));
}

/**
 * Mark message as flagged/unflagged
 */
export async function toggleMessageFlag(id: number, flagged: boolean): Promise<void> {
  const db = await getDb();
  await db
    .update(messages)
    .set({ flagged })
    .where(eq(messages.id, id));
}

/**
 * Mark message as deleted
 */
export async function markMessageAsDeleted(id: number): Promise<void> {
  const db = await getDb();
  await db
    .update(messages)
    .set({ deleted: true })
    .where(eq(messages.id, id));
}

/**
 * Create a new draft message
 */
export async function createDraft(
  accountId: number,
  draft: Partial<OutboxMessage>
): Promise<number> {
  const db = await getDb();
  const now = new Date();
  
  interface MySqlInsertResult {
    insertId: number | bigint;
  }
  
  const result = await db
    .insert(outbox)
    .values({
      account_id: accountId,
      to: draft.to || '',
      from: draft.from || '',
      cc: draft.cc || '',
      bcc: draft.bcc || '',
      reply_to: draft.reply_to || '',
      subject: draft.subject || '',
      text_plain: draft.text_plain || '',
      text_html: draft.text_html || '',
      draft: true,
      sent: false,
      failed: false,
      locked: false,
      deleted: false,
      attempts: 0,
      created_at: now,
      updated_at: now
    });
  
  return Number((result as unknown as MySqlInsertResult).insertId);
}

/**
 * Update a draft message
 */
export async function updateDraft(
  id: number,
  draft: Partial<OutboxMessage>
): Promise<void> {
  const db = await getDb();
  
  await db
    .update(outbox)
    .set({
      ...draft,
      updated_at: new Date()
    })
    .where(eq(outbox.id, id));
}