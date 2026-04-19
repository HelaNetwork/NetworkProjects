/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            '@react-native-async-storage/async-storage': false,
        };
        return config;
    },
};

module.exports = nextConfig;
