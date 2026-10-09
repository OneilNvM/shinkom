import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ['raw-loader'],
        as: '*.js',
        type: 'raw',
        condition: {
          "query": /raw/
        }
      }
    }
  }
};

export default nextConfig;
