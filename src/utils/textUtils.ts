export function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  const truncated = text.substring(0, limit);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated;
}
