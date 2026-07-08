export interface InvoiceClientIssueUpsertInput {
  issueKey: string;
  tlqvCode: string;
  reason: string;
  source: string;
  severity?: string | null;
  saleNumber?: string | null;
  buyerName?: string | null;
  email?: string | null;
  documentoTipo?: string | null;
  documentoNro?: string | null;
  documentoNroDigits?: string | null;
  message: string;
  messages?: string[] | null;
  rawPayload?: unknown;
  metadata?: unknown;
}

export interface InvoiceClientIssueUpdateInput {
  status?: 'open' | 'resolved' | 'ignored';
  severity?: string | null;
  resolvedBy?: string | null;
  resolutionNotes?: string | null;
}

export interface InvoiceClientIssueRecord {
  id: number;
  issueKey: string;
  tlqvCode: string;
  reason: string;
  source: string;
  status: string;
  severity: string;
  saleNumber: string | null;
  buyerName: string | null;
  email: string | null;
  documentoTipo: string | null;
  documentoNro: string | null;
  documentoNroDigits: string | null;
  message: string;
  messages: string[] | null;
  rawPayload: unknown;
  metadata: unknown;
  firstSeenAt: string;
  lastSeenAt: string;
  occurrenceCount: number;
  resolvedAt: string | null;
  resolvedBy: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface InvoiceClientIssueUpsertResult extends InvoiceClientIssueRecord {
  created: boolean;
  updated: boolean;
}

export interface InvoiceClientIssuesListFilters {
  tlqvCode?: string;
  reason?: string;
  source?: string;
  status?: string;
  documentoNroDigits?: string;
  limit: number;
  offset: number;
}

export interface InvoiceClientIssuesListResult {
  items: InvoiceClientIssueRecord[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface ISQLInvoiceClientIssuesRepository {
  upsertIssue(input: InvoiceClientIssueUpsertInput): Promise<InvoiceClientIssueUpsertResult>;
  listIssues(filters: InvoiceClientIssuesListFilters): Promise<InvoiceClientIssuesListResult>;
  findById(id: number): Promise<InvoiceClientIssueRecord | null>;
  findByTlqvCode(tlqvCode: string): Promise<InvoiceClientIssueRecord[]>;
  updateIssue(id: number, input: InvoiceClientIssueUpdateInput): Promise<InvoiceClientIssueRecord | null>;
  softDeleteIssue(id: number): Promise<boolean>;
}
