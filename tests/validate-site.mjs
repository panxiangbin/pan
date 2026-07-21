import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
const notes = [];

function fail(message) {
  failures.push(message);
}

function note(message) {
  notes.push(message);
}

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    fail(`缺少文件：${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function evaluateDataFile(relativePath, windowObject) {
  const source = read(relativePath);
  if (!source) return;
  try {
    vm.runInNewContext(source, { window: windowObject }, { filename: relativePath, timeout: 2000 });
  } catch (error) {
    fail(`${relativePath} 无法执行：${error.message}`);
  }
}

const requiredFiles = [
  "index.html",
  "data.js",
  "seasons-data.js",
  "season-media-data.js",
  "season-cover-sprite.js",
  "seasons.js",
  "season-details.js",
  "season-details.css",
  "season-navigation.css",
  "episode-data.js",
  "episode-guide.js",
  "episode-guide.css",
  "episode-overview.js",
  "episode-overview.css",
  "episode-search.js",
  "episode-search.css",
  "episode-links.js",
  "episode-links.css",
  "runtime-fixes.js"
];
requiredFiles.forEach(read);

const jsFiles = fs.readdirSync(root)
  .filter(file => file.endsWith(".js"))
  .sort();

for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", path.join(root, file)], { encoding: "utf8" });
  if (result.status !== 0) fail(`${file} JavaScript 语法错误：${(result.stderr || result.stdout).trim()}`);
}
note(`已检查 ${jsFiles.length} 个 JavaScript 文件的语法`);

const windowObject = {};
evaluateDataFile("data.js", windowObject);
evaluateDataFile("seasons-data.js", windowObject);
evaluateDataFile("season-media-data.js", windowObject);
evaluateDataFile("episode-data.js", windowObject);
evaluateDataFile("season-cover-sprite.js", windowObject);

const locations = windowObject.WORLD_DATA?.locations || [];
const locationIds = new Set(locations.map(item => item.id));
if (locations.length < 10) fail(`地图地点数量异常：${locations.length}`);

const houses = windowObject.WORLD_DATA?.houses || [];
const timeline = windowObject.WORLD_DATA?.timeline || [];
if (houses.length < 8) fail(`家族数量异常：${houses.length}`);
if (timeline.length < 6) fail(`战争时间线数量异常：${timeline.length}`);

const seasons = windowObject.SEASON_GUIDE_DATA || [];
if (seasons.length !== 8) fail(`季度概述应为 8 季，当前为 ${seasons.length}`);
seasons.forEach((season, index) => {
  if (season.season !== index + 1) fail(`季度顺序错误：索引 ${index} 的 season 为 ${season.season}`);
  if (!season.title || !season.summary || !season.theme) fail(`第 ${season.season} 季概述字段不完整`);
});

const media = windowObject.SEASON_MEDIA_DATA || {};
let chapterTotal = 0;
for (let seasonNumber = 1; seasonNumber <= 8; seasonNumber += 1) {
  const chapters = media[seasonNumber]?.chapters;
  if (!Array.isArray(chapters) || chapters.length !== 5) {
    fail(`第 ${seasonNumber} 季应有 5 个章节导读，当前为 ${chapters?.length ?? 0}`);
    continue;
  }
  chapterTotal += chapters.length;
  chapters.forEach((chapter, index) => {
    if (!chapter.range || !chapter.title || !chapter.summary || !chapter.tension) {
      fail(`第 ${seasonNumber} 季第 ${index + 1} 个章节字段不完整`);
    }
    if (chapter.location && !locationIds.has(chapter.location)) {
      fail(`第 ${seasonNumber} 季章节地点不存在：${chapter.location}`);
    }
  });
}
if (chapterTotal !== 40) fail(`章节导读总数应为 40，当前为 ${chapterTotal}`);
note(`章节导读：${chapterTotal} 个`);

const episodeData = windowObject.SEASON_EPISODE_DATA || {};
const expectedEpisodeCounts = [10, 10, 10, 10, 10, 10, 7, 6];
let episodeTotal = 0;
for (let seasonNumber = 1; seasonNumber <= 8; seasonNumber += 1) {
  const episodes = episodeData[seasonNumber];
  const expected = expectedEpisodeCounts[seasonNumber - 1];
  if (!Array.isArray(episodes) || episodes.length !== expected) {
    fail(`第 ${seasonNumber} 季应有 ${expected} 集，当前为 ${episodes?.length ?? 0}`);
    continue;
  }
  episodeTotal += episodes.length;
  episodes.forEach((episode, index) => {
    if (episode.episode !== index + 1) fail(`第 ${seasonNumber} 季集数不连续：位置 ${index + 1} 为第 ${episode.episode} 集`);
    if (!episode.title || !episode.summary || !episode.turning) fail(`第 ${seasonNumber} 季第 ${episode.episode} 集字段不完整`);
    if (!Array.isArray(episode.characters) || episode.characters.length < 2) fail(`第 ${seasonNumber} 季第 ${episode.episode} 集人物数据不足`);
    if (episode.location && !locationIds.has(episode.location)) fail(`第 ${seasonNumber} 季第 ${episode.episode} 集地点不存在：${episode.location}`);
  });
}
if (episodeTotal !== 73) fail(`逐集剧情总数应为 73，当前为 ${episodeTotal}`);
note(`逐集剧情：${episodeTotal} 集`);

const sprite = windowObject.SEASON_COVER_SPRITE || "";
if (!sprite.startsWith("data:image/")) fail("八季封面压缩图集不是有效的 data:image URI");
else note(`封面图集字符数：${sprite.length}`);

const runtime = read("runtime-fixes.js");
for (const file of [
  "season-cover-sprite.js",
  "season-media-data.js",
  "episode-data.js",
  "episode-guide.js",
  "episode-overview.js",
  "episode-search.js",
  "episode-links.js",
  "episode-guide.css",
  "episode-overview.css",
  "episode-search.css",
  "episode-links.css"
]) {
  if (!runtime.includes(file)) fail(`runtime-fixes.js 未接入：${file}`);
}

const indexHtml = read("index.html");
if (!indexHtml.includes("runtime-fixes.js")) fail("index.html 未加载 runtime-fixes.js");

for (const file of requiredFiles) {
  const content = read(file);
  if (content.includes("�")) fail(`${file} 出现乱码替换字符`);
}

if (failures.length) {
  console.error("\n网站校验失败：");
  failures.forEach((message, index) => console.error(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log("网站校验通过：");
notes.forEach(message => console.log(`- ${message}`));
console.log(`- 地图地点：${locations.length} 个，家族：${houses.length} 个，战争节点：${timeline.length} 个`);
console.log("- 八季配图、40 个章节、73 集逐集剧情、全局搜索及家族战争联动均已接入");
