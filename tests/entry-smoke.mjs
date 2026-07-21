import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const app = read("app.js");
const runtime = read("runtime-fixes.js");

const failures = [];
const fail = message => failures.push(message);

if (html.split(/\r?\n/).length < 150) {
  fail(`index.html 行数异常：${html.split(/\r?\n/).length}，入口页面可能被截断`);
}

if (!html.startsWith("<!DOCTYPE html>")) fail("index.html 缺少 DOCTYPE");
if (!html.includes("</body>") || !html.includes("</html>")) fail("index.html 缺少完整结束标签");

const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]));
const appIds = new Set([...app.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map(match => match[1]));

for (const id of appIds) {
  if (!ids.has(id)) fail(`app.js 需要的页面节点不存在：#${id}`);
}

const criticalIds = [
  "homeButton", "globalSearch", "clearSearch", "searchResults", "openPanel",
  "mapViewport", "mapScene", "territoryLayer", "routeLayer", "locationLayer",
  "eventLayer", "mapStatus", "mapLegend", "dragHint", "zoomIn", "zoomOut",
  "resetView", "timelinePanel", "timelineRange", "timelineTicks", "timelineYear",
  "timelineTitle", "timelineDetail", "sidePanel", "panelType", "closePanel", "panelContent"
];
for (const id of criticalIds) {
  if (!ids.has(id)) fail(`入口缺少核心节点：#${id}`);
}

const scripts = ["data.js", "app.js", "enhancements.js", "runtime-fixes.js"];
let lastPosition = -1;
for (const script of scripts) {
  const position = html.indexOf(script);
  if (position < 0) fail(`index.html 未加载 ${script}`);
  if (position >= 0 && position < lastPosition) fail(`脚本加载顺序错误：${script}`);
  lastPosition = Math.max(lastPosition, position);
}

if (!runtime.trimStart().startsWith("(() => {")) fail("runtime-fixes.js 开头不完整");
if (!runtime.trimEnd().endsWith("})();")) fail("runtime-fixes.js 结尾不完整");
for (const required of ["loadScript", "ensureStylesheet", "season-cover-sprite.js", "seasons.js"]) {
  if (!runtime.includes(required)) fail(`runtime-fixes.js 缺少关键加载逻辑：${required}`);
}

if (failures.length) {
  console.error("入口冒烟测试失败：");
  failures.forEach((message, index) => console.error(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log("入口冒烟测试通过：");
console.log(`- index.html：${html.split(/\r?\n/).length} 行`);
console.log(`- 核心 DOM 节点：${criticalIds.length} 个`);
console.log(`- app.js 引用节点：${appIds.size} 个，全部存在`);
console.log("- 核心脚本顺序和扩展加载器完整性正常");