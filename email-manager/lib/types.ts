// API Response Types

// Attachment type definition
export interface Attachment {
  id: number;
  message_id: number;
  filename: string;
  origName?: string;
  origFilename?: string;
  filepath?: string;
  mime_type: string;
  size: number;
  content_id?: string;
  disposition?: string;
  created_at: string;
}

// Message type definition
export interface Message {
  id: number;
  account_id: number;
  folder_id: number;
  message_id: string;
  in_reply_to?: string;
  references?: string;
  date: string;
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  reply_to?: string;
  subject?: string;
  flags?: string;
  priority?: number;
  text_plain?: string;
  text_html?: string;
  has_attachments: number;
  created_at: string;
  updated_at: string;
  attachments?: Attachment[];
}

// Account type definition
export interface Account {
  id: number;
  name: string;
  email: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// Folder type definition
export interface Folder {
  id: number;
  account_id: number;
  name?: string;
  display_name?: string;
  attributes?: string;
  selectable?: number;
  parent_id?: number;
  delimiter?: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  unread_count?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: 'success' | 'error';
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}