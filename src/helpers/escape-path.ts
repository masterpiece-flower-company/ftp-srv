export default function escapePath(path: string): string {
  return path.replace(/"/g, '""');
}
