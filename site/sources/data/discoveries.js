// Editorial island content, based only on the existing public profile.
// Dialogue and task cards below are authored concept demos, NOT project outputs.
export const passportGroups = ['momoPassport', 'momoCorners']
export const passportStamps = [
    { id: 'hello', title: '初次见面', hint: '读一读「认识我」', action: 'about' },
    { id: 'curiosity', title: '好奇心', hint: '翻开 Skills 书页，或选择一个圆桌提案', action: 'example' },
    { id: 'souvenir', title: '带走风景', hint: '选一个角落，制作明信片', action: 'postcard' }
]
export const discoveries = [
    { id: 'letter', number: '01', area: 'landing', location: '出生点 · 路边小信箱', title: '给路过的你', kind: 'letter', color: '#d485ac',
      lead: '不赶路的时候，也许更容易遇见好东西。',
      paragraphs: ['欢迎来到 MoMoZi 的小世界。这里的作品，大致沿着三条线生长：可复用的 Skills、多视角协作的 Agent，以及编程伙伴 MOMO CODE。', '没有必做任务，也不需要通关。读一页作品、和兔子合个影，或者只是开车兜一圈，都很好。'],
      note: '小岛欢迎便签 · 不是任务通知', action: 'about', actionLabel: '认识一下岛主', postcard: 'landing' },
    { id: 'bookmark', number: '02', area: 'career', location: '经历区 · 书签小桌', title: '一条来时路', kind: 'book', color: '#b79bd4',
      lead: '从看懂一张图，到让 AI 完成一个任务。',
      paragraphs: ['医学图像算法 → 研究与数据产品 → 开发者平台 → 大模型训练 → 搜索 Agent → Coding / Working Agent。', '工作对象在变化，贯穿其中的问题是：怎么把 AI 能力变成真正可用的产品？在经历页里，可以沿着六段公开经历继续往回看。'],
      note: '根据已公开经历整理；百度两个方向属于同一任职阶段。', action: 'career', actionLabel: '展开来时路' },
    { id: 'skills', number: '03', area: 'projects', location: '作品工坊 · 翻开的书页', title: '把知识折成一张卡', kind: 'book', color: '#bd9b6c',
      lead: '同一个任务，也可以有不同的思考方式。',
      paragraphs: ['Persona Skills 把人格与文风组织成可复用技能；永乐大典 Skill 探索古典知识与 AI 表达的结合。', 'Skill 不只是“换一种语气”。适用场景、任务步骤和使用边界，也值得一并写进技能。'],
      note: '下方卡片为小岛编写的概念示例，不是仓库实测输出。', action: 'skills', actionLabel: '翻开一张任务卡', project: 'persona' },
    { id: 'roundtable', number: '04', area: 'lab', location: 'AI 实验室 · 三色圆桌', title: '三个视角，一部短片', kind: 'table', color: '#aa83c7',
      lead: '先让分歧被看见，再决定往哪走。',
      paragraphs: ['DirectorAgents 用多角色协作支持剧本、影像风格与叙事决策。这个小圆桌只借用“不同视角一起思考”的概念，让你试一次轻量选择。'],
      note: '预设互动演示 · 不调用模型，不代表真实导演发言或项目运行结果。', action: 'roundtable', actionLabel: '坐下来，听听提案', project: 'directors' },
    { id: 'postoffice', number: '05', area: 'social', location: '兔子广场 · 小岛邮局', title: '寄一张不用邮票的风景', kind: 'letter', color: '#cfa2c1',
      lead: '来过这里，就带走一点粉紫色。',
      paragraphs: ['不用填地址，也不用留下邮箱。挑一个喜欢的角落，就能做一张带日期的小岛明信片。', '如果想在小岛之外继续聊 AI，可以找到「momo子讲AI」，或去 GitHub 看看这些作品的源码。'],
      note: '固定风景图，不包含其他访客的留言；不会真的寄出。', action: 'postcard', actionLabel: '挑一张小岛明信片', postcard: 'social' }
]
export const skillExample = {
    task: '给第一次接触 Agent 的朋友，解释什么是 Skill。',
    steps: ['先确定：读者没有技术背景。', '再类比：像一张写清材料、步骤与注意事项的食谱。', '最后留边界：有了食谱，也不保证每次都做得成功；仍需检查结果。'],
    takeaway: '可以先把 Skill 理解为一份可复用的任务说明：告诉 Agent 何时用、怎样做，以及哪些地方要小心。',
    limit: '这是帮助理解的简化类比，不是对所有 Skill 格式或运行能力的承诺。'
}
export const roundtable = [
    { id: 'story', role: '叙事视角', title: '让一次停留，成为转折', text: '小车一路赶路，最后在信箱前停下。用“第一次主动停留”作为故事的变化。', why: '你把人物的变化放在第一位：观众先记住“发生了什么”。代价是要给铺垫留时间。', color: 'rose' },
    { id: 'image', role: '影像视角', title: '让光线替小岛说话', text: '从蓝水的倒影切到暖灯，再给兔耳一个近景。少解释，用冷暖关系串起这段旅程。', why: '你把感受放在第一位：观众先记住“是什么气氛”。代价是情节会更轻。', color: 'lilac' },
    { id: 'production', role: '制作视角', title: '三个镜头，也能讲完', text: '只用出发、停留、离开三个固定镜头。先把一个完整版本做出来，再决定哪里值得加细节。', why: '你把完成度放在第一位：用可控的范围换取可交付的短片。代价是镜头变化较少。', color: 'sage' }
]
export const postcards = [
    { id: 'landing', title: '好奇心的起点', subtitle: 'MoMoZi 大字旁 · 出生点', image: 'momozi/discoveries/landing.webp', line: '今天，也给好奇心留一点位置。' },
    { id: 'social', title: '兔子替你保管月光', subtitle: '暖灯亮起时 · 兔子广场', image: 'momozi/discoveries/social.webp', line: '不用赶路，风景会等你。' },
    { id: 'projects', title: '想法生长的地方', subtitle: '翻开下一页 · 作品工坊', image: 'momozi/discoveries/projects.webp', line: '把一个小小的想法，慢慢做出来。' }
]
