import type { Experience, JobDescription } from "../types";

export const demoExperiences: Experience[] = [
  {
    id: "demo-exp-growth-dashboard",
    title: "用户增长数据看板整理",
    type: "项目经历",
    company: "个人项目",
    role: "产品分析参与者",
    startDate: "2024-03",
    endDate: "2024-05",
    keywords: ["用户", "数据", "分析", "转化", "产品"],
    rawDescription:
      "围绕用户注册、激活和留存链路整理关键指标，使用表格汇总不同渠道的转化情况，协助梳理用户流失环节，并输出简要分析结论。",
    achievements: [
      "整理了注册、激活、留存三个环节的指标口径，形成可复用的分析表。",
      "发现部分渠道激活率偏低，并将问题整理为后续优化建议。",
    ],
  },
  {
    id: "demo-exp-research",
    title: "竞品功能调研与需求梳理",
    type: "项目经历",
    company: "课程项目",
    role: "产品助理",
    startDate: "2023-10",
    endDate: "2023-12",
    keywords: ["产品", "调研", "需求", "用户体验"],
    rawDescription:
      "调研 5 款同类工具的核心功能、信息架构和用户路径，整理用户常见问题，参与输出需求清单和优先级建议。",
    achievements: ["输出竞品对比表和需求优先级说明，支持后续原型设计。"],
  },
];

export const demoJobDescription: JobDescription = {
  id: "demo-jd-growth-product",
  company: "星河科技",
  role: "增长产品经理",
  targetDirection: "增长产品",
  createdAt: new Date().toISOString(),
  jdText:
    "岗位职责：负责用户增长相关产品方案，分析注册、激活、留存等关键指标，协同运营和研发推进实验落地，持续优化用户转化路径。任职要求：具备产品需求分析、数据分析、跨团队协作能力，熟悉用户路径和增长漏斗，有 A/B 测试或增长项目经验优先。",
};
