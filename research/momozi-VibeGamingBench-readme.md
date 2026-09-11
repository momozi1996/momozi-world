# VibeGamingBench

**An execution-grounded Agent Benchmark for Vibe Gaming**

VibeGamingBench evaluates coding agents and agent harnesses that turn a
single-language natural-language game brief into a complete browser-game
artifact. The benchmark is intentionally scoped to a reproducible generation
task plus lightweight execution evidence; it is not a full long-horizon
gameplay simulator.

The current release contains:

- **711 unique game concepts**
- **1,422 bilingual evaluation instances** (`711 EN + 711 ZH`)
- **21 game families**
- heuristic `low` / `medium` / `high` implementation difficulty
- Static artifact/contract evaluation
- Dynamic Chromium runtime smoke and screenshot capture
- screenshot-grounded VLM visual judging
- family-balanced, language-aware aggregation with paired bootstrap confidence intervals

## 中文说明

**VibeGamingBench 是面向 Vibe Gaming 的、以执行证据为基础的 Agent Benchmark。**

它评测 coding agent 或 Agent Harness 是否能够把一条单语种游戏需求，生成一个完整的
浏览器游戏，并验证该产物是否真的能在固定浏览器环境中启动和保持运行。当前版本不是
完整的长时程 Gameplay Simulator，而是“生成能力 + 轻量执行证据”的可复现评测。

当前题池包含原有题池以及 Feishu Prompt Catalog 扩展：

- **711 个独立游戏概念**
- **1,422 道双语评测题**：711 道英文题 + 711 道中文题
- **21 个游戏类型**
- `low` / `medium` / `high` 三档**启发式实现难度**

评测采用两条一级路径：

```text
Agent Harness
      ↓
Coding Agent
      ↓
浏览器游戏产物
   ↙          ↘
静态评测      动态评测
BUILD/合同    Chromium smoke + 截图
   ↘          ↙
        分数融合
            ↓
      family-balanced 排行榜
```

### 静态评测

回答“agent 构建了什么”：

- 检查 `index.html` 和 `game_logic.js` 是否完整。
- 检查 Canvas/WebGL 和资源策略。
- 用 Node 行为合同验证 `createGame(opts)` 与 `advance(game, input, dt)`。
- 用代码证据评估完整度、丰富度、玩家体验和视觉实现。

### 动态评测

回答“生成的游戏运行起来是什么状态”：

- 启动临时本地 HTTP server。
- 使用固定 Chromium、1280×720、`en-US`、`UTC`、device scale factor 1。
- 等待页面加载和稳定窗口。
- 捕获 console/page error。
- 按题目 family 自动选择 pointer-first、keyboard-first 或 mixed 探针。
- 捕获 `boot.png`、`gameplay_start.png` 和 `gameplay_mid.png`。

动态通过只表示页面成功启动、在限定窗口内保持存活、完成探针并生成截图，不等价于
完整玩法验证。

### Agent Harness 接入

外部 harness 通过 `--harness-command` 接入，必须把以下两个文件写入指定目录：

```text
{product_dir}/index.html
{product_dir}/game_logic.js
```

可用命令占位符：

```text
{prompt_file}  {product_dir}  {workspace}  {task_file}  {task_id}
```

同样的信息也会通过以下环境变量提供：

```text
MOMOZI_PROMPT_FILE
MOMOZI_PRODUCT_DIR
MOMOZI_WORKSPACE
MOMOZI_TASK_FILE
MOMOZI_TASK_ID
```

完整合同见 [`AGENT_HARNESS.md`](AGENT_HARNESS.md)。

### 自动评测与密钥

先安装依赖和 Chromium：

```bash
pip install -r requirements.txt
python3 -m playwright install chromium
```

真实 code judge 和 screenshot VLM judge 使用 OpenAI-compatible Chat Completions。
推荐把 screenshot judge 接到支持图片输入和严格 JSON 输出的 Doubao/Ark 部署；
DeepSeek 兼容配置仍保留。仓库根目录创建 `.env`：

```env
MOMOZI_JUDGE_API_KEY=你的key
MOMOZI_JUDGE_PROVIDER=ark
MOMOZI_JUDGE_MODEL=你的Ark部署模型ID
MOMOZI_JUDGE_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
MOMOZI_VLM_API_KEY=你的key
MOMOZI_VLM_PROVIDER=ark
MOMOZI_VLM_MODEL=你的Ark视觉部署模型ID
MOMOZI_VLM_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

也可以继续使用旧变量名：

```env
DEEPSEEK_API_KEY=你的key
DEEPSEEK_JUDGE_MODEL=deepseek-v4-flash
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_VLM_MODEL=deepseek-v4-flash
DEEPSEEK_VLM_BASE_URL=https://api.deepseek.com
```

真实 key 不要写入代码、题目、结果 JSON 或命令行。`.env` 已被 git 忽略。

单题评测：

```bash
python3 scripts/auto_evaluate.py \
  --task mz_sports-fishing-tournament-en \
  --agent codex \
  --model-label your-model
