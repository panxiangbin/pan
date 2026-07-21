import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`缺少文件：${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

for (let season = 1; season <= 8; season += 1) {
  const relativePath = `assets/season-detail/season-${season}.svg`;
  const svg = read(relativePath);
  if (!svg) continue;
  if (!svg.startsWith("<svg")) failures.push(`${relativePath} 不是有效 SVG 文本`);
  if (!svg.includes('viewBox="0 0 1600 900"')) failures.push(`${relativePath} 尺寸不是 1600×900`);
  if (!svg.includes(`<title id="title">第${season}季`)) failures.push(`${relativePath} 缺少正确季度标题`);
  if (!svg.includes("原创同人剧情信息图")) failures.push(`${relativePath} 缺少原创信息图说明`);
  if (svg.includes("�")) failures.push(`${relativePath} 出现乱码替换字符`);
  if (Buffer.byteLength(svg, "utf8") < 4000) failures.push(`${relativePath} 内容体积异常`);
}

const script = read("season-infographics.js");
const stylesheet = read("season-infographics.css");
const runtime = read("runtime-fixes.js");

if (!script.includes("assets/season-detail/season-${season}.svg")) failures.push("信息图脚本没有使用季度图片路径模板");
if (!script.includes('loading="lazy"') || !script.includes('decoding="async"')) failures.push("信息图缺少延迟加载或异步解码");
if (!stylesheet.includes("aspect-ratio: 16 / 9")) failures.push("信息图样式缺少 16:9 比例约束");
if (!runtime.includes("season-infographics.js") || !runtime.includes("season-infographics.css")) failures.push("runtime-fixes.js 未完整接入信息图模块");

if (failures.length) {
  console.error("\n八季剧情信息图校验失败：");
  failures.forEach((message, index) => console.error(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log("八季剧情信息图校验通过：8 张 1600×900 SVG 均已上传并接入。");