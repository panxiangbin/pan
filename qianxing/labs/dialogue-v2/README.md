# 潜星计划 V2｜第45项「共情感知与沟通理解」

版本：2026-10-29 · 原创虚构情境 / 多轮交互样板
正式入口：https://panxiangbin.github.io/pan/qianxing/labs/dialogue-v2/
旧入口兼容：https://panxiangbin.github.io/pan/qianxing/labs/?id=45

## 本轮已实现
- 7个原创虚构情境：1段练习，首次2段、新素材2段、迁移2段。
- 各情境有独立画面、背景、3位人物、5条候选线索、2条待核对陈述、4个解释选项、4项行动、4种分支反馈、3项修复选择。
- 一轮完整的交互链条：受限调查(3/5)→证据与推测辨别→保留两种合理解释→选择应对→行动后分支→根据反馈修复→自愿写作→过程反馈。
- 练习结果不计入正式报告；首次之后提供三个可选择的观察策略，不强制阅读。
- 记录具体行为：调查了哪些来源、是否优先听到当事人、事实与推测分辨、所选假设、行动后分支、修复尝试、自愿写作；支持本机JSON导出。
- 7份各自独立的原创SVG情境插画；每份只有一个环境/镜头，没有多面板、九宫格或合成图。
- 网站外部极简，不需要账号、录音、视频/摄像头或敏感资料。当前不自动上传个人作答。
- 第45项从108项目录直达新版；原旧URL ?id=45兼容跳转，其余主题保留。

## 证据及指标边界
- 这只是行为探索与情境学习原型，没有测评常模、信度、效度、题本等价性或专家评分标准复核。
- 不能据一次选择猜出他人的真实心理，不能给用户贴“天赋/人格/同理心水平”标签；不用于心理健康诊断、职业预测或评判道德。
- “事实区分准确数”只依据设计者为虚构故事编写的已知事实。不同可行回应可能同样合理，不构造唯一“共情满分答案”。
- 不自动使用AI评价自愿书写的回应，避免将文笔好坏误认为共情能力。
- 通过从行动到反馈的故事分支展示不同可能的后果；此分支是虚构叙事，不代表真实人必然如此反应。
- 由于时间、文化、先验知识、情境经验不同，跨材料表现不能直接等同于真实能力变化。
- 题本源代码公开，反复做相同题可能记住答案；后续开发应增加平行题本和自愿延期复测。
- 后续若要求科研或正式心理评估，需有相关专业人士进行内容开发、伦理与隐私审查、真人试玩与效度证据搜集。

## 方法论参考（仅用于设计方向，不代表本项目已被专业认证）
- US OPM Situation Judgment Tests: https://www.opm.gov/policy-data-oversight/assessment-and-selection/other-assessment-methods/situational-judgment-tests/
- NCME/AERA/APA Standards for Educational and Psychological Testing: https://ncme.org/resources/books/testing-standards/
- OECD PISA 2022 Creative Thinking: https://www.oecd.org/en/topics/sub-issues/creative-thinking/pisa-2022-creative-thinking.html
- Research on response processes in SJTs: https://pmc.ncbi.nlm.nih.gov/articles/PMC7734708/

## 网页源码
- index.html：独立入口
- style.css：桌面/手机极简版式
- casebook.mjs：全部情境事实、来源、分支和操作定义
- app.mjs：多阶段交互状态机、分支、反馈与JSON导出
- assets/*.svg：7张独立场景文件和一个小favicon
- 源文件均为文本/可编辑矢量文件，后续可替换单幅插画，但不能以AI独立生成的A/B图代替可靠答案。

## 验收
本地Windows Edge浏览器 9/9组通过：
1. 7张独立SVG素材与程序加载
2. 练习全流程（线索→事实→解释→分支→修复→写作）
3. 初次两段不同分支与三级可选提示
4. 学习后新材料两段
5. 迁移两段、多分支完整报告、JSON
6. 108目录及旧链接兼容
7. 手机390px无横向溢出
8. 无JS异常
9. 无资源加载404
有过“未配置favicon”造成的本地资源404，已添加assets/favicon.svg并复验通过。
无头Edge有概率在JSON下载完成、浏览器关闭后打印TargetClosedError，属于测试工具退出阶段噪声；测试已在关闭前写出结果。

## 本机施工资料
F:\AI工作台\潜星计划\V2_沟通理解_20261029\
- site\ 为此轮Git仓与网站源码
- build_scenes.py：可重生成7张独立SVG图的制作脚本
- qa_dialogue_v2.py：真实浏览器自动通关与结果检查
- qa\：验收截图、JSON报告与实际导出示例
