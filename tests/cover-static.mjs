import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
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
  if (!source.startsWith(expectedPath)) failures.push(`第${season}季映射路径错误：${source}`);
  const svg = read(expectedPath);
  if (!svg.includes("<svg") || !svg.includes("viewBox=\"0 0 1000 562.5\"")) failures.push(`第${season}季不是标准16:9 SVG`);
  if (!svg.includes(`<title id=\"t\">第${season}季原创封面</title>`)) failures.push(`第${season}季SVG标题异常`);
  if (svg.length < 800) failures.push(`第${season}季SVG内容过短，可能损坏`);
}

const direct = read("season-cover-direct.js");
if (!direct.includes("window.SEASON_COVERS") || !direct.includes("data.coverSource") && !direct.includes("dataset.coverSource")) {
  failures.push("独立封面应用脚本不完整");
}
if (!direct.includes("background-size") || !direct.includes("cover")) failures.push("独立封面没有使用cover适配");

const runtime = read("runtime-fixes.js");
if (!runtime.includes("season-cover-direct.js?v=cover-art-10")) failures.push("扩展加载器未接入独立封面脚本");

const index = read("index.html");
if (!index.includes("runtime-fixes.js?v=cover-art-10")) failures.push("入口页面没有强制加载独立封面版本");

if (failures.length) {
  console.error("八季封面静态检查失败：");
  failures.forEach((failure, index) => console.error(`${index + 1}. ${failure}`));
  process.exit(1);
}

console.log("八季独立封面静态检查通过：8张SVG、映射、加载器与缓存版本均正确");
