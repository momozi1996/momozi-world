// Hand-curated from user-provided sources, read on 2026-09-14.
// These are editorial short titles and summaries, not copied original headlines.
export const readingSources = {
    verifiedAt: '2026-09-14',
    website: 'https://momozi.vip/',
    blog: 'https://momozi.vip/blog',
    repository: 'https://github.com/momozi1996/awesome-ai-knowledge/tree/main/docs',
    revision: 'ebae457a826130ce8a26f94d5edd0c1902921ec7'
}
const docUrl = path => `https://github.com/momozi1996/awesome-ai-knowledge/blob/${readingSources.revision}/${path.split('/').map(encodeURIComponent).join('/')}`
export const readingShelf = [
    {
        id: 'agent-route', category: 'Agent 入门', title: '先看地图，再进入 Agent 世界',
        audience: '刚接触 Agent、想建立学习顺序的人', platform: 'GitHub · awesome-ai-knowledge', date: null,
        url: docUrl('docs/03-AI Agent智能体/00-导读和学习流程图.md'),
        idea: '把认知、数据、训练、评测与开源放进同一条学习链路，而不是只收藏零散技巧。',
        paragraphs: ['这篇导读把 Agent 学习拆成一条从基础认知到工程落地的链路。与只看框架调用不同，它也把数据建设、训练微调和效果评测放进视野。', '如果你刚开始，可以先用它辨认各个环节的关系，再根据自己的任务挑一段继续读。不需要在小岛上把整套文档学完。'],
        question: '你现在卡在“让它开始做”，还是“知道它有没有做好”？',
        caution: '这是对原文学习思路的导读，不将其中的行业排名、商业保证或强制顺序当作普适结论。'
    },
    {
        id: 'harness', category: '动手实践', title: '模型之外，也要有护栏和回滚',
        audience: '正在把 Agent 接入工具和代码库的开发者', platform: 'GitHub · awesome-ai-knowledge', date: null,
        url: docUrl('docs/0-近期最新知识点/Harness_Engineering_驾驭工程.md'),
        idea: '除了提示词，还要关心执行隔离、状态感知、工具输出和失败恢复。',
        paragraphs: ['这篇 Harness 文档把模型之外的执行系统拆成沙箱、状态感知、指令护栏、工具输出处理和快照回滚等部分。它关注的不是多说一句提示词，而是行动落到环境后会发生什么。', '一个很具体的提醒：日志太长可以整理，但不要把最关键的报错一起删掉。省下上下文，不应该以丢掉排错线索为代价。'],
        question: '如果这次修改失败，你能看见原因，并回到修改之前吗？',
        caution: '导读不执行原文代码。简单命令黑名单或子进程不等于安全沙箱；真实部署需要独立安全评估。'
    },
    {
        id: 'eval', category: '产品思考', title: '不只看答得好不好，也看事办成没有',
        audience: '需要判断 Agent 版本是否真的进步的人', platform: 'GitHub · awesome-ai-knowledge', date: '2026-08-13', dateLabel: '文档更新',
        url: docUrl('docs/03-AI Agent智能体/07-模型评估.md'),
        idea: '围绕任务完成、工具调用、异常恢复和中间步骤设计评测。',
        paragraphs: ['文档区分了静态问答评测和行动式任务评测，并讨论工具调用、多步骤完成、重规划以及多智能体协作。读的时候可以先抓住一个问题：这些检查，是否覆盖了你的真实任务？', '它还提醒不要只看最终结果。中间有没有漏步骤、工具失败后如何恢复、边界输入能否处理，都是观察版本变化的线索。'],
        question: '如果结果看起来对了，但过程跳过了关键检查，你会怎么判？',
        caution: '原文列出的比例阈值和基准排名未在本次独立核验；这里不将其作为通用行业标准。'
    },
    {
        id: 'code-story', category: '开源手记', title: 'MOMO CODE：为什么让编程工具记住经验',
        audience: '对 Code Agent 的经验积累与产品设计感兴趣的人', platform: 'momo子讲AI · 公众号', date: '2026-06-27', dateLabel: '发表',
        url: 'https://mp.weixin.qq.com/s/MWW8eczRSylEAoRELntS7Q', mirror: 'https://momozi.vip/blog', project: 'momo-code',
        idea: '把任务里的反馈，分别送进经验快环和周期性评估慢环。',
        paragraphs: ['在这篇开发者手记中，MoMoZi 从“纠正过的错误，下一次是否还会再犯”出发，介绍基于 opencode 衍生的 MOMO CODE，以及 /evolve 与 /fine-tune 两条回路。', '快环围绕任务信号积累策略；慢环描述课程合成、基线评估、候选评估、门控与晋升。需要特别区分：文中默认的 Priors 驱动器更新贝叶斯先验，并不等于已经完成 LoRA 模型权重训练。'],
        question: '让工具“记住一个教训”，与让模型“改变参数”，有什么不同？',
        caution: '以上按 2026-06-27 的作者文章整理，不代表当前版本复测；不沿用“全球首个”或保证能力持续提升的宣传判断。'
    },
    {
        id: 'director-story', category: '开源手记', title: 'DirectorAgents：一个导演智囊团的诞生',
        audience: '想把多视角协作用到叙事创作的人', platform: 'momo子讲AI · 公众号', date: '2026-05-11', dateLabel: '发表',
        url: 'https://mp.weixin.qq.com/s/0AE-09BgvquuBPx8K7uXrA', mirror: 'https://momozi.vip/blog', project: 'directors',
        idea: '除了生成一份答案，还可以设计观点接力、方案辩论与统筹整合。',
        paragraphs: ['这篇文章把项目起点放在“生成门槛降低以后，如何继续处理审美与叙事”上，并介绍基于 clawteam 搭建的 DirectorAgents。', '文中解释了三种协作思路：顺序链适合创作接力；辩论投票用于方案比选；主席团由一个统筹角色整合不同建议。小岛圆桌是借此编写的轻量概念演示，不是该系统的真实运行录像。'],
        question: '你的下一次创作，更需要一个新观点，还是有人把已有观点整理起来？',
        caution: '风格角色是创作方法的模拟，不代表真实导演参与或背书。角色数量与效果未在本次复测。'
    },
    {
        id: 'yongle-story', category: '开源手记', title: '永乐大典 Skill：把古籍放进新的入口',
        audience: '对古籍、知识整理与 Agent Skills 感兴趣的人', platform: 'momo子讲AI · 公众号', date: '2026-04-22', dateLabel: '发表',
        url: 'https://mp.weixin.qq.com/s/JrqIkaCTlUYDx1nh42sHvQ', mirror: 'https://momozi.vip/blog', project: 'yongle',
        idea: '除了表达风格，也把文献整理与知识组织作为 Skill 的探索场景。',
        paragraphs: ['原文介绍了永乐大典 Skill 与仓库中的古籍材料入口。比起把它理解成一层古风语气，更值得注意的是其中对文献整理、知识组织与资料汇编的关注。', '读到这里，可以再回看工坊里“把知识折成一张卡”的便签：除了告诉 Agent 怎么表达，也要告诉它依据什么、如何查证。'],
        question: '如果一段回答听起来很像古文，你会怎样确认引文真的有出处？',
        caution: '生成文本不等于原典。史实、引文与版权仍需核对；本页不复述原文中未经核验的典籍规模数字。'
    }
]

