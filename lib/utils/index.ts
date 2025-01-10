export function calculateReadingTime(content: string): number {
  const words = content.split(/\s+/).filter((word) => word.trim().length > 0).length;
  const minutes = words / 200;
  return Math.ceil(minutes);
}