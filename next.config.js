/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  webpack: (config, { isServer }) => {
    // 添加raw-loader来处理.txt文件
    config.module.rules.push({
      test: /\.txt$/,
      use: 'raw-loader',
    });
    
    return config;
  },
  experimental: {
    turbo: {
      rules: {
        "*.txt": {
          loaders: ["raw-loader"],
          as: "*.js",
        },
      },
    },
  },
};

export default config;
