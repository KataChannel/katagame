/**
 * Vietnamese utility functions for search and normalization
 */

export function removeVietnameseDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

export function vietnameseSearch(text: string, term: string): boolean {
  if (!text || !term) return false;
  
  const normalizedText = removeVietnameseDiacritics(text.toLowerCase());
  const normalizedTerm = removeVietnameseDiacritics(term.toLowerCase());
  
  return normalizedText.includes(normalizedTerm);
}
