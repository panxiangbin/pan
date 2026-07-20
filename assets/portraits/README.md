# 人物剧照目录

这个目录用于存放已经确认可在网站中使用的人物剧照。

## 文件要求

- 推荐格式：WebP
- 推荐尺寸：宽 600–900 px，高宽比约 3:4
- 单张建议不超过 250 KB
- 只放单人、面部清晰、没有第三方水印的图片
- 不上传整张海报、连续剧情截图或高清原图包

## 命名规则

- `ned.webp`
- `catelyn.webp`
- `robb.webp`
- `sansa.webp`
- `arya.webp`
- `bran.webp`
- `jon.webp`
- `tywin.webp`
- `cersei.webp`
- `jaime.webp`
- `tyrion.webp`
- `brienne.webp`
- `daenerys.webp`
- `jorah.webp`
- `sam.webp`
- `stannis.webp`
- `littlefinger.webp`
- `varys.webp`
- `bronn.webp`
- `nightking.webp`

## 启用步骤

1. 把确认可使用的图片上传到本目录。
2. 打开根目录 `portraits-data.js`。
3. 将对应人物的 `image` 改为图片路径，例如：

```js
image: "assets/portraits/jon.webp"
```

4. 填写 `sourceName`、`sourceUrl` 和 `rights`。
5. 提交后，人物详情与关系图节点会自动显示照片。

没有填写来源和使用依据的图片，不应正式启用。