```

外部 harness：

```bash
python3 scripts/auto_evaluate.py \
  --all \
  --harness-command 'your-harness --prompt {prompt_file} --output {product_dir}' \
  --model-label your-model \
  --workers 4
```

`--mock-judge`、`--mock-runtime`、`--mock-visual` 只用于协议和 CI 验证，永远不会进入
正式排行榜。结果写入 `runs/auto/<run-id>/`，汇总写入 `leaderboard.json` 和
`LEADERBOARD.md`。

### 评分与排行榜

v0.6 的四个分量及权重为：

| 分量 | 权重 |
|---|---:|
| Static | 40% |
| Dynamic | 25% |
| Visual | 20% |
| Design | 15% |

Visual 由 `Functional Visual` 和 `Presentation` 两个 0–5 维度平均得到。最终分数会应用
诊断性硬上限：

```text
BUILD 失败       → final ≤ 20
启动/加载失败    → final ≤ 10
运行时 fatal     → final ≤ 35
```

排行榜主指标是 **family-balanced score**，同时报告 micro、concept-balanced、EN、ZH、
language gap、Static、Dynamic、Visual、Design、runtime pass rate、paired bootstrap
95% CI 和 rank stability。

英文和中文题通过 `base_task_id` 配对，不会被当成 1,422 个独立概念。难度标签是工程复杂度
启发式分类，不是经验校准分数。

### 验证与发布

完整本地冒烟：

```bash
bash scripts/smoke.sh
```

题池和全量静态门禁：

```bash
python3 scripts/split_bilingual_tasks.py
python3 scripts/generate_task_distribution.py --check
python3 scripts/audit_tasks.py
python3 scripts/validate_pool.py --only-mz --workers 8
```

当前验证结果应为：

```text
711 concepts
1,422 tasks
EN 711 / ZH 711
1,422 / 1,422 BUILD audit passed
```

发布元数据见 [`benchmark_releases/v0.7.0.json`](benchmark_releases/v0.7.0.json)，其中记录
题池 hash、代码 tag、评测协议和 runtime/judge/scoring 版本。公共 split 已提交，hidden
split 只生成到私有路径；由于开发 checkout 仍包含完整题池，当前 hidden split 不是实际的
保密边界。

当前明确不包含：完整 gameplay DSL、long-horizon play、GameFix、GameOpt、GameEvolve、
IRT/Rasch 难度建模、online leaderboard，以及已完成的人类校准研究。人工 calibration
报告在真实标注提供前保持 `pending`，不会生成伪造分数。

## Evaluation Model

```text
Agent Harness
      ↓
Coding Agent
      ↓
Game Artifact
   ↙          ↘
STATIC       DYNAMIC
contract     browser runtime smoke
checks       + screenshot
   ↘          ↙
       Score Fusion
            ↓
  Family-balanced Leaderboard
```

Static evaluation answers **what the agent built**. Dynamic evaluation answers
**whether the artifact launches and remains alive in a fixed browser smoke
environment**. Runtime smoke includes page load, fatal error capture, a
family-aware start/input probe, and stable `boot.png`, `gameplay_start.png`,
and `gameplay_mid.png` evidence; it does not claim complete gameplay correctness.

## Repository Layout

```text
momozi-VibeGamingBench/
├── momozi/
│   ├── auto_eval.py             # Agent Harness execution and result writer
│   ├── static_eval.py           # BUILD + contract evidence
│   ├── runtime_smoke.py         # Chromium smoke runner
│   ├── screenshot.py             # deterministic screenshot metadata
│   ├── multimodal_judge.py       # strict JSON VLM judge
│   ├── scoring.py                # versioned component weights and hard caps
│   ├── statistics.py             # paired bootstrap and rank stability
│   ├── leaderboard.py            # release-aware balanced leaderboard
│   └── verify.py                 # deterministic archive verification
├── bench/tasks/                  # 711 concepts × EN/ZH = 1,422 tasks
├── bench/tests/                  # public deterministic behavior suites
├── benchmark_releases/           # release and split manifests
├── scripts/                      # audits, calibration, ablation, validation
├── tests/                        # unit and runtime fixture tests
├── AGENT_HARNESS.md              # external harness contract
├── AUTO_EVALUATION.md            # CLI and result protocol
└── DESIGN.md                     # benchmark design and scope
```

Each language-specific task directory contains exactly:

```text
<task-id>.task.yaml
prompt.md
rubric.original.json
rubric.mapping.json
```

The required generated artifact is:

```text
product/
├── index.html
└── game_logic.js
```

`index.html` provides the rendered browser experience. `game_logic.js` exports
`createGame(opts)` and `advance(game, input, dt)` and must remain independent of
DOM/rendering code.

## Environment

```bash
python3 --version   # 3.11+
node --version      # 20+
pip install -r requirements.txt
python3 -m playwright install chromium
```

For real scoring, copy `.env.example` to `.env` and put the scoring key in the
repository root:

```bash
cp .env.example .env
```

```env
MOMOZI_JUDGE_API_KEY=your-key
MOMOZI_JUDGE_PROVIDER=ark
MOMOZI_JUDGE_MODEL=your-endpoint-model-id
MOMOZI_JUDGE_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
MOMOZI_VLM_API_KEY=your-key
MOMOZI_VLM_PROVIDER=ark
MOMOZI_VLM_MODEL=your-vision-endpoint-model-id
MOMOZI_VLM_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

