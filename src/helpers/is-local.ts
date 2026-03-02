export function isLocalIP(ip: string): boolean {
  return ip === '127.0.0.1' || ip === '::1';
}
