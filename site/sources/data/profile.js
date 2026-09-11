// Public portfolio content. Sources and privacy decisions: research/content-update-notes.md.
// Keep the current employer anonymous, as requested. Do not publish the source résumé.
export const identity = {
    name: '莫琰',
    alias: 'MoMoZi',
    role: 'Agent 技术产品 · AI 算法转产品',
    socialName: 'momo子讲AI',
    github: 'momozi1996',
    githubUrl: 'https://github.com/momozi1996',
    codeUrl: 'https://momozi.cc/'
}

// Reverse chronological order. The two Baidu tracks share one employment period;
// the résumé does not provide separate start/end dates for each team.
export const career = [
    {
        company: '某大模型公司', role: 'Agent 技术产品', period: '2026.03 — 至今', current: true,
        description: '聚焦 Coding / Working Agent 基座能力，围绕自主规划、工具调用与复杂任务执行，推进评测、训练数据与真实产品反馈的迭代闭环。',
        tags: ['Agent 基座', 'Eval & Benchmark', '训练数据']
    },
    {
        company: '美团', role: '搜索 Agent 产品', period: '2025.08 — 2025.11',
        description: '从企业知识问答与 RAG 出发，探索多轮搜索、Search Agent 与 IM 工作流中的 AI 交互，让信息检索更贴近真实任务。',
        tags: ['Search Agent', 'RAG', '企业知识问答']
    },
    {
        company: '商汤', role: '大模型训练 · 技术产品', period: '2023.06 — 2025.08',
        description: '参与 SenseNova / SenseChat 的 LLM、VLM 基模型建设与产品化，连接模型研发、训练迭代、长上下文、Function Calling 与 API 服务。',
        tags: ['LLM / VLM', '模型训练', 'Tool Use']
    },
    {
        company: '百度飞桨', role: 'AI 产品', period: '2021.08 — 2023.01 · 百度任职期间',
        description: '面向深度学习开发者打磨 PaddlePaddle 的 API、算子、模型迁移与开发文档，推动平台易用性评估、开源生态与开发者反馈闭环。',
        tags: ['开发者平台', '开源生态', '体验评估']
    },
    {
        company: '百度研究院', role: 'AI 产品', period: '2021.08 — 2023.01 · 百度任职期间',
        description: '参与商业智能平台、搜索大数据报告与 AI 应用产品建设，把研究能力转化为可使用的平台与行业场景方案。',
        tags: ['商业智能', '数据产品', 'AI 应用']
    },
    {
        company: 'AI 医学图像', role: '算法研发 → 技术产品', period: '2020.10 — 2021.08 · 深睿医疗',
        description: '从医学影像的机器学习、深度学习与科研算法起步，参与图像分类、分割及科研平台迭代，也由此走向 AI 技术产品。',
        tags: ['计算机视觉', '医学图像', '科研到产品']
    }
]

export const skillDirectories = ['SkillHub', 'OpenAgentSkill', 'Skills.Rest', 'mcpskills.io', 'ecosyste.ms']

export const projectGroups = [
    {
        id: 'skills', number: '01', title: '把知识变成 Skills', label: 'AGENT SKILLS',
        description: '把人格、文风和文化知识整理成可以复用的 Agent 技能。',
        projects: [
            {
                id: 'persona', title: 'Persona Skills', subtitle: '人格与文风的开源技能库',
                description: '汇集人格 Skills，并持续创作作家文风、自媒体表达与文化知识类技能，让不同的思考和表达方式成为可调用的能力。',
                image: 'momozi/awesome-ai-persona-skills.png',
                tags: ['人格蒸馏', '文风表达', '开源合集'],
                links: [{ label: '查看仓库', url: 'https://github.com/momozi1996/awesome-ai-persona-skills' }]
            },
            {
                id: 'yongle', title: '永乐大典 Skill', subtitle: '古典知识 × AI 表达',
                description: '以《永乐大典》为灵感，将典籍知识、文言表达与经典引证组织成 Agent Skill，探索传统文化在 AI 时代的延续。',
                image: 'momozi/yongledadian-skill.png',
                tags: ['传统文化', '古籍知识', 'Agent Skill'],
                links: [{ label: '查看仓库', url: 'https://github.com/momozi1996/yongledadian-skill' }]
            }
        ]
    },
    {
        id: 'multi-agent', number: '02', title: '让不同视角一起思考', label: 'MULTI-AGENT DECISION',
        description: '不止一个 Agent 回答，而是多个角色协作、讨论，再形成决策。',
        projects: [
            {
                id: 'directors', title: 'DirectorAgents', subtitle: '导演智囊团 · 多 Agent 决策',
                description: '将导演风格与叙事方法组织为创作智囊团，通过顺序链、辩论投票和主席团协作，为剧本、影像风格与叙事方案提供多视角支持。',
                image: 'momozi/directors-art.png',
                tags: ['创意协作', '辩论投票', '叙事决策'],
                links: [{ label: '查看仓库', url: 'https://github.com/momozi1996/DirectorAgents' }]
            },
            {
                id: 'tianya', title: 'Tianya Skills', subtitle: '天涯智囊团 · 多视角分析',
                description: '以天涯社区人物的思考风格为灵感，由协调者拆解问题、组织并行分析，再归纳共识与分歧，形成结构化建议。',
                image: 'momozi/tianya-skills.png',
                tags: ['并行分析', '共识与分歧', '综合决策'],
                links: [{ label: '查看仓库', url: 'https://github.com/momozi1996/tianya-skills' }]
            }
        ]
    },
    {
        id: 'code-agent', number: '03', title: '和我一起成长的 Code Agent', label: 'CODING AGENT',
        description: '从一次代码生成，走向能积累经验、拆解任务的编程伙伴。',
        projects: [
            {
                id: 'momo-code', title: 'MOMO CODE', subtitle: '自演进的 AI 编程 Agent',
                description: '围绕经验积累与自演进探索编程 Agent，支持递归子任务、长任务编排与多模型接入，把使用过程中的反馈带回下一次任务。',
                image: 'momozi/momo-code-screen.png',
                tags: ['自演进', '任务编排', '多模型'],
                note: '基于 opencode 构建，自演进设计参考 Pioneer Agent。',
                links: [
                    { label: '查看仓库', url: 'https://github.com/momozi1996/momo-code' },
                    { label: '访问 momozi.cc', url: identity.codeUrl }
                ]
            }
        ]
    }
]

export const accounts = [
    { platform: '小红书', name: identity.socialName, kind: 'copy', hint: '打开小红书，搜索这个名字。' },
    { platform: '微信公众号', name: identity.socialName, kind: 'copy', hint: '在微信「搜一搜 → 公众号」中搜索。' },
    { platform: 'GitHub', name: identity.github, kind: 'link', url: identity.githubUrl, hint: '项目源码、Skills 和持续生长的实验。' }
]
