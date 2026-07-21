import { chromium } from "playwright";
import fs from "node:fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const consoleMessages = [];
const pageErrors = [];

page.on("console", message => consoleMessages.push(`${message.type()}: ${message.text()}`));
page.on("pageerror", error => pageErrors.push(error.stack || error.message));

await page.goto("http://127.0.0.1:4173/?v=cover-art-10", { waitUntil: "networkidle" });
await page.locator(".season-mode-button").click();
await page.locator(".season-card").first().waitFor({ state: "visible" });
await page.waitForTimeout(900);
await page.locator(".season-card").first().click();
await page.locator(".season-detail-visual").waitFor({ state: "visible" });
await page.waitForTimeout(900);

const result = await page.evaluate(async () => {
  const coverMap = window.SEASON_COVERS || {};
  const decodeResults = [];

  for (let season = 1; season <= 8; season += 1) {
    const src = coverMap[season] || "";
    const image = new Image();
    let error = "";
    image.src = src;
    try {
      await image.decode();
    } catch (decodeError) {
      error = String(decodeError?.message || decodeError);
    }
    decodeResults.push({ season, src, width: image.naturalWidth, height: image.naturalHeight, error });
  }

  const cards = [...document.querySelectorAll(".season-card")];
  const cardResults = cards.map(card => {
    const art = card.querySelector(".season-card-art");
    const style = art ? getComputedStyle(art) : null;
    const rect = art?.getBoundingClientRect();
    return {
      season: Number(card.dataset.seasonNumber),
      source: art?.dataset.coverSource || "",
      backgroundImage: style?.backgroundImage || "",
      width: rect?.width || 0,
      height: rect?.height || 0
    };
  });

  const detail = document.querySelector(".season-detail-visual");
  const detailStyle = detail ? getComputedStyle(detail) : null;
  const detailRect = detail?.getBoundingClientRect();
  return {
    coverKeys: Object.keys(coverMap),
    decodeResults,
    cardResults,
    detail: {
      exists: Boolean(detail),
      source: detail?.dataset.coverSource || "",
      backgroundImage: detailStyle?.backgroundImage || "",
      width: detailRect?.width || 0,
      height: detailRect?.height || 0
    }
  };
});

const output = { result, consoleMessages, pageErrors };
fs.writeFileSync("cover-browser-result.json", JSON.stringify(output, null, 2));
await page.screenshot({ path: "cover-browser-screenshot.png", fullPage: true });
await browser.close();
console.log(JSON.stringify(output, null, 2));

const failures = [];
if (pageErrors.length) failures.push(`页面错误：${pageErrors.join(" | ")}`);
if (result.coverKeys.length !== 8) failures.push(`独立封面映射数量异常：${result.coverKeys.length}`);
result.decodeResults.forEach(item => {
  if (!item.src.includes(`season-${item.season}.svg`)) failures.push(`第${item.season}季封面路径错误：${item.src}`);
  if (!item.width || !item.height) failures.push(`第${item.season}季封面无法解码：${item.error || "尺寸为0"}`);
});
if (result.cardResults.length !== 8) failures.push(`季度卡数量异常：${result.cardResults.length}`);
result.cardResults.forEach(item => {
  if (!item.source.includes(`season-${item.season}.svg`)) failures.push(`第${item.season}季卡片未使用独立封面：${item.source}`);
  if (!item.backgroundImage.includes(`season-${item.season}.svg`)) failures.push(`第${item.season}季卡片背景路径错误`);
  if (item.width < 100 || item.height < 100) failures.push(`第${item.season}季封面区域尺寸异常：${item.width}×${item.height}`);
});
if (!result.detail.exists) failures.push("右侧详情封面节点不存在");
if (!result.detail.source.includes("season-1.svg")) failures.push(`右侧详情未使用第1季独立封面：${result.detail.source}`);
if (result.detail.width < 100 || result.detail.height < 100) failures.push(`右侧详情封面尺寸异常：${result.detail.width}×${result.detail.height}`);
if (consoleMessages.some(message => message.includes("ERR_INVALID_URL") || message.includes("Failed to load resource"))) failures.push("浏览器报告封面资源加载错误");

if (failures.length) {
  console.error("\n正式封面浏览器测试失败：");
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log("正式八季独立封面浏览器测试通过");