The key variables are secrets. `.env` is ignored by git and must never be
committed. Legacy `DEEPSEEK_*` variables remain accepted.

## Automatic Evaluation

Evaluate one task with a configured profile:

```bash
python3 scripts/auto_evaluate.py \
  --task mz_sports-fishing-tournament-en \
  --agent codex \
  --model-label your-model
```

Evaluate the full pool only when explicitly intended:

```bash
python3 scripts/auto_evaluate.py \
  --all \
  --agent codex \
  --model-label your-model \
  --workers 4
```

Use any external harness with the contract in
[`AGENT_HARNESS.md`](AGENT_HARNESS.md):

```bash
python3 scripts/auto_evaluate.py \
  --all \
  --harness-command 'your-harness --prompt {prompt_file} --output {product_dir}' \
  --model-label your-model \
  --workers 4
```

Protocol fixtures are available for CI and integration checks:

```bash
python3 scripts/auto_evaluate.py \
  --task mz_sports-fishing-tournament-en \
  --agent mock \
  --mock-judge \
  --mock-runtime \
  --mock-visual \
  --run-id smoke
```

Mock results are explicitly excluded from the official leaderboard.

Results are written under `runs/auto/<run-id>/`; the aggregate outputs are
`leaderboard.json` and `LEADERBOARD.md`. The v0.6 result schema is
`schema_version: 2` with `evaluation_protocol: agent-v2`. Legacy v0.x runners
and `auto-v1` result records remain readable for continuity.

## Scoring

The v0.6 release fuses four 0–100 components:

| Component | Weight | Evidence |
|---|---:|---|
| Static | 40% | BUILD gate, contract pass rate, code judge |
| Dynamic | 25% | Chromium load, stability, input probe, runtime status |
| Visual | 20% | Functional Visual + Presentation screenshot judge |
| Design | 15% | richness and authored visual evidence |

The final score is the weighted raw score subject to diagnostic hard caps:

```text
BUILD failure       → final ≤ 20
boot/page-load fail → final ≤ 10
runtime fatal       → final ≤ 35
```

Raw components and the applied cap are retained in every result. The VLM never
overrides deterministic runtime facts, and malformed judge output is a judge
infrastructure failure rather than a publishable score.

The official leaderboard sorts by **family-balanced score**, while also
reporting micro, concept-balanced, EN, ZH, language gap, static, dynamic,
visual, design, runtime pass rate, bootstrap CI, and rank stability.

## Dataset and Statistics

The bilingual split is deliberate:

- `*-en` contains only the English prompt.
- `*-zh` contains only the Chinese prompt.
- Both variants share `base_task_id`, family, difficulty, and rubric structure.

For inference, EN and ZH are paired by `base_task_id`; they are not treated as
independent game concepts. Aggregation provides:

```text
micro score
concept-balanced score
family-balanced score
EN, ZH, language_gap
paired 95% bootstrap confidence intervals
rank distribution and P(rank=1)
```

The generated composition report is
[`bench/TASK_DISTRIBUTION.md`](bench/TASK_DISTRIBUTION.md).

## Validation

Run the complete local smoke suite:

```bash
bash scripts/smoke.sh
```

Run the bilingual and distribution gates:

```bash
python3 scripts/split_bilingual_tasks.py
python3 scripts/generate_task_distribution.py --check
python3 scripts/audit_tasks.py
```

Run the 1,422-task mock runner/BUILD compatibility audit:

```bash
python3 scripts/validate_pool.py --only-mz --workers 8
```

The CI job runs unit/schema tests, the Chromium fixture, syntax and metadata
checks, and the full mock BUILD audit. It does not run every task in a browser
on every commit.

## Release Scope

The paper-ready release is `v0.7.0`, described by
[`benchmark_releases/v0.7.0.json`](benchmark_releases/v0.7.0.json). The public
concept split is recorded in
[`benchmark_releases/v0.7.0-split.public.json`](benchmark_releases/v0.7.0-split.public.json);
the hidden manifest is generated to a private path and is not committed.

Current boundaries are explicit: difficulty is heuristic, calibration remains
pending until human ratings are supplied, the checkout still contains the full
task pool, and there is no online leaderboard or full gameplay DSL.

## License

BSD-2-Clause. See [`LICENSE`](LICENSE).
