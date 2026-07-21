import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function read(relativePath) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) {
    failures.push(`缺少文件：${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

const windowObject = {};
try {
  vm.runInNewContext(read("season-cover-sprite.js"), { window: windowObject }, { timeout: 2000 });
} catch (error) {
  failures.push(`season-cover-sprite.js 无法执行：${error.message}`);
}

const covers = windowObject.SEASON_COVERS || {};
if (Object.keys(covers).length !== 8) failures.push(`独立封面映射应为8张，当前为${Object.keys(covers).length}张`);

for (let season = 1; season <= 8; season += 1) {
  const expectedPath = `assets/season-covers/season-${season}.svg`;
  const source = covers[season] || "";
  if (!source.startsWith(expectedPath)) failures.push(`第${season}季后备封面路径错误：${source}`);
  const svg = read(expectedPath);
  if (!svg.includes("<svg") || !svg.includes("viewBox=\"0 0 1000 562.5\"")) failures.push(`第${season}季不是标准16:9 SVG`);
  if (!svg.includes(`<title id=\"t\">第${season}季原创封面</title>`)) failures.push(`第${season}季SVG标题异常`);
  if (svg.length < 800) failures.push(`第${season}季SVG内容过短，可能损坏`);
}

const realCoverParts = [
  "assets/upload-season1/part-01.txt",
  "assets/upload-season1/part-02.txt",
  "assets/upload-season1/part-03.txt",
  "assets/upload-season1/part-04a.txt",
  "assets/upload-season1/part-04b.txt",
  "assets/upload-season1/part-05.txt",
  "assets/upload-season1/part-06.txt",
  "assets/upload-season1/part-07.txt"
];
const realCoverBase64 = realCoverParts.map(read).join("").replace(/\s+/g, "");
const realCoverBytes = Buffer.from(realCoverBase64, "base64");
const realCoverHash = crypto.createHash("sha256").update(realCoverBytes).digest("hex");
if (realCoverBase64.length !== 48852) failures.push(`第1季写实封面Base64长度异常：${realCoverBase64.length}`);
if (realCoverBytes.length !== 36638) failures.push(`第1季写实封面字节数异常：${realCoverBytes.length}`);
if (!realCoverBytes.subarray(0, 12).toString("ascii").startsWith("RIFF") || realCoverBytes.subarray(8, 12).toString("ascii") !== "WEBP") {
  failures.push("第1季写实封面不是有效WebP容器");
}
if (realCoverHash !== "77e9722375d29b1edba91d8b0340c25261c68f686773277c443ae9c1432d5f7c") {
  failures.push(`第1季写实封面SHA256异常：${realCoverHash}`);
}

const realLoader = read("season1-real-cover.js");
if (!realLoader.includes("season-1-realistic-webp") || !realLoader.includes("Object.freeze({")) {
  failures.push("第1季写实封面应用脚本不完整");
}
if (!realLoader.includes("part-04a.txt") || !realLoader.includes("part-04b.txt")) {
  failures.push("第1季写实封面没有使用完整重传数据");
}

const direct = read("season-cover-direct.js");
if (!direct.includes("window.SEASON_COVERS") || !direct.includes("data.coverSource") && !direct.includes("dataset.coverSource")) {
  failures.push("独立封面应用脚本不完整");
}
if (!direct.includes("background-size") || !direct.includes("cover")) failures.push("独立封面没有使用cover适配");

const runtime = read("runtime-fixes.js");
if (!runtime.includes("season-cover-direct.js?v=cover-art-10")) failures.push("扩展加载器未接入八季后备封面脚本");
if (!runtime.includes("season1-real-cover.js?v=season1-real-13")) failures.push("扩展加载器未接入第1季写实封面V13");

const index = read("index.html");
if (!index.includes("runtime-fixes.js?v=season1-real-13")) failures.push("入口页面没有强制加载第1季写实封面V13");

if (failures.length) {
  console.error("八季封面静态检查失败：");
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log("封面静态检查通过：8张后备SVG与第1季960×540写实WebP均完整，缓存版本为V13");