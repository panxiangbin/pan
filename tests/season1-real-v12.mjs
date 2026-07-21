import { chromium } from "playwright";
import fs from "node:fs";
import crypto from "node:crypto";

const paths = [
  "assets/upload-season1/part-01.txt",
  "assets/upload-season1/part-02.txt",
  "assets/upload-season1/part-03.txt",
  "assets/upload-season1/part-04a.txt",
  "assets/upload-season1/part-04b.txt",
  "assets/upload-season1/part-05.txt",
  "assets/upload-season1/part-06.txt",
  "assets/upload-season1/part-07.txt"
];
const base64 = paths.map(path => fs.readFileSync(path, "utf8").replace(/\s+/g, "")).join("");
const raw = Buffer.from(base64, "base64");
const sha256 = crypto.createHash("sha256").update(raw).digest("hex");
if (base64.length !== 48852) throw new Error(`Base64长度错误：${base64.length}`);
if (raw.length !== 36638) throw new Error(`WebP字节数错误：${raw.length}`);
if (sha256 !== "77e9722375d29b1edba91d8b0340c25261c68f686773277c443ae9c1432d5f7c") throw new Error(`WebP哈希错误：${sha256}`);

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", error => errors.push(error.stack || error.message));
page.on("console", message => {
  if (message.type() === "error") errors.push(message.text());
});

await page.goto("http://127.0.0.1:4173/?v=season1-real-12", { waitUntil: "networkidle" });
await page.locator(".season-mode-button").click();
await page.locator('.season-card[data-season-number="1"] .season-card-art').waitFor({ state: "visible" });
await page.waitForFunction(() => window.SEASON_COVERS?.[1]?.startsWith("data:image/webp;base64,"), null, { timeout: 15000 });
await page.waitForFunction(() => document.querySelector('.season-card[data-season-number="1"] .season-card-art')?.dataset.coverSource === "season-1-realistic-webp", null, { timeout: 10000 });

const card = await page.evaluate(async () => {
  const source = window.SEASON_COVERS[1];
  const image = new Image();
  image.src = source;
  await image.decode();
  const art = document.querySelector('.season-card[data-season-number="1"] .season-card-art');
  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    sourceLength: source.length,
    marker: art.dataset.coverSource,
    background: getComputedStyle(art).backgroundImage.slice(0, 80)
  };
});

await page.locator('.season-card[data-season-number="1"]').click();
await page.locator('.season-detail-visual[data-season-art="1"]').waitFor({ state: "visible" });
await page.waitForFunction(() => document.querySelector('.season-detail-visual[data-season-art="1"]')?.dataset.coverSource === "season-1-realistic-webp", null, { timeout: 10000 });
const detail = await page.evaluate(() => {
  const visual = document.querySelector('.season-detail-visual[data-season-art="1"]');
  return { marker: visual.dataset.coverSource, background: getComputedStyle(visual).backgroundImage.slice(0, 80) };
});

await page.screenshot({ path: "season1-real-v12.png", fullPage: true });
fs.writeFileSync("season1-real-v12.json", JSON.stringify({ sha256, card, detail, errors }, null, 2));
await browser.close();

if (errors.some(error => error.includes("第1季写实封面加载失败") || error.includes("ERR_INVALID_URL"))) throw new Error(errors.join(" | "));
if (card.width !== 960 || card.height !== 540) throw new Error(`图片尺寸错误：${card.width}×${card.height}`);
if (card.marker !== "season-1-realistic-webp" || !card.background.includes("data:image/webp")) throw new Error("卡片未使用写实封面");
if (detail.marker !== "season-1-realistic-webp" || !detail.background.includes("data:image/webp")) throw new Error("详情未使用写实封面");
console.log("第1季写实封面V12浏览器验证通过");