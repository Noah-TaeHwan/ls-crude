import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function gitText(args: string[]): string | null {
  try {
    const output = execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      timeout: 3000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return output.length > 0 ? output : null;
  } catch {
    return null;
  }
}

function gitStamp() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || gitText(["rev-parse", "--short=7", "HEAD"]) || "unknown";
  const branch =
    process.env.VERCEL_GIT_COMMIT_REF ||
    gitText(["branch", "--show-current"]) ||
    gitText(["rev-parse", "--abbrev-ref", "HEAD"]) ||
    "unknown";
  const porcelain = gitText(["status", "--porcelain", "--untracked-files=no"]);
  const dirty = porcelain != null;
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
    fs: { allow: [repoRoot] },
  },
});
