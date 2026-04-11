// Sentry — visual QA screenshot script
// Usage: node scripts/qa-screenshots.mjs [--base http://localhost:3000]

import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const BASE = process.argv.includes("--base")
  ? process.argv[process.argv.indexOf("--base") + 1]
  : "http://localhost:3000";

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/work", name: "work-index" },
  { path: "/work/phantm", name: "work-phantm" },
  { path: "/work/dalle", name: "work-dalle" },
  { path: "/work/studia", name: "work-studia" },
  { path: "/work/mocha-property", name: "work-mocha" },
  { path: "/work/telos", name: "work-telos" },
  { path: "/work/liveself", name: "work-liveself" },
  { path: "/work/mabilabs", name: "work-mabilabs" },
  { path: "/work/deep-research-agent", name: "work-deepresearch" },
  { path: "/work/purselley", name: "work-purselley" },
  { path: "/work/lenticular", name: "work-lenticular" },
  { path: "/creative", name: "creative" },
  { path: "/services", name: "services" },
  { path: "/chat", name: "chat" },
  { path: "/now", name: "now" },
  { path: "/resume", name: "resume" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

const OUT_DIR = join(process.cwd(), "qa-screenshots");

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const report = [];

  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });
    const page = await ctx.newPage();

    // Capture console errors
    const consoleErrors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(`PAGE: ${err.message}`));

    for (const route of ROUTES) {
      const url = `${BASE}${route.path}`;
      const errs = [];
      const startErrLen = consoleErrors.length;
      let status = 0;
      try {
        const resp = await page.goto(url, {
          waitUntil: "networkidle",
          timeout: 30000,
        });
        status = resp?.status() ?? 0;
        await page.waitForTimeout(800); // let animations settle
      } catch (e) {
        errs.push(`NAV: ${e.message}`);
      }

      const file = join(OUT_DIR, `${vp.name}-${route.name}.png`);
      try {
        await page.screenshot({ path: file, fullPage: true });
      } catch (e) {
        errs.push(`SHOT: ${e.message}`);
      }

      const newErrs = consoleErrors.slice(startErrLen);
      report.push({
        viewport: vp.name,
        route: route.path,
        status,
        file: file.replace(process.cwd() + "\\", "").replace(/\\/g, "/"),
        errors: [...errs, ...newErrs],
      });

      const statusIcon = status === 200 && newErrs.length === 0 && errs.length === 0 ? "✓" : "✗";
      console.log(`${statusIcon} [${vp.name}] ${route.path} (${status}) ${newErrs.length + errs.length} errors`);
    }

    await ctx.close();
  }

  await browser.close();

  // Write JSON report
  const fs = await import("node:fs/promises");
  await fs.writeFile(
    join(OUT_DIR, "report.json"),
    JSON.stringify(report, null, 2)
  );

  // Print summary
  const failed = report.filter((r) => r.status !== 200 || r.errors.length > 0);
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total: ${report.length} | OK: ${report.length - failed.length} | Issues: ${failed.length}`);
  if (failed.length > 0) {
    console.log("\nIssues:");
    for (const f of failed) {
      console.log(`  [${f.viewport}] ${f.route} (${f.status})`);
      for (const e of f.errors.slice(0, 3)) console.log(`    - ${e}`);
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
