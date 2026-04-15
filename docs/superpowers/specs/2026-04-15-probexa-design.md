# Probexa — 跨境选品需求洞察平台设计文档

## 概述

从海外社交媒体（TikTok / YouTube / Reddit / Amazon）采集用户生成内容，通过 AI 分析提取产品需求、痛点和趋势，辅助跨境电商选品决策。

**目标用户：** 个人使用（单用户，无需权限系统）
**首期聚焦：** TikTok 平台，跑通采集→分析→展示全链路，再扩展到其他平台。

---

## 1. 技术架构

采用**后台任务队列架构**，API 层和采集/分析任务解耦：

```
[React Frontend :3000] → [FastAPI API :8000] → [PostgreSQL :5432]
                                ↓
                         [Celery + Redis :6379]
                              ├── 爬虫 Worker (Playwright)
                              └── 分析 Worker (OpenAI)

[Celery Beat] → 定时投递采集任务
```

**技术栈：**
- 后端：Python / FastAPI / Celery / SQLAlchemy / Alembic
- 前端：React / Vite / Recharts / Ant Design / Axios
- 数据库：PostgreSQL
- 消息队列：Redis
- 爬虫：Playwright
- AI：OpenAI API（gpt-4o / gpt-4o-mini）
- 部署：Docker Compose

---

## 2. 项目结构

```
probexa/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI 路由
│   │   ├── core/           # 配置、数据库连接
│   │   ├── models/         # SQLAlchemy 数据模型
│   │   ├── scrapers/       # 各平台爬虫
│   │   │   ├── base.py     # 爬虫基类
│   │   │   ├── tiktok.py
│   │   │   ├── youtube.py
│   │   │   ├── reddit.py
│   │   │   └── amazon.py
│   │   ├── analyzers/      # AI 分析模块
│   │   ├── tasks/          # Celery 任务定义
│   │   ├── reports/        # 报告生成
│   │   └── scheduler/      # 定时任务配置
│   ├── alembic/            # 数据库迁移
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面
│   │   ├── hooks/          # 自定义 hooks
│   │   └── api/            # API 调用封装
│   └── package.json
└── docker-compose.yml      # PostgreSQL + Redis
```

---

## 3. 数据模型

### 3.1 scrape_tasks — 采集任务

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| keyword | VARCHAR | 搜索关键词 |
| platform | VARCHAR | tiktok / youtube / reddit / amazon |
| status | VARCHAR | pending / running / completed / failed |
| total_items | INTEGER | 采集到的条目数 |
| created_at | TIMESTAMP | 创建时间 |
| completed_at | TIMESTAMP | 完成时间 |

### 3.2 contents — 采集内容

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| task_id | UUID (FK) | 关联采集任务 |
| platform | VARCHAR | 来源平台 |
| source_id | VARCHAR | 平台原始 ID（去重） |
| content_type | VARCHAR | video / comment / post / review |
| title | TEXT | 标题 |
| body | TEXT | 正文/评论文本 |
| author | VARCHAR | 作者 |
| url | TEXT | 原始链接 |
| metrics | JSON | {views, likes, comments, shares} |
| published_at | TIMESTAMP | 发布时间 |
| raw_data | JSON | 原始数据完整存档 |
| created_at | TIMESTAMP | 入库时间 |

**约束：** `(platform, source_id)` 唯一索引，防止重复入库。

### 3.3 analysis_results — 分析结果

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| task_id | UUID (FK) | 关联采集任务 |
| analysis_type | VARCHAR | trends / pain_points / unmet_needs / pricing |
| summary | TEXT | AI 生成的摘要 |
| details | JSON | 结构化分析结果 |
| model_used | VARCHAR | gpt-4o / gpt-4o-mini |
| token_usage | JSON | {prompt_tokens, completion_tokens, total_cost} |
| created_at | TIMESTAMP | 分析时间 |

### 3.4 scheduled_jobs — 定时任务

| 字段 | 类型 | 说明 |
|------|------|------|
| id | UUID | 主键 |
| keyword | VARCHAR | 关键词 |
| platform | VARCHAR | 目标平台 |
| cron_expression | VARCHAR | Cron 表达式 |
| is_active | BOOLEAN | 是否启用 |
| last_run_at | TIMESTAMP | 上次执行时间 |
| created_at | TIMESTAMP | 创建时间 |

---

## 4. 爬虫架构

### 4.1 基类设计

