/** @type {import('next').NextConfig} */
const nextConfig = {
  /**
   * allowedDevOrigins — Next.js 16 blocks cross-origin requests to dev-only
   * assets (CSS chunks, HMR WebSocket, font data) unless the request origin
   * matches the server hostname (localhost by default).
   *
   * When you open the dev server from a phone or another device on the same
   * Wi-Fi via the machine's LAN IP (e.g. http://192.168.x.x:3000), the
   * browser sends requests from that IP origin, which gets blocked, causing
   * styles, fonts, and components to fail to load.
   *
   * The wildcard below allows any private-network IPv4 address on common
   * subnets, covering the typical home/office router range without opening
   * the dev server to arbitrary internet origins.
   */
  allowedDevOrigins: [
    "192.168.*.*",   // most home/office Wi-Fi (192.168.x.x)
    "10.*.*.*",      // 10.x.x.x corporate / VPN ranges
    "172.16.*.*",    // 172.16-31.x.x Docker / corporate ranges
  ],
};

export default nextConfig;
