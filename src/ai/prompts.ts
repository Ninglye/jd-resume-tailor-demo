import type {
  Experience,
  ExperienceMatch,
  JDAnalysis,
  JobDescription,
  TailoredExperience,
} from "../types";

const strictJsonRule =
  "只返回严格 JSON，不要返回 Markdown，不要使用代码块，不要添加解释文字。所有字段必须存在；数组字段即使为空也返回 []。";

export function analyzeJDPrompt(job: JobDescription) {
  return `
你是一个简历定制助手。用户会维护自己的过往经历素材库，并粘贴目标岗位 JD。你的任务是先解析 JD，帮助后续流程筛选最相关经历、润色经历表达并生成定制简历。

${strictJsonRule}

输入：
${JSON.stringify(
  {
    company: job.company,
    role: job.role,
    targetDirection: job.targetDirection,
    jdText: job.jdText,
  },
  null,
  2,
)}

返回 JSON 结构：
{
  "targetDirection": "string",
  "coreResponsibilities": ["string"],
  "hardSkills": ["string"],
  "softSkills": ["string"],
  "keywords": ["string"],
  "candidateProfile": "string"
}
`.trim();
}

export function matchExperiencesPrompt(
  analysis: JDAnalysis,
  experiences: Experience[],
) {
  return `
你是一个简历经历匹配助手。根据 JD 解析结果，从用户的经历素材库中挑选最适合目标岗位的经历。

匹配原则：
1. 优先选择与岗位方向、核心职责、硬技能和关键词最相关的经历。
2. 不要编造经历内容，只能基于用户提供的经历素材。
3. 匹配分数为 0-100 的整数。
4. suggestedPositioning 要说明这段经历在定制简历中应该突出什么角度。
5. suggestedKeywords 要给出建议在该经历 bullet 中自然覆盖的关键词。

${strictJsonRule}

输入：
${JSON.stringify(
  {
    jdAnalysis: analysis,
    experiences,
  },
  null,
  2,
)}

返回 JSON 结构：
{
  "matches": [
    {
      "experienceId": "string",
      "matchScore": 0,
      "matchReason": "string",
      "suggestedPositioning": "string",
      "suggestedKeywords": ["string"]
    }
  ]
}
`.trim();
}

export function tailorExperiencesPrompt(
  analysis: JDAnalysis,
  matches: ExperienceMatch[],
  experiences: Experience[],
) {
  return `
你是一个 JD-oriented 简历经历润色助手。请基于 JD 解析结果和已匹配经历，把用户的原始经历改写成更适合目标岗位的简历 bullet points。

重要原则：
1. 严格基于用户已有经历进行改写。
2. 不得虚构公司、岗位、项目、工具、数据、成果或职责。
3. 如果原始经历没有量化数据，不要编造数字。
4. 可以优化表达方式、突出角度、关键词和岗位相关性。
5. 输出要适合直接放进简历 bullet points。
6. 如果原始经历信息不足，请在 improvementSuggestions 中提示用户应该补充哪些真实信息。
7. authenticityNotes 要说明哪些内容来自原始经历，以及哪些地方因为信息不足而保持保守表达。

${strictJsonRule}

输入：
${JSON.stringify(
  {
    jdAnalysis: analysis,
    matchedExperiences: matches,
    originalExperiences: experiences,
  },
  null,
  2,
)}

返回 JSON 结构：
{
  "tailoredExperiences": [
    {
      "experienceId": "string",
      "originalTitle": "string",
      "positioning": "string",
      "tailoredBullets": ["string"],
      "jdKeywordsUsed": ["string"],
      "authenticityNotes": ["string"],
      "improvementSuggestions": ["string"]
    }
  ]
}
`.trim();
}

export function generateResumePrompt(
  job: JobDescription,
  analysis: JDAnalysis,
  originalExperiences: Experience[],
  tailoredExperiences: TailoredExperience[],
) {
  return `
你是一个克制、真实的中文简历改写助手。你的任务不是“把 JD 包装成用户做过的事”，而是基于用户原始经历做岗位化表达：调整表达重点、排序和用词，让真实经历更容易被目标岗位理解。

核心原则：真实性优先
1. 只能基于用户原始经历中的 title、type、company、role、keywords、rawDescription、achievements 改写。
2. 不得虚构公司、岗位、项目、工具、数据、成果、职责或影响。
3. 不得把 JD 中的职责直接写成用户做过的事情。
4. 如果原经历没有明确出现某项能力，只能写成“相关理解”“协助支持”“参与整理”“跟进整理”等保守表达，不能写成“主导”“负责”“搭建”“优化”。

克制贴合 JD
1. 贴合 JD 的方式是调整表达重点、排序和用词，而不是新增事实。
2. 只有当 JD 关键词与原经历内容有真实对应关系时，才可以使用该关键词。
3. 不要为了匹配 JD 而强行加入业务结果、量化提升、决策影响。
4. 如果匹配度不足，请降低表达强度，而不是强行包装。

动词强度控制
1. 如果原经历是辅助性工作，使用：协助、支持、参与、整理、梳理、跟进。
2. 如果原经历明确体现独立完成，才使用：独立完成、负责、搭建、分析。
3. 如果原经历没有结果数据，不要写“提升了”“优化了”“推动了”等结果导向表达。
4. 不要使用“主导”“牵头”“显著提升”“赋能业务”等过强表达，除非原经历明确支持。

不要输出
1. 原经历中没有的工具名称。
2. 原经历中没有的量化数据。
3. 原经历中没有的业务结果。
4. 原经历中没有的管理职责。
5. 空泛套话，例如“提升业务效率”“赋能决策”“推动增长”，除非原经历明确支持。

信息不足时的处理
1. 如果原始经历信息不足，不要硬写。
2. 在 keywordOptimizationSuggestions 中提示用户补充真实信息，例如：
   - 是否使用过 Excel / SQL / Python
   - 是否产出过报告或模型
   - 是否有分析对象，例如收入、成本、费用、GMV、用户数据
   - 是否有可量化结果
   - 是否与业务/财务/运营团队沟通过

每条 bullet 必须带证据：
1. evidenceFromOriginalExperience 必须说明这条 bullet 来自原始经历的哪部分，例如 rawDescription、achievements、keywords、role。
2. jdRelevance 说明它和 JD 哪个要求相关。
3. confidence 表示真实性和匹配置信度，只能是 "high"、"medium"、"low"。
4. 如果 confidence 是 low，bullet 语气必须更保守，避免强动词和结果导向表达。

${strictJsonRule}

输入：
${JSON.stringify(
  {
    targetJob: job,
    jdAnalysis: analysis,
    originalExperiences,
    tailoredExperiences,
  },
  null,
  2,
)}

返回 JSON 结构：
{
  "resumeSummary": "string",
  "tailoredExperienceBullets": [
    {
      "experienceId": "string",
      "title": "string",
      "bullets": [
        {
          "text": "string",
          "evidenceFromOriginalExperience": "string",
          "jdRelevance": "string",
          "confidence": "high"
        }
      ]
    }
  ],
  "projectBullets": ["string"],
  "skills": ["string"],
  "keywordOptimizationSuggestions": ["string"]
}
`.trim();
}
