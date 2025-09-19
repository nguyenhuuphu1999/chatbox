export function mask(str?: string, keep = 4): string {
  if (!str) return '';
  if (str.length <= keep) return '*'.repeat(str.length);
  return str.slice(0, keep) + '*'.repeat(str.length - keep);
}

export function formatPriceVND(n: number): string {
  return `${Number(n || 0).toLocaleString('vi-VN')} VND`;
}

export function truncate(text: string, len = 400): string {
  if (!text) return '';
  return text.length > len ? text.slice(0, len) + '…' : text;
}
