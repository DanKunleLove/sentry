/**
 * build-widget.ts
 * ===============
 * esbuild script that bundles the Sentry AI Chat Widget into a single,
 * self-executing IIFE file ready for embedding on any website.
 *
 * Usage:
 *   npx tsx scripts/build-widget.ts
 *
 * Output:
 *   public/widget/sentry-chat.min.js  (minified, tree-shaken, <20KB)
 */

import { build } from "esbuild";
import { mkdirSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = typeof import.meta.dirname === "string"
  ? import.meta.dirname
  : dirname(fileURLToPath(import.meta.url));

const ROOT = resolve(__dirname, "..");
const ENTRY = resolve(ROOT, "src/widget/sentry-chat.ts");
const OUT_DIR = resolve(ROOT, "public/widget");
const OUT_FILE = "sentry-chat.min.js";

// Ensure the output directory exists
mkdirSync(OUT_DIR, { recursive: true });

async function main(): Promise<void> {
  console.log("🔨 Building Sentry Chat Widget…\n");

  const result = await build({
    entryPoints: [ENTRY],
    outfile: resolve(OUT_DIR, OUT_FILE),
    bundle: true,
    minify: true,
    treeShaking: true,
    format: "iife",
    target: ["es2020"],
    platform: "browser",
    sourcemap: false,
    charset: "utf8",
    legalComments: "none",
    // Write metadata so we can report the bundle size
    metafile: true,
  });

  // Report bundle size
  const outPath = resolve(OUT_DIR, OUT_FILE);
  const stats = statSync(outPath);
  const sizeKB = (stats.size / 1024).toFixed(1);

  console.log(`✅ Widget built successfully!`);
  console.log(`   ${outPath}`);
  console.log(`   Size: ${sizeKB} KB\n`);

  if (stats.size > 20 * 1024) {
    console.warn(`⚠  Bundle exceeds 20KB target (${sizeKB} KB).`);
  } else {
    console.log(`   ✓ Under 20KB target`);
  }

  // Print a usage snippet for convenience
  console.log(`\n📋 Embed snippet:\n`);
  console.log(`   <script`);
  console.log(`     src="/widget/${OUT_FILE}"`);
  console.log(`     data-api-key="YOUR_GEMINI_API_KEY"`);
  console.log(`     data-name="AI Assistant"`);
  console.log(`     data-greeting="Hi! How can I help you today?"`);
  console.log(`   ><\/script>`);
}

main().catch((err) => {
  console.error("❌ Build failed:", err);
  process.exit(1);
});
