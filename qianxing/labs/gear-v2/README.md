# 潜星计划 V2｜第72项机械传动故障实验室

> 原型版本：2026-10-29。用于跨领域能力探索，不是科学验证过的先天天赋鉴定。

## 网页入口
- 新版直达： https://panxiangbin.github.io/pan/qianxing/labs/gear-v2/
- 旧入口兼容： https://panxiangbin.github.io/pan/qianxing/labs/?id=72
- 108项目录： https://panxiangbin.github.io/pan/qianxing/explore/

## 实际交互
- 1轮练习 + 8轮不同机械工况，完整闭环：观察 -> 更换零件 -> 试运行 -> 报警与数据 -> 修改 -> 提交 -> 新素材 -> 跨情境。
- 首轮3项包括输出速度错误、方向反转、紧凑安装空间；再提供可选3级微学习；后段3项不同参数，包括两级复合传动；迁移2项用于新包装线与综合改造。
- Three.js真实三维交互：用鼠标或手指旋转、缩放；更换标准齿数并重建三维几何；齿轮运动按精确理想齿数比慢速播放；单级惰轮与共轴复合两级机构均有。
- 检测台分别测输出rpm、旋向、轴心跨度；实际可以有多套满足约束的设计，不强制唯一答案。
- 记录尝试次数、修改次数、各项约束、是否跳过和提示级别；自愿JSON下载，不自动上传。
- Blender 4.2.8生成独立可编辑三维零件场景、单张静态渲染与6秒动画。视频仅是单镜头真实3D动画，不是多格拼接。
- 外层保持极简入口，没有复杂的排行榜、账号、天赋打分界面。

## 工程简化与边界
- 齿轮都是同模数、20°渐开线近似视觉模型，平行轴外啮合，输入电机恒速，无摩擦、损耗、弹性、间隙、轴承载荷、制造公差和齿轮强度仿真。
- 齿轮中心距 a = m(z1+z2)/2；总跨距=连续齿轮轴心距之和。
- 两齿轮相邻外啮合旋向相反，三齿轮有中间惰轮末端与输入同向；
  简单链总输出转速 n_out=n_in·Z_in/Z_out。
- 两级复合传动 B 与 C 同轴转动，A啮合B，C啮合D；
  n_D=n_A·(Z_A/Z_B)·(Z_C/Z_D)，输出旋向与输入相同。
- 3D外观齿形经过渐开线采样，但不包含根部过渡曲线、修缘或干涉强度校核，不应拿来直接加工。
- 动画为了观看体验统一慢放；不按真实300rpm高速播放，数字仪表记录的RPM仍遵守精确理想速比。
- 当前任务难度尚未建立等价性，没有标准化常模、信效度研究；只能形成任务表现记录，不能用于职业或医学心理诊断。
- 用户操作习惯、既有专业训练、电脑表现均会影响结果；后续需要真实用户测试及新题本复测。
- 直接公开的JS题本可被查看、记忆；不是作弊防护完善的考试系统。
- 浏览器不支持WebGL时仍提供模拟检测台，不强制安装软件。

## 资料来源
- KHK: Idler Gear: https://khkgears.net/new/gear_knowledge/gear-nomenclature/idler-gear.html
- KHK: Calculation of Gear Dimensions: https://khkgears.net/gear-knowledge/gear-technical-reference/calculation-gear-dimensions/
- KHK: ABCs of Gearing: https://khkgears.us/media/fqrlut1m/abcs-of-gearing-b.pdf
- Three.js v0.186.1，本地打包Three.js + OrbitControls，遵循MIT协议（vendor/LICENSE）。

## 源码
- gear-core.mjs：纯传动模型、完整题本、可复核约束
- viewer.mjs：WebGL 3D几何、相机交互、各轴转速与方向
- app.mjs：分阶段任务、仪表、答题流程、结果导出
- assets/gear_hero.jpg、gear_simple.jpg、gear_compound.jpg：各自独立单镜头
- assets/gear_motion.mp4：Blender单镜头6秒可控渲染动画
- vendor/：本地第三方库 + MIT协议（确保网页无需CDN访问）

## 用户电脑上可继续编辑的工程
- F:\AI工作台\潜星计划\V2_机械结构_20261029\models\72_复合传动_可编辑Blender.blend
- F:\AI工作台\潜星计划\V2_机械结构_20261029\models\72_惰轮传动_可编辑Blender.blend
- F:\AI工作台\潜星计划\V2_机械结构_20261029\build_gear_blender.py
- F:\AI工作台\潜星计划\V2_机械结构_20261029\qa_gear_v2.py
- F:\AI工作台\潜星计划\V2_机械结构_20261029\gear_math_test.mjs
- F:\AI工作台\潜星计划\V2_机械结构_20261029\qa\

## 测试门槛
- 每项题本保证至少一个可实现约束的方案，至少一个明显错误方案。capstone存在多套可接受方案。
- 34/34 项纯传动/题本验证通过；浏览器8/8组完整路径通过（含全流程、WebGL、手机下载JSON、路由）。
- 浏览器运行阶段无JS pageerror。无头Edge下载完成后的浏览器关闭时可能打印自身TargetClosedError，属于测试工具收尾警告，不代表产品操作失败。
- 390px手机布局没有横向溢出；具体视频流畅程度仍需真实移动设备复查。
