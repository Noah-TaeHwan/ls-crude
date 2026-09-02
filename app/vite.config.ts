import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function gitText(args: string[]): string {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      timeout: 3000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

function gitStamp() {
  const sha = gitText(["rev-parse", "--short=7", "HEAD"]) || "unknown";
  const branch = gitText(["rev-parse", "--abbrev-ref", "HEAD"]) || "unknown";
  const porcelain = gitText(["status", "--porcelain"]);
  const dirty = porcelain !== "unknown" && porcelain.length > 0;
  return { sha, branch, dirty };
}

const stamp = gitStamp();

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  define: {
    __LS_BUILD_SHA__: JSON.stringify(stamp.sha),
    __LS_BUILD_BRANCH__: JSON.stringify(stamp.branch),
    __LS_BUILD_DIRTY__: JSON.stringify(stamp.dirty),
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
