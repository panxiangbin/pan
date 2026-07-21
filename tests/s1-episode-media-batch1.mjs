import { chromium } from "playwright";
import fs from "node:fs";

const imagePath = "assets/season1-episodes/episode-01.webp";
const raw = fs.readFileSync(imagePath);
if (raw.length < 40000 || raw.subarray(0, 4).toString() !== "RIFF" || raw.subarray(8, 12).toString() !== "WEBP") {
  throw new Error(`第1集WebP文件异常：${raw.length} bytes`);
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", error => errors.push(error.stack || error.message));
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });

await page.goto("http://127.0.0.1:4173/?v=s1-episode-media-1", { waitUntil: "networkidle" });
await page.locator(".season-mode-button").click();
await page.locator('.season-card[data-season-number="1"]').click();
await page.locator('[data-story-view="episodes"]').click();
const media = page.locator('#season-1-episode-1 .season-episode-media');
await media.waitFor({ state: "visible", timeout: 20000 });
const image = media.locator("img");
await image.evaluate(async element => element.decode());
const dimensions = await image.evaluate(element => ({ width: element.naturalWidth, height: element.naturalHeight }));
if (dimensions.width !== 480 || dimensions.height !== 600) throw new Error(`图片尺寸异常：${dimensions.width}×${dimensions.height}`);
await media.click();
await page.locator(".episode-story-dialog:not([hidden])").waitFor({ state: "visible" });
await page.locator(".episode-story-dialog img").evaluate(async element => element.decode());
const dialogTitle = await page.locator("#episodeStoryTitle").textContent();
if (!dialogTitle?.includes("王室抵达临冬城")) throw new Error(`详情标题异常：${dialogTitle}`);
await page.screenshot({ path: "s1-episode-media-batch1.png", fullPage: true });
await browser.close();
if (errors.some(error => error.includes("Failed to load resource") || error.includes("脚本加载失败"))) throw new Error(errors.join(" | "));
console.log(`第1季第1集图文剧情卡验证通过：${raw.length} bytes，${dimensions.width}×${dimensions.height}`);
