/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.externals.push("pino-pretty", "lokijs", "encoding", "async-storage", "@react-native-async-storage/async-storage");
        config.resolve.fallback = { fs: false, net: false, tls: false };
        return config;
    },
};
module.exports = nextConfig;
