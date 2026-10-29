const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');

module.exports = (phase) => ({
  // Keep production builds from overwriting a running dev server's manifests.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
  async redirects() {
    return [
      { source: '/products/stomach-phakki', destination: '/shop', permanent: true },
      { source: '/products/stomach-phakki-614cc7eb', destination: '/shop', permanent: true },
      { source: '/products/614cc7eb-02dc-42f9-834e-d149dfbc54c4', destination: '/shop', permanent: true },
    ];
  },
});
