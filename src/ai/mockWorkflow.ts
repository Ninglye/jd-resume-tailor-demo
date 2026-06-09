import type {
  Experience,
  ExperienceMatch,
  JDAnalysis,
  JobDescription,
  ResumeBullet,
  ResumeContent,
  TailoredExperience,
} from "../types";

const fallbackHardSkills = ["需求分析", "项目推进", "数据分析"];
const fallbackSoftSkills = ["沟通协作", "结构化思考", "主动推进"];

function uniqueItems(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function collectKeywords(text: string) {
  const commonKeywords = [
    "增长",
    "用户",
    "产品",
    "数据",
    "运营",
    "策略",
    "项目",
    "管理",
    "分析",
    "协作",
    "转化",
    "体验",
    "商业化",
    "B端",
    "C端",
    "AI",
    "A/B",
    "SQL",
    "Excel",
    "Python",
  ];

  return commonKeywords.filter((keyword) =>
    text.toLowerCase().includes(keyword.toLowerCase()),
  );
}

function scoreExperience(experience: Experience, analysis: JDAnalysis) {
  const searchableText = [
    experience.title,
    experience.type,
    experience.company,
    experience.role,
    experience.rawDescription,
    ...experience.achievements,
    ...experience.keywords,
  ]
    .join(" ")
    .toLowerCase();

  const matchedKeywords = analysis.keywords.filter((keyword) =>
    searchableText.includes(keyword.toLowerCase()),
  );

  const keywordScore = matchedKeywords.length * 14;
  const achievementScore = Math.min(experience.achievements.length * 6, 18);
  const descriptionScore = experience.rawDescription.length > 80 ? 12 : 6;

  return Math.min(95, 42 + keywordScore + achievementScore + descriptionScore);
}

function hasMetrics(experience: Experience) {
  return /\d|%|倍|万|千|人|次/.test(
    [...experience.achievements, experience.rawDescription].join(" "),
  );
}

function confidenceForExperience(experience: Experience): ResumeBullet["confidence"] {
  if (experience.achievements.length > 0 && experience.rawDescription.length > 80) {
    return "high";
  }

  if (experience.rawDescription.length > 40 || experience.keywords.length > 0) {
    return "medium";
  }

  return "low";
}

function buildEvidenceBullet(
  experience: Experience,
  analysis: JDAnalysis,
  match: ExperienceMatch,
): ResumeBullet {
  const confidence = confidenceForExperience(experience);
  const keyword = match.suggestedKeywords[0] || analysis.keywords[0] || "岗位相关能力";
  const conservativeVerb =
    confidence === "low"
      ? "参与整理"
      : confidence === "medium"
        ? "参与梳理"
        : "围绕";
  const text =
    confidence === "high" && hasMetrics(experience)
      ? `在「${experience.title}」中${conservativeVerb}${keyword}相关工作，结合原始成果沉淀可用于简历呈现的项目表达。`
      : `在「${experience.title}」中${conservativeVerb}${keyword}相关内容，基于已有经历保守呈现职责、过程和产出。`;

  return {
    text,
    evidenceFromOriginalExperience: `来自 title「${experience.title}」、role「${experience.role || "未填写"}」、rawDescription 和 achievements。`,
    jdRelevance: `与 JD 中的「${keyword}」或相近要求相关。`,
    confidence,
  };
}

export function mockAnalyzeJD(job: JobDescription): JDAnalysis {
  const keywords = uniqueItems([
    ...collectKeywords(job.jdText),
    ...collectKeywords(job.role),
    job.targetDirection,
  ]).slice(0, 10);

  return {
    targetDirection: job.targetDirection || `${job.role || "目标岗位"}相关方向`,
    coreResponsibilities: [
      "理解业务目标并拆解关键任务",
      "推动跨团队协作和项目落地",
      "基于数据反馈持续优化方案",
    ],
    hardSkills: keywords.length > 0 ? keywords.slice(0, 5) : fallbackHardSkills,
    softSkills: fallbackSoftSkills,
    keywords: keywords.length > 0 ? keywords : ["业务理解", "项目推进", "数据分析"],
    candidateProfile: `适合具备${job.role || "目标岗位"}相关经验、能结合业务目标推进落地，并能用数据验证结果的候选人。`,
  };
}

export function mockMatchExperiences(
  analysis: JDAnalysis,
  experiences: Experience[],
): ExperienceMatch[] {
  return experiences
    .map((experience) => {
      const score = scoreExperience(experience, analysis);
      const sharedKeywords = experience.keywords.filter((keyword) =>
        analysis.keywords.some((jdKeyword) =>
          jdKeyword.toLowerCase().includes(keyword.toLowerCase()),
        ),
      );
      const suggestedKeywords = uniqueItems([
        ...sharedKeywords,
        ...analysis.keywords.slice(0, 4),
      ]).slice(0, 6);

      return {
        experienceId: experience.id,
        matchScore: score,
        matchReason:
          sharedKeywords.length > 0
            ? `关键词 ${sharedKeywords.join("、")} 与 JD 要求有交集。`
            : "经历描述较完整，可提炼职责、过程和结果来贴合 JD。",
        suggestedPositioning:
          score >= 75
            ? "作为核心经历突出，强调原始成果和岗位相关关键词。"
            : "作为辅助经历使用，保守提炼可迁移能力。",
        suggestedKeywords,
      };
    })
    .sort((first, second) => second.matchScore - first.matchScore)
    .slice(0, 3);
}

export function mockTailorExperiences(
  analysis: JDAnalysis,
  matches: ExperienceMatch[],
  experiences: Experience[],
): TailoredExperience[] {
  return matches
    .map((match) => {
      const experience = experiences.find((item) => item.id === match.experienceId);

      if (!experience) {
        return null;
      }

      const metricsFound = hasMetrics(experience);
      const keywordText =
        match.suggestedKeywords.slice(0, 3).join("、") || "岗位相关能力";

      return {
        experienceId: experience.id,
        originalTitle: experience.title,
        positioning: match.suggestedPositioning,
        tailoredBullets: [
          `基于「${experience.title}」原始经历，保守突出${keywordText}相关内容。`,
          metricsFound
            ? `保留原始经历中已有的量化或结果信息，不新增数字。`
            : `原始经历未提供明确量化结果，因此避免使用“提升、优化、显著增长”等表达。`,
        ],
        jdKeywordsUsed: match.suggestedKeywords,
        authenticityNotes: [
          "仅基于原始经历标题、角色、描述、关键词和成果做表达整理。",
          metricsFound
            ? "原始经历中已有量化信息，可以谨慎引用。"
            : "原始经历未发现明确量化数据，不编造数字或结果。",
        ],
        improvementSuggestions: [
          ...(metricsFound ? [] : ["补充真实量化结果，例如规模、效率、转化率、成本或周期变化。"]),
          ...(experience.rawDescription.length < 80
            ? ["补充项目背景、个人职责、关键动作和最终影响。"]
            : []),
          ...(experience.achievements.length === 0
            ? ["补充 1-3 条真实成果，便于生成更可信的 bullet。"]
            : []),
        ],
      };
    })
    .filter((item): item is TailoredExperience => Boolean(item));
}

export function mockGenerateResume(
  job: JobDescription,
  analysis: JDAnalysis,
  originalExperiences: Experience[],
  tailoredExperiences: TailoredExperience[],
): ResumeContent {
  const tailoredSections = tailoredExperiences.map((tailored) => {
    const original = originalExperiences.find(
      (experience) => experience.id === tailored.experienceId,
    );
    const match: ExperienceMatch = {
      experienceId: tailored.experienceId,
      matchScore: 0,
      matchReason: "",
      suggestedPositioning: tailored.positioning,
      suggestedKeywords: tailored.jdKeywordsUsed,
    };

    return {
      experienceId: tailored.experienceId,
      title: tailored.originalTitle,
      bullets: original
        ? [
            buildEvidenceBullet(original, analysis, match),
            ...original.achievements.slice(0, 1).map<ResumeBullet>((achievement) => ({
              text: `结合「${tailored.originalTitle}」中的真实成果进行呈现：${achievement}`,
              evidenceFromOriginalExperience: "来自 achievements 中用户填写的真实成果。",
              jdRelevance: `与目标岗位的${analysis.keywords.slice(0, 2).join("、") || "相关能力"}要求相关。`,
              confidence: "high",
            })),
          ]
        : [],
    };
  });

  return {
    resumeSummary: `面向${job.company || "目标公司"}${job.role || "目标岗位"}，基于已有经历保守突出${analysis.targetDirection}相关经验。`,
    tailoredExperienceBullets: tailoredSections,
    projectBullets: tailoredExperiences.map(
      (experience) => `${experience.originalTitle}：${experience.positioning}`,
    ),
    skills: uniqueItems([
      ...analysis.hardSkills,
      ...tailoredExperiences.flatMap((experience) => experience.jdKeywordsUsed),
    ]).slice(0, 12),
    keywordOptimizationSuggestions: uniqueItems([
      "补充是否使用过 Excel / SQL / Python 等真实工具。",
      "补充是否产出过报告、模型、看板或分析文档。",
      "补充分析对象，例如收入、成本、费用、GMV、用户数据。",
      "补充可量化结果，避免生成时只能保守表达。",
      "补充是否与业务、财务、运营团队沟通过。",
    ]),
  };
}
