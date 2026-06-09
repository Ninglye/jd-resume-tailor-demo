import type { ReactNode } from "react";
import CopyButton from "../components/CopyButton";
import type {
  GeneratedResume,
  JobDescription,
  ResumeBullet,
  ResumeExperienceSection,
} from "../types";

type ResumePageProps = {
  job: JobDescription | null;
  resume: GeneratedResume | null;
  onGoToExperiences: () => void;
  onGoToJobs: () => void;
};

function formatList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function formatBulletSections(sections: ResumeExperienceSection[]) {
  return sections
    .map((section) =>
      [
        section.title,
        ...section.bullets.map(
          (bullet) =>
            `- ${bullet.text}\n  证据：${bullet.evidenceFromOriginalExperience}\n  JD 相关性：${bullet.jdRelevance}\n  置信度：${bullet.confidence}`,
        ),
      ].join("\n"),
    )
    .join("\n\n");
}

function normalizeBulletSections(
  sections: ResumeExperienceSection[] | string[],
): ResumeExperienceSection[] {
  if (sections.length === 0) {
    return [];
  }

  if (typeof sections[0] === "string") {
    return [
      {
        experienceId: "legacy",
        title: "历史生成内容",
        bullets: (sections as string[]).map((text) => ({
          text,
          evidenceFromOriginalExperience: "旧版本生成结果未保存证据信息，建议重新生成。",
          jdRelevance: "旧版本生成结果未保存 JD 相关性，建议重新生成。",
          confidence: "low",
        })),
      },
    ];
  }

  return sections as ResumeExperienceSection[];
}

function buildFullResumeText(job: JobDescription, resume: GeneratedResume) {
  const content = resume.resumeContent;
  const bulletSections = normalizeBulletSections(
    content.tailoredExperienceBullets,
  );

  return [
    `${job.company} - ${job.role}`,
    job.targetDirection ? `目标方向：${job.targetDirection}` : "",
    "",
    "个人简介",
    content.resumeSummary,
    "",
    "定制经历",
    formatBulletSections(bulletSections),
    "",
    "项目亮点",
    formatList(content.projectBullets),
    "",
    "技能关键词",
    content.skills.join("、"),
    "",
    "关键词优化建议",
    formatList(content.keywordOptimizationSuggestions),
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function ResumePage({
  job,
  resume,
  onGoToExperiences,
  onGoToJobs,
}: ResumePageProps) {
  if (!job || !resume) {
    return (
      <section className="result-panel">
        <div className="empty-state compact">
          <h3>还没有生成结果</h3>
          <p>先去 JD 管理页新增或选择一条 JD，并生成 mock 或真实 AI 结果。</p>
          <div className="empty-actions">
            <button className="primary-button" type="button" onClick={onGoToJobs}>
              去 JD 管理
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={onGoToExperiences}
            >
              去经历素材库
            </button>
          </div>
        </div>
      </section>
    );
  }

  const content = resume.resumeContent;
  const bulletSections = normalizeBulletSections(
    content.tailoredExperienceBullets,
  );
  const fullResumeText = buildFullResumeText(job, resume);

  return (
    <section className="resume-page">
      <section className="result-panel">
        <div className="resume-hero">
          <div>
            <p className="eyebrow">最近一次生成</p>
            <h2>
              {job.company} · {job.role}
            </h2>
            <p>{job.targetDirection || "未填写目标方向"}</p>
          </div>
          <CopyButton text={fullResumeText} label="复制完整简历" />
        </div>
      </section>

      <ResumeSection
        title="个人简介"
        copyText={content.resumeSummary}
        copyLabel="复制 Summary"
      >
        <p>{content.resumeSummary}</p>
      </ResumeSection>

      <ResumeSection
        title="定制经历 bullets"
        copyText={formatBulletSections(bulletSections)}
        copyLabel="复制经历 bullets"
      >
        <div className="evidence-bullet-list">
          {bulletSections.map((section) => (
            <article className="evidence-section" key={section.experienceId}>
              <h3>{section.title}</h3>
              {section.bullets.map((bullet) => (
                <EvidenceBullet bullet={bullet} key={bullet.text} />
              ))}
            </article>
          ))}
        </div>
      </ResumeSection>

      <ResumeSection
        title="项目亮点"
        copyText={formatList(content.projectBullets)}
        copyLabel="复制项目亮点"
      >
        <ul>
          {content.projectBullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </ResumeSection>

      <ResumeSection
        title="技能关键词"
        copyText={content.skills.join("、")}
        copyLabel="复制 Skills"
      >
        <div className="keyword-list">
          {content.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </ResumeSection>

      <ResumeSection
        title="关键词优化建议"
        copyText={formatList(content.keywordOptimizationSuggestions)}
        copyLabel="复制建议"
      >
        <ul>
          {content.keywordOptimizationSuggestions.map((suggestion) => (
            <li key={suggestion}>{suggestion}</li>
          ))}
        </ul>
      </ResumeSection>
    </section>
  );
}

type EvidenceBulletProps = {
  bullet: ResumeBullet;
};

function EvidenceBullet({ bullet }: EvidenceBulletProps) {
  return (
    <div className="evidence-bullet">
      <div className="confidence-row">
        <p>{bullet.text}</p>
        <span className={`confidence-badge ${bullet.confidence}`}>
          {bullet.confidence}
        </span>
      </div>
      <dl>
        <div>
          <dt>证据</dt>
          <dd>{bullet.evidenceFromOriginalExperience}</dd>
        </div>
        <div>
          <dt>JD 相关性</dt>
          <dd>{bullet.jdRelevance}</dd>
        </div>
      </dl>
    </div>
  );
}

type ResumeSectionProps = {
  title: string;
  copyText: string;
  copyLabel: string;
  children: ReactNode;
};

function ResumeSection({
  title,
  copyText,
  copyLabel,
  children,
}: ResumeSectionProps) {
  return (
    <section className="result-panel resume-section">
      <div className="section-heading">
        <h2>{title}</h2>
        <CopyButton text={copyText} label={copyLabel} />
      </div>
      <div className="resume-preview">{children}</div>
    </section>
  );
}

export default ResumePage;
