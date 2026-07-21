import { chromium } from "playwright";
import fs from "node:fs";

const url = `https://panxiangbin.github.io/pan/?v=season1-real-13-public-${Date.now()}`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on("pageerror", error => errors.push(error.stack || error.message));
page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.locator(".season-mode-button").click();
await page.locator('.season-card[data-season-number="1"] .season-card-art').waitFor({ state: "visible", timeout: 20000 });
await page.waitForFunction(() => window.SEASON_COVERS?.[1]?.startsWith("data:image/webp;base64,"), null, { timeout: 30000 });
await page.waitForFunction(() => document.querySelector('.season-card[data-season-number="1"] .season-card-art')?.dataset.coverSource === "season-1-realistic-webp", null, { timeout: 20000 });

const card = await page.evaluate(async () => {
  const source = window.SEASON_COVERS[1];
  const image = new Image();
  image.src = source;
  await image.decode();
  const art = document.querySelector('.season-card[data-season-number="1"] .season-card-art');
  const rect = art.getBoundingClientRect();
  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    marker: art.dataset.coverSource,
    background: getComputedStyle(art).backgroundImage.slice(0, 90),
    rect: { width: rect.width, height: rect.height }
  };
});

await page.locator('.season-card[data-season-number="1"]').click();
await page.locator('.season-detail-visual[data-season-art="1"]').waitFor({ state: "visible", timeout: 15000 });
await page.waitForFunction(() => document.querySelector('.season-detail-visual[data-season-art="1"]')?.dataset.coverSource === "season-1-realistic-webp", null, { timeout: 15000 });
const detail = await page.evaluate(() => {
  const visual = document.querySelector('.season-detail-visual[data-season-art="1"]');
  const rect = visual.getBoundingClientRect();
  return {
    marker: visual.dataset.coverSource,
    background: getComputedStyle(visual).backgroundImage.slice(0, 90),
    rect: { width: rect.width, height: rect.height }
  };
});

const output = { url, title: await page.title(), card, detail, errors };
fs.writeFileSync("public-season1-real-v13.json", JSON.stringify(output, null, 2));
await page.screenshot({ path: "public-season1-real-v13.png", fullPage: true });
await browser.close();
console.log(JSON.stringify(output, null, 2));

if (errors.some(error => error.includes("第1季写实封面加载失败") || error.includes("Failed to load resource") || error.includes("ERR_"))) {
  throw new Error(errors.join(" | "));
}
if (card.width !== 960 || card.height !== 540) throw new Error(`公网图片尺寸错误：${card.width}×${card.height}`);
if (card.marker !== "season-1-realistic-webp" || !card.background.includes("data:image/webp")) throw new Error("公网卡片未显示写实封面");
if (card.rect.width < 200 || card.rect.height < 150) throw new Error(`公网卡片封面区域异常：${card.rect.width}×${card.rect.height}`);
if (detail.marker !== "season-1-realistic-webp" || !detail.background.includes("data:image/webp")) throw new Error("公网详情未显示写实封面");
console.log("第1季写实封面公网浏览器验证通过");