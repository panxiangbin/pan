import { chromium } from "playwright";
import fs from "node:fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const pageErrors = [];
const consoleErrors = [];
page.on("pageerror", error => pageErrors.push(error.stack || error.message));
page.on("console", message => {
  if (message.type() === "error") consoleErrors.push(message.text());
});

await page.goto("http://127.0.0.1:4173/?v=season1-real-11", { waitUntil: "networkidle" });
await page.locator(".season-mode-button").click();
await page.locator('.season-card[data-season-number="1"] .season-card-art').waitFor({ state: "visible" });
await page.waitForFunction(() => window.SEASON_COVERS?.[1]?.startsWith("data:image/webp;base64,"), null, { timeout: 15000 });
await page.waitForFunction(() => document.querySelector('.season-card[data-season-number="1"] .season-card-art')?.dataset.coverSource === "season-1-realistic-webp", null, { timeout: 15000 });

const beforeClick = await page.evaluate(async () => {
  const source = window.SEASON_COVERS[1];
  const image = new Image();
  image.src = source;
  await image.decode();
  const art = document.querySelector('.season-card[data-season-number="1"] .season-card-art');
  const style = getComputedStyle(art);
  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
    sourceLength: source.length,
    marker: art.dataset.coverSource,
    background: style.backgroundImage,
    rect: art.getBoundingClientRect().toJSON()
  };
});

await page.locator('.season-card[data-season-number="1"]').click();
await page.locator('.season-detail-visual[data-season-art="1"]').waitFor({ state: "visible" });
await page.waitForFunction(() => document.querySelector('.season-detail-visual[data-season-art="1"]')?.dataset.coverSource === "season-1-realistic-webp", null, { timeout: 10000 });

const detail = await page.evaluate(() => {
  const visual = document.querySelector('.season-detail-visual[data-season-art="1"]');
  return {
    marker: visual.dataset.coverSource,
    background: getComputedStyle(visual).backgroundImage,
    rect: visual.getBoundingClientRect().toJSON()
  };
});

const result = { beforeClick, detail, pageErrors, consoleErrors };
fs.writeFileSync("season1-real-browser-result.json", JSON.stringify(result, null, 2));
await page.screenshot({ path: "season1-real-browser.png", fullPage: true });
await browser.close();

const failures = [];
if (pageErrors.length) failures.push(`页面错误：${pageErrors.join(" | ")}`);
if (consoleErrors.some(item => item.includes("第1季写实封面加载失败"))) failures.push(consoleErrors.join(" | "));
if (beforeClick.width !== 960 || beforeClick.height !== 540) failures.push(`图片尺寸异常：${beforeClick.width}×${beforeClick.height}`);
if (beforeClick.sourceLength < 40000) failures.push(`图片数据过短：${beforeClick.sourceLength}`);
if (beforeClick.marker !== "season-1-realistic-webp") failures.push(`卡片标记错误：${beforeClick.marker}`);
if (!beforeClick.background.includes("data:image/webp;base64")) failures.push("卡片没有应用写实WebP");
if (beforeClick.rect.width < 200 || beforeClick.rect.height < 150) failures.push("卡片封面区域尺寸异常");
if (detail.marker !== "season-1-realistic-webp") failures.push(`详情标记错误：${detail.marker}`);
if (!detail.background.includes("data:image/webp;base64")) failures.push("详情没有应用写实WebP");

console.log(JSON.stringify(result, null, 2));
if (failures.length) {
  console.error("第1季写实封面浏览器验证失败：");
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log("第1季写实封面浏览器验证通过");