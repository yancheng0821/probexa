const locales = {
  en: {
    // Sidebar
    "nav.dashboard": "Dashboard",
    "nav.tasks": "Tasks",
    "nav.trends": "Trends",
    "nav.painPoints": "Pain Points",
    "nav.needs": "Needs",
    "nav.schedules": "Schedules",
    "nav.reports": "Reports",
    "nav.collapse": "Collapse",

    // Page titles & subtitles
    "page.dashboard.title": "Dashboard",
    "page.dashboard.subtitle": "Research overview and insights",
    "page.tasks.title": "Tasks",
    "page.tasks.subtitle": "Create and manage scraping tasks",
    "page.trends.title": "Trends",
    "page.trends.subtitle": "Rising topics and engagement patterns",
    "page.painPoints.title": "Pain Points",
    "page.painPoints.subtitle": "Frequency and severity analysis",
    "page.needs.title": "Needs",
    "page.needs.subtitle": "Unmet needs and market opportunities",
    "page.schedules.title": "Schedules",
    "page.schedules.subtitle": "Automated scraping schedules",
    "page.reports.title": "Reports",
    "page.reports.subtitle": "Generate and export reports",

    // Dashboard
    "dashboard.totalTasks": "Total Tasks",
    "dashboard.itemsScraped": "Items Scraped",
    "dashboard.painPoints": "Pain Points",
    "dashboard.risingTrends": "Rising Trends",
    "dashboard.completed": "completed",
    "dashboard.running": "running",
    "dashboard.runAnalysis": "Run analysis",
    "dashboard.scrapingActivity": "Scraping Activity (7 days)",
    "dashboard.byPlatform": "By Platform",
    "dashboard.recentTasks": "Recent Tasks",

    // Tasks
    "tasks.keyword": "Keyword",
    "tasks.platform": "Platform",
    "tasks.status": "Status",
    "tasks.items": "Items",
    "tasks.actions": "Actions",
    "tasks.startScraping": "Start Scraping",
    "tasks.enterKeyword": "Search keyword...",
    "tasks.created": "Task created",
    "tasks.createFailed": "Failed to create task",

    // Trends
    "trends.summary": "Summary",
    "trends.engagementScores": "Engagement Scores",
    "trends.noData": "No trend data yet. Run a scrape task and trigger trends analysis.",

    // Pain Points
    "painPoints.matrix": "Frequency × Severity Matrix",
    "painPoints.issue": "Issue",
    "painPoints.frequency": "Frequency",
    "painPoints.severity": "Severity",
    "painPoints.sampleQuotes": "Sample Quotes",
    "painPoints.noData": "No pain point data yet.",

    // Needs
    "needs.mentioned": "Mentioned {count} times",
    "needs.noData": "No unmet needs data yet.",

    // Schedules
    "schedules.addSchedule": "+ Add Schedule",
    "schedules.newSchedule": "New Schedule",
    "schedules.cron": "Cron",
    "schedules.active": "Active",
    "schedules.lastRun": "Last Run",
    "schedules.never": "Never",
    "schedules.cronHelp": "e.g., '0 8 * * *' = daily at 8am",
    "schedules.created": "Schedule created",
    "schedules.deleted": "Deleted",

    // Reports
    "reports.selectTask": "Select a completed task",
    "reports.generate": "Generate Report",
    "reports.selectFirst": "Select a task first",
    "reports.generateFailed": "Failed to generate report. Make sure analysis has been run.",
    "reports.noData": "Select a task and generate a report",

    // Common
    "common.create": "Create",
  },
  zh: {
    // Sidebar
    "nav.dashboard": "仪表盘",
    "nav.tasks": "采集任务",
    "nav.trends": "趋势分析",
    "nav.painPoints": "痛点分析",
    "nav.needs": "需求洞察",
    "nav.schedules": "定时任务",
    "nav.reports": "报告中心",
    "nav.collapse": "收起",

    // Page titles & subtitles
    "page.dashboard.title": "仪表盘",
    "page.dashboard.subtitle": "研究概览与洞察",
    "page.tasks.title": "采集任务",
    "page.tasks.subtitle": "创建和管理数据采集任务",
    "page.trends.title": "趋势分析",
    "page.trends.subtitle": "热门话题与互动趋势",
    "page.painPoints.title": "痛点分析",
    "page.painPoints.subtitle": "频次与严重度分析",
    "page.needs.title": "需求洞察",
    "page.needs.subtitle": "未满足的需求与市场机会",
    "page.schedules.title": "定时任务",
    "page.schedules.subtitle": "自动化采集计划",
    "page.reports.title": "报告中心",
    "page.reports.subtitle": "生成与导出分析报告",

    // Dashboard
    "dashboard.totalTasks": "总任务数",
    "dashboard.itemsScraped": "采集数据",
    "dashboard.painPoints": "痛点数量",
    "dashboard.risingTrends": "上升趋势",
    "dashboard.completed": "已完成",
    "dashboard.running": "运行中",
    "dashboard.runAnalysis": "运行分析",
    "dashboard.scrapingActivity": "采集活动（7天）",
    "dashboard.byPlatform": "按平台分布",
    "dashboard.recentTasks": "最近任务",

    // Tasks
    "tasks.keyword": "关键词",
    "tasks.platform": "平台",
    "tasks.status": "状态",
    "tasks.items": "数据量",
    "tasks.actions": "操作",
    "tasks.startScraping": "开始采集",
    "tasks.enterKeyword": "输入搜索关键词...",
    "tasks.created": "任务已创建",
    "tasks.createFailed": "创建任务失败",

    // Trends
    "trends.summary": "摘要",
    "trends.engagementScores": "互动评分",
    "trends.noData": "暂无趋势数据。请先运行采集任务并触发趋势分析。",

    // Pain Points
    "painPoints.matrix": "频次 × 严重度矩阵",
    "painPoints.issue": "问题",
    "painPoints.frequency": "频次",
    "painPoints.severity": "严重度",
    "painPoints.sampleQuotes": "用户原话",
    "painPoints.noData": "暂无痛点数据。",

    // Needs
    "needs.mentioned": "被提及 {count} 次",
    "needs.noData": "暂无需求数据。",

    // Schedules
    "schedules.addSchedule": "+ 添加计划",
    "schedules.newSchedule": "新建计划",
    "schedules.cron": "Cron 表达式",
    "schedules.active": "启用",
    "schedules.lastRun": "上次运行",
    "schedules.never": "从未运行",
    "schedules.cronHelp": "例如 '0 8 * * *' = 每天8点",
    "schedules.created": "计划已创建",
    "schedules.deleted": "已删除",

    // Reports
    "reports.selectTask": "选择已完成的任务",
    "reports.generate": "生成报告",
    "reports.selectFirst": "请先选择一个任务",
    "reports.generateFailed": "生成报告失败，请确保已运行分析。",
    "reports.noData": "选择任务并生成报告",

    // Common
    "common.create": "创建",
  },
} as const;

export type Locale = keyof typeof locales;
export type TranslationKey = keyof (typeof locales)["en"];
export default locales;
