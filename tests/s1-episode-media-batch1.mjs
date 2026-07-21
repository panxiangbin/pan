import { chromium } from "playwright";
import fs from "node:fs";

const imagePath = "assets/season1-episodes/episode-01.webp";
const raw = fs.readFileSync(imagePath);
if (raw.length < 40000 || raw.subarray(0, 4).toString() !== "RIFF" || raw.subarray(8, 12).toString() !== "WEBP") {
  throw new Error(`第1集WebP文件异常：${raw.length} bytes`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 });
await page.goto("http://127.0.0.1:4173/assets/season1-episodes/episode-01.webp", { waitUntil: "load" });
const image = page.locator("img");
await image.waitFor({ state: "visible", timeout: 10000 });
await image.evaluate(async element => element.decode());
const dimensions = await image.evaluate(element => ({ width: element.naturalWidth, height: element.naturalHeight }));
if (dimensions.width !== 480 || dimensions.height !== 600) throw new Error(`浏览器解码尺寸异常：${dimensions.width}×${dimensions.height}`);

await page.goto("http://127.0.0.1:4173/?v=s1-episode-media-2", { waitUntil: "networkidle" });
await page.waitForFunction(() => [...document.scripts].some(script => script.src.includes("season1-episode-visuals.js")), null, { timeout: 30000 });
const runtimeText = fs.readFileSync("runtime-fixes.js", "utf8");
if (!runtimeText.includes("season1-episode-visuals.js?v=s1-episode-media-2")) throw new Error("运行时未接入分集图文模块V2");
await page.screenshot({ path: "s1-episode-media-batch1.png", fullPage: true });
fs.writeFileSync("s1-episode-media-batch1.json", JSON.stringify({ dimensions, bytes: raw.length }, null, 2));
await browser.close();
console.log(`第1季第1集图片浏览器验证通过：${raw.length} bytes，${dimensions.width}×${dimensions.height}`);
