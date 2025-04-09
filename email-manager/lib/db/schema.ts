import { mysqlTable, varchar, int, text, timestamp, boolean, datetime, mediumint, longtext } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// Accounts table
export const accounts = mysqlTable('accounts', {
  id: int('id').primaryKey().autoincrement(),
  service: varchar('service', { length: 20 }),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 100 }),
  password: varchar('password', { length: 100 }),
  imap_host: varchar('imap_host', { length: 50 }),
  imap_port: mediumint('imap_port'),
  imap_flags: varchar('imap_flags', { length: 50 }),
  smtp_host: varchar('smtp_host', { length: 50 }),
  smtp_port: mediumint('smtp_port'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at')
});

// Account relations
export const accountsRelations = relations(accounts, ({ many }) => ({
  folders: many(folders),
  messages: many(messages),
  outbox: many(outbox)
}));

// Folders table
export const folders = mysqlTable('folders', {
  id: int('id').primaryKey().autoincrement(),
  account_id: int('account_id'),
  name: varchar('name', { length: 150 }),
  count: int('count').default(0),
  synced: int('synced').default(0),
  uid_validity: int('uid_validity').default(0),
  deleted: boolean('deleted').default(false),
  ignored: boolean('ignored').default(false),
  created_at: timestamp('created_at')
});

// Folder relations
export const foldersRelations = relations(folders, ({ one, many }) => ({
  account: one(accounts, {
    fields: [folders.account_id],
    references: [accounts.id]
  }),
  messages: many(messages)
}));

// Messages table
export const messages = mysqlTable('messages', {
  id: int('id').primaryKey().autoincrement(),
  account_id: int('account_id'),
  folder_id: int('folder_id'),
  unique_id: int('unique_id'),
  thread_id: int('thread_id'),
  outbox_id: int('outbox_id'),
  uid_validity: int('uid_validity'),
  date_str: varchar('date_str', { length: 100 }),
  charset: varchar('charset', { length: 100 }),
  subject: varchar('subject', { length: 270 }),
  message_id: varchar('message_id', { length: 250 }),
  in_reply_to: varchar('in_reply_to', { length: 250 }),
  recv_str: text('recv_str'),
  size: int('size'),
  message_no: int('message_no'),
  to: text('to'),
  from: text('from'),
  cc: text('cc'),
  bcc: text('bcc'),
  reply_to: text('reply_to'),
  text_plain: longtext('text_plain'),
  text_html: longtext('text_html'),
  references: text('references'),
  attachments: text('attachments'),
  raw_headers: longtext('raw_headers'),
  raw_content: longtext('raw_content'),
  seen: boolean('seen'),
  draft: boolean('draft'),
  recent: boolean('recent'),
  flagged: boolean('flagged'),
  deleted: boolean('deleted'),
  answered: boolean('answered'),
  synced: boolean('synced'),
  purge: boolean('purge'),
  date: datetime('date'),
  date_recv: datetime('date_recv'),
  created_at: timestamp('created_at')
});

// Message relations
export const messagesRelations = relations(messages, ({ one }) => ({
  account: one(accounts, {
    fields: [messages.account_id],
    references: [accounts.id]
  }),
  folder: one(folders, {
    fields: [messages.folder_id],
    references: [folders.id]
  })
}));

// Outbox table
export const outbox = mysqlTable('outbox', {
  id: int('id').primaryKey().autoincrement(),
  account_id: int('account_id'),
  parent_id: int('parent_id'),
  to: text('to'),
  from: text('from'),
  cc: text('cc'),
  bcc: text('bcc'),
  reply_to: text('reply_to'),
  subject: varchar('subject', { length: 270 }),
  text_plain: longtext('text_plain'),
  text_html: longtext('text_html'),
  draft: boolean('draft').default(false),
  sent: boolean('sent').default(false),
  failed: boolean('failed').default(false),
  locked: boolean('locked').default(false),
  deleted: boolean('deleted').default(false),
  attempts: int('attempts').default(0),
  send_after: datetime('send_after'),
  created_at: timestamp('created_at'),
  updated_at: timestamp('updated_at'),
  update_history: text('update_history')
});

// Outbox relations
export const outboxRelations = relations(outbox, ({ one }) => ({
  account: one(accounts, {
    fields: [outbox.account_id],
    references: [accounts.id]
  }),
  parent: one(messages, {
    fields: [outbox.parent_id],
    references: [messages.id]
  })
}));

// Attachments table

/*
[{
"id":"531eba2a4b7b9a73d2a6ebbe00eb53f1",
"name":"fwovoz.jpeg",
"filename":"fwovoz.jpeg",
"filepath":"2025/04/16_531eba2a4b7b9a73d2a6ebbe00eb53f1_fwovoz.jpeg",
"mimeType":"image/jpeg",
"origName":"fwovoz.jpeg",
"origFilename":"fwovoz.jpeg"}]

*/
export const attachments = mysqlTable('attachments', {
  id: int('id').primaryKey().autoincrement(),
  message_id: int('message_id'),
  filename: varchar('filename', { length: 255 }),
  origName: varchar('origName', { length: 255 }),
  origFilename: varchar('origFilename', { length: 255 }),
  filepath: varchar('filepath', { length: 255 }),
  mime_type: varchar('mime_type', { length: 255 }),
  size: int('size'),
  content_id: varchar('content_id', { length: 255 }),
  disposition: varchar('disposition', { length: 50 }),
  created_at: timestamp('created_at')
});

// Attachment relations
export const attachmentsRelations = relations(attachments, ({ one }) => ({
  message: one(messages, {
    fields: [attachments.message_id],
    references: [messages.id]
  })
}));

// Define TypeScript types for our tables
export type Account = typeof accounts.$inferSelect;
export type Folder = typeof folders.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type OutboxMessage = typeof outbox.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;