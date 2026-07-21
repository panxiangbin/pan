import { chromium } from "playwright";
import fs from "node:fs";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const consoleMessages = [];
const pageErrors = [];

page.on("console", message => consoleMessages.push(`${message.type()}: ${message.text()}`));
page.on("pageerror", error => pageErrors.push(error.stack || error.message));

await page.goto("http://127.0.0.1:4173/?v=cover-browser-diagnosis", { waitUntil: "networkidle" });
await page.locator(".season-mode-button").click();
await page.locator(".season-card").first().waitFor({ state: "visible" });
await page.waitForTimeout(1200);

const result = await page.evaluate(async () => {
  const art = document.querySelector(".season-card-art");
  const detail = document.querySelector(".season-detail-visual");
  const sprite = window.SEASON_COVER_SPRITE || "";
  const image = new Image();
  let decodeError = "";
  image.src = sprite;
  try {
    await image.decode();
  } catch (error) {
    decodeError = String(error?.message || error);
  }

  const artStyle = art ? getComputedStyle(art) : null;
  const artRect = art?.getBoundingClientRect();
  return {
    location: location.href,
    title: document.title,
    spriteLength: sprite.length,
    spritePrefix: sprite.slice(0, 32),
    imageNaturalWidth: image.naturalWidth,
    imageNaturalHeight: image.naturalHeight,
    decodeError,
    seasonCards: document.querySelectorAll(".season-card").length,
    artCount: document.querySelectorAll(".season-card-art").length,
    artBackgroundImage: artStyle?.backgroundImage || "",
    artBackgroundSize: artStyle?.backgroundSize || "",
    artWidth: artRect?.width || 0,
    artHeight: artRect?.height || 0,
    detailExists: Boolean(detail),
    runtimeScripts: [...document.scripts].map(script => script.getAttribute("src")).filter(Boolean),
    bodyTextSample: document.body.innerText.slice(0, 500)
  };
});

const output = { result, consoleMessages, pageErrors };
fs.writeFileSync("cover-browser-result.json", JSON.stringify(output, null, 2));
await page.screenshot({ path: "cover-browser-screenshot.png", fullPage: true });
await browser.close();

console.log(JSON.stringify(output, null, 2));

const failures = [];
if (pageErrors.length) failures.push(`页面错误：${pageErrors.join(" | ")}`);
if (result.seasonCards !== 8) failures.push(`季度卡数量异常：${result.seasonCards}`);
if (result.artCount !== 8) failures.push(`季度封面节点数量异常：${result.artCount}`);
if (!result.spriteLength) failures.push("SEASON_COVER_SPRITE 为空");
if (!result.imageNaturalWidth || !result.imageNaturalHeight) failures.push(`封面图无法解码：${result.decodeError || "尺寸为0"}`);
if (!result.artBackgroundImage.includes("data:image")) failures.push("季度卡片未应用封面数据 URI");
if (result.artWidth < 100 || result.artHeight < 100) failures.push(`封面区域尺寸异常：${result.artWidth}×${result.artHeight}`);

if (failures.length) {
  console.error("\n封面浏览器测试失败：");
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log("封面浏览器测试通过");