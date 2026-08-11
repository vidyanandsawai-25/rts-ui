/**
 * Utility functions for building document view and download URLs for RTS Application documents.
 */

export function getDocumentViewUrl(documentGuid: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7293/api';
  return `${baseUrl.replace(/\/$/, '')}/documents/${documentGuid}/view`;
}

export function getDocumentDownloadUrl(documentGuid: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7293/api';
  return `${baseUrl.replace(/\/$/, '')}/documents/${documentGuid}/download`;
}
