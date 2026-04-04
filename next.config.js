/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "resumify.cc",
      "html.tailus.io",
      "ik.imagekit.io",
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["mammoth", "pdf-parse", "pdfjs-dist", "unpdf"],
    optimizePackageImports: ["lucide-react"],
    /** Ensure pdf.js worker exists in the serverless bundle on Vercel (see app/api/parse-resume/route.ts). */
    outputFileTracingIncludes: {
      "/api/parse-resume": [
        "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
        "./node_modules/pdfjs-dist/legacy/build/pdf.mjs",
      ],
    },
  },
};

module.exports = nextConfig;
