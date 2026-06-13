import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Build autocontenido para imagen Docker mínima (Azure Container Apps).
  output: "standalone",
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
