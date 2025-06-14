module.exports = {
  headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups", // Safe default
          },
        ],
      },
    ];
  },
};