export const cornerReadings = {
    letter: ['agent-route'], bookmark: ['agent-route', 'eval'],
    skills: ['yongle-story', 'code-story'], roundtable: ['director-story', 'harness'],
    postoffice: ['code-story', 'director-story', 'yongle-story']
}

export const codeCase = {
    sourceReading: 'code-story',
    image: 'momozi/discoveries/code-evolve.webp',
    caption: '作者文章中的终端演示截图（2026-06-27）。它展示命令、日志和存储位置；画面中 Tactics / Promoted 为 0，不能作为策略增长或能力提升的证据。',
    role: '据原文，MoMoZi 基于 opencode 衍生开发，并增加 /evolve 与 /fine-tune 模块；1.0 由个人完成。既有自演进设计还参考 Pioneer Agent。',
    input: 'momo /evolve --demo',
    process: '从会话信号进入观察、提炼、记录等步骤；慢环另行组织基线与候选评估，并通过门控决定是否晋升。',
    output: '原文截图显示 Experience Evolution 日志、Ledger: written 以及本机经验存储位置。这里展示的是公开演示材料，不是在访客设备上执行命令。',
    boundary: '默认 Priors 更新的是贝叶斯先验，不等于 LoRA 权重微调。真实训练需要另接驱动器与环境；评测门控也不能保证所有未来任务永不回归。'
}