```python
class BaseScraper:
    async def scrape(self, keyword: str, max_items: int) -> list[dict]
    async def parse_item(self, raw_data) -> dict
    async def scroll_and_collect(self, page, max_items: int)
```

### 4.2 各平台采集策略

| 平台 | 采集方式 | 采集内容 |
|------|---------|---------|
| TikTok | Playwright | 视频元数据 + 评论 |
| YouTube | YouTube Data API v3（免费） | 视频元数据 + 评论 |
| Reddit | Reddit API（免费，需注册 app） | 帖子 + 评论 |
| Amazon | Playwright | 商品信息 + 评论 |

### 4.3 反爬策略

- 随机延迟：2-5 秒
- User-Agent 轮换
- 单次任务超时上限，防止无限卡住
- 失败自动重试，最多 3 次

---

## 5. AI 分析模块

### 5.1 分析流程

```
采集完成 → 按批次（100条/批）送入 OpenAI → JSON 结构化输出 → 存入 analysis_results
```

### 5.2 四种分析类型

| 类型 | 输入 | 输出 |
|------|------|------|
| trends | 视频/帖子标题 + 互动数据 | 热门话题排名、增长趋势、关键词云 |
| pain_points | 评论/评价文本 | 痛点分类列表、频次、严重程度评分 |
| unmet_needs | 评论中 "I wish..." 类表达 | 需求描述、提及次数、市场价值评估 |
| pricing | 价格相关评论 | 用户预期价格区间、性价比关注点 |

### 5.3 模型策略

- **gpt-4o-mini：** 大批量初筛，成本低速度快
- **gpt-4o：** 深度分析和最终报告生成

### 5.4 Prompt 设计要点

- 要求 JSON 格式输出，方便结构化存储
- 每批数据带上关键词和平台上下文
- 分析结果附带置信度评分

---

## 6. Dashboard 与报告

### 6.1 页面规划

| 页面 | 功能 |
|------|------|
| 首页概览 | 最近任务状态、关键指标卡片（总采集量、活跃关键词、最新趋势） |
| 任务管理 | 创建/查看采集任务、进度跟踪、手动触发 |
| 趋势看板 | 趋势折线图、热门话题柱状图、关键词云 |
| 痛点分析 | 痛点分类列表、频次/严重度矩阵、原始评论溯源 |
| 需求洞察 | 未满足需求列表、潜在价值排序、相关评论引用 |
| 定时任务 | 配置/管理定时采集计划 |
| 报告中心 | 查看/下载历史报告 |

### 6.2 前端技术

- React + Vite（构建工具）
- Recharts（图表）
- Ant Design（UI 组件库）
- Axios（HTTP 请求）

### 6.3 定期报告

- 支持按关键词或时间段生成
- Markdown 生成 → 导出 PDF
- 内容：趋势总结 + 痛点 Top10 + 需求洞察 + 数据图表
- 可配置频率：日报 / 周报

---

## 7. API 设计

```
# 采集任务
POST   /api/tasks                创建采集任务
GET    /api/tasks                任务列表（分页、筛选）
GET    /api/tasks/{id}           任务详情 + 进度
DELETE /api/tasks/{id}           取消/删除任务

# 采集内容
GET    /api/contents             内容列表（按任务/平台/关键词筛选）
GET    /api/contents/{id}        内容详情（含原始数据）

# AI 分析
POST   /api/analysis             手动触发分析
GET    /api/analysis             分析结果列表
GET    /api/analysis/{id}        分析详情

# 趋势与洞察
GET    /api/insights/trends      趋势数据
GET    /api/insights/pain-points 痛点汇总
GET    /api/insights/needs       未满足需求汇总

# 定时任务
POST   /api/schedules            创建定时任务
GET    /api/schedules            定时任务列表
PUT    /api/schedules/{id}       修改定时任务
DELETE /api/schedules/{id}       删除定时任务

# 报告
POST   /api/reports              生成报告
GET    /api/reports              报告列表
GET    /api/reports/{id}/download 下载报告
```

---

## 8. 部署

### Docker Compose 服务

```
docker-compose.yml:
├── PostgreSQL (5432)
├── Redis (6379)
├── FastAPI 后端 (8000)
├── Celery Worker（爬虫 + 分析）
├── Celery Beat（定时调度）
└── React 前端 (3000)
```

### 本地开发

- `docker-compose up -d postgres redis` — 只起依赖服务
- 后端和前端本地运行，方便调试

### 环境变量

```
DATABASE_URL=postgresql://probexa:password@localhost:5432/probexa
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-...
```
