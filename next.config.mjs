import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
};

if (!process.listenerCount('unhandledRejection')) {
  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection detail:', reason);
    if (reason?.stack) {
      console.error(reason.stack);
    }
  });
}

export default withNextIntl(nextConfig);
