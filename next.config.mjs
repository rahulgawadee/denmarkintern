import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
};

if (typeof process !== 'undefined' && process?.on && process?.listenerCount) {
  if (!process.listenerCount('unhandledRejection')) {
    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled rejection detail:', reason);
      if (reason?.stack) {
        console.error(reason.stack);
      }
    });
  }
}

if (typeof JSON !== 'undefined' && typeof JSON.parse === 'function') {
  const originalParse = JSON.parse;
  JSON.parse = function patchedJSONParse(value, ...rest) {
    try {
      return originalParse.call(this, value, ...rest);
    } catch (error) {
      const preview = typeof value === 'string' ? value.slice(0, 200) : `[${typeof value}]`;
      console.error('JSON.parse failed. Preview:', preview);
      throw error;
    }
  };
}

export default withNextIntl(nextConfig);
