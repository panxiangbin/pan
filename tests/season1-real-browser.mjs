import { chromium } from "playwright";
import fs from "node:fs";
import crypto from "node:crypto";

const chunkPaths = Array.from({ length: 7 }, (_, index) =>
  `assets/upload-season1/part-${String(index + 1).padStart(2, "0")}.txt`
);
const chunkTexts = chunkPaths.map(path => fs.readFileSync(path, "utf8").replace(/\s+/g, ""));
const diskBase64 = chunkTexts.join("");
const diskBuffer = Buffer.from(diskBase64, "base64");
const staticUpload = {
  chunkLengths: chunkTexts.map(text => text.length),
  base64Length: diskBase64.length,
  byteLength: diskBuffer.length,
  headerHex: diskBuffer.subarray(0, 16).toString("hex"),
  sha256: crypto.createHash("sha256").update(diskBuffer).digest("hex")
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const pageErrors = [];
const consoleMessages = [];
let stage = "launch";
let fatalError = "";

page.on("pageerror", error => pageErrors.push(error.stack || error.message));
page.on("console", message => consoleMessages.push(`${message.type()}: ${message.text()}`));

try {
  stage = "open";
  await page.goto("http://127.0.0.1:4173/?v=season1-real-11", { waitUntil: "networkidle" });
  stage = "click-season-mode";
  await page.locator(".season-mode-button").click();
  stage = "wait-card";
  await page.locator('.season-card[data-season-number="1"] .season-card-art').waitFor({ state: "visible" });
  stage = "wait-real-source";
  await page.waitForFunction(() => window.SEASON_COVERS?.[1]?.startsWith("data:image/webp;base64,"), null, { timeout: 8000 });
  stage = "wait-card-marker";
  await page.waitForFunction(() => document.querySelector('.season-card[data-season-number="1"] .season-card-art')?.dataset.coverSource === "season-1-realistic-webp", null, { timeout: 5000 });
  stage = "click-card";
  await page.locator('.season-card[data-season-number="1"]').click();
  stage = "wait-detail";
  await page.locator('.season-detail-visual[data-season-art="1"]').waitFor({ state: "visible" });
  await page.waitForFunction(() => document.querySelector('.season-detail-visual[data-season-art="1"]')?.dataset.coverSource === "season-1-realistic-webp", null, { timeout: 5000 });
  stage = "complete";
} catch (error) {
  fatalError = error.stack || error.message || String(error);
}

const result = await page.evaluate(async () => {
  const source = window.SEASON_COVERS?.[1] || "";
  const art = document.querySelector('.season-card[data-season-number="1"] .season-card-art');
  const visual = document.querySelector('.season-detail-visual[data-season-art="1"]');
  const scripts = [...document.scripts].map(script => script.getAttribute("src")).filter(Boolean);
  let width = 0;
  let height = 0;
  let decodeError = "";
  if (source.startsWith("data:image/")) {
    const image = new Image();
    image.src = source;
    try {
      await image.decode();
      width = image.naturalWidth;
      height = image.naturalHeight;
    } catch (error) {
      decodeError = error.message || String(error);
    }
  }
  return {
    href: location.href,
    sourcePrefix: source.slice(0, 40),
    sourceLength: source.length,
    width,
    height,
    decodeError,
    cardExists: Boolean(art),
    cardMarker: art?.dataset.coverSource || "",
    cardBackground: art ? getComputedStyle(art).backgroundImage.slice(0, 120) : "",
    detailExists: Boolean(visual),
    detailMarker: visual?.dataset.coverSource || "",
    scripts,
    readyState: document.readyState
  };
});

const output = { staticUpload, stage, fatalError, result, pageErrors, consoleMessages };
fs.writeFileSync("season1-real-browser-result.json", JSON.stringify(output, null, 2));
await page.screenshot({ path: "season1-real-browser.png", fullPage: true });
await browser.close();
console.log(JSON.stringify(output, null, 2));

const failures = [];
if (staticUpload.sha256 !== "77e9722375d29b1edba91d8b0340c25261c68f686773277c443ae9c1432d5f7c") {
  failures.push(`上传数据哈希错误：${staticUpload.sha256}`);
}
if (fatalError) failures.push(`阶段 ${stage} 失败：${fatalError}`);
if (pageErrors.length) failures.push(`页面错误：${pageErrors.join(" | ")}`);
if (result.width !== 960 || result.height !== 540) failures.push(`图片尺寸异常：${result.width}×${result.height}，${result.decodeError}`);
if (result.sourceLength < 40000) failures.push(`图片数据过短：${result.sourceLength}`);
if (result.cardMarker !== "season-1-realistic-webp") failures.push(`卡片标记错误：${result.cardMarker}`);
if (!result.cardBackground.includes("data:image/webp;base64")) failures.push("卡片没有应用写实WebP");
if (!result.detailExists || result.detailMarker !== "season-1-realistic-webp") failures.push(`详情封面未应用：${result.detailMarker}`);

if (failures.length) {
  console.error("第1季写实封面浏览器验证失败：");
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}
console.log("第1季写实封面浏览器验证通过");