import { FormEvent, useState } from "react";
import { loadExperiences } from "../data/storage";
import type { WorkflowResult } from "../App";
import type { Experience, JobDescription, TailoredExperience } from "../types";

type JobFormState = {
  company: string;
  role: string;
  targetDirection: string;
  jdText: string;
};

type JobInputPageProps = {
  jobs: JobDescription[];
  selectedJob: JobDescription | null;
  workflowResult: WorkflowResult | null;
  onJobSubmitted: (job: JobDescription) => void | Promise<void>;
  onJobSelected: (job: JobDescription) => void;
  onJobDeleted: (jobId: string) => void;
  onRegenerateJob: (job: JobDescription) => void | Promise<void>;
  onOpenResume: () => void;
};

const emptyForm: JobFormState = {
  company: "",
  role: "",
  targetDirection: "",
  jdText: "",
};

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function JobInputPage({
  jobs,
  selectedJob,
  workflowResult,
  onJobSubmitted,
  onJobSelected,
  onJobDeleted,
  onRegenerateJob,
  onOpenResume,
}: JobInputPageProps) {
  const [form, setForm] = useState<JobFormState>(emptyForm);
  const [experiences] = useState<Experience[]>(() => loadExperiences());

  function updateField<K extends keyof JobFormState>(
    field: K,
    value: JobFormState[K],
  ) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const job: JobDescription = {
      id: createId(),
      company: form.company.trim(),
      role: form.role.trim(),
      targetDirection: form.targetDirection.trim(),
      jdText: form.jdText.trim(),
      createdAt: new Date().toISOString(),
    };

    void onJobSubmitted(job);
    setForm(emptyForm);
  }

  return (
    <section className="jd-workspace">
      <div className="jd-top-grid">
        <form className="experience-form" onSubmit={handleSubmit}>
          <div className="section-heading">
            <div>
              <h2>新增目标 JD</h2>
              <p>保存后会自动生成 mock 分析、经历润色和定制简历。</p>
            </div>
          </div>

          {experiences.length === 0 && (
            <div className="inline-empty">
              还没有经历素材。建议先去经历素材库新增经历，再生成匹配和润色结果。
            </div>
          )}

          <div className="field-grid">
            <label>
              公司名
              <input
                required
                placeholder="例如：某科技公司"
                value={form.company}
                onChange={(event) => updateField("company", event.target.value)}
              />
            </label>

            <label>
              岗位名称
              <input
                required
                placeholder="例如：产品经理"
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
              />
            </label>
          </div>

          <label>
            目标方向
            <input
              placeholder="可选，例如：增长产品、AI 产品、B 端平台"
              value={form.targetDirection}
              onChange={(event) =>
                updateField("targetDirection", event.target.value)
              }
            />
          </label>

          <label>
            完整 JD
            <textarea
              required
              placeholder="粘贴岗位职责、任职要求、加分项等完整内容。"
              rows={10}
              value={form.jdText}
              onChange={(event) => updateField("jdText", event.target.value)}
            />
          </label>

          <button className="primary-button" type="submit">
            保存 JD 并生成 mock 结果
          </button>
        </form>

        <section className="result-panel">
          <div className="section-heading">
            <div>
              <h2>历史 JD</h2>
              <p>{jobs.length} 条记录</p>
            </div>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state compact">
              <h3>还没有 JD</h3>
              <p>在左侧粘贴目标岗位 JD，保存后会出现在这里。</p>
            </div>
          ) : (
            <div className="job-list">
              {jobs.map((job) => (
                <article
                  className={
                    selectedJob?.id === job.id ? "job-card active" : "job-card"
                  }
                  key={job.id}
                >
                  <button type="button" onClick={() => onJobSelected(job)}>
                    <strong>{job.company}</strong>
                    <span>{job.role}</span>
                    <small>
                      {job.targetDirection || "未填写目标方向"} ·{" "}
                      {formatDate(job.createdAt)}
                    </small>
                  </button>
                  <div className="card-actions">
                    <button type="button" onClick={() => onRegenerateJob(job)}>
                      重新生成
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => onJobDeleted(job.id)}
                    >
                      删除
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="jd-detail-grid">
        <section className="result-panel">
          <div className="section-heading">
            <div>
              <h2>JD 详情</h2>
              <p>{selectedJob ? "当前选中的目标岗位" : "等待选择"}</p>
            </div>
          </div>

          {!selectedJob ? (
            <div className="empty-state compact">
              <h3>没有选中的 JD</h3>
              <p>新增或点击历史 JD 后，这里会展示原始岗位内容。</p>
            </div>
          ) : (
            <div className="job-detail">
              <dl className="analysis-list">
                <div>
                  <dt>公司</dt>
                  <dd>{selectedJob.company}</dd>
                </div>
                <div>
                  <dt>岗位</dt>
                  <dd>{selectedJob.role}</dd>
                </div>
                <div>
                  <dt>目标方向</dt>
                  <dd>{selectedJob.targetDirection || "未填写"}</dd>
                </div>
              </dl>
              <p className="jd-text">{selectedJob.jdText}</p>
            </div>
          )}
        </section>

        <section className="result-panel">
          <div className="section-heading">
            <div>
              <h2>mock 分析结果</h2>
              <p>展示匹配、润色和生成前的关键结果。</p>
            </div>
            {workflowResult && (
              <button className="text-button" type="button" onClick={onOpenResume}>
                查看简历
              </button>
            )}
          </div>

          {!workflowResult ? (
            <div className="empty-state compact">
              <h3>还没有生成结果</h3>
              <p>新增 JD 或点击历史 JD 的“重新生成”来创建 mock 结果。</p>
            </div>
          ) : (
            <div className="workflow-results">
              {workflowResult.warnings.length > 0 && (
                <div className="warning-list">
                  {workflowResult.warnings.map((warning) => (
                    <p key={`${warning.step}-${warning.message}`}>
                      {warning.message}
                    </p>
                  ))}
                </div>
              )}

              <div>
                <h3>JD 解析</h3>
                <dl className="analysis-list">
                  <div>
                    <dt>岗位方向</dt>
                    <dd>{workflowResult.analysis.targetDirection}</dd>
                  </div>
                  <div>
                    <dt>候选人画像</dt>
                    <dd>{workflowResult.analysis.candidateProfile}</dd>
                  </div>
                </dl>
              </div>

              <div className="result-grid">
                <ResultBlock
                  title="核心职责"
                  items={workflowResult.analysis.coreResponsibilities}
                />
                <ResultBlock
                  title="硬技能"
                  items={workflowResult.analysis.hardSkills}
                />
                <ResultBlock
                  title="软技能"
                  items={workflowResult.analysis.softSkills}
                />
                <ResultBlock
                  title="关键词"
                  items={workflowResult.analysis.keywords}
                />
              </div>

              <div>
                <h3>JD-oriented 经历润色</h3>
                {workflowResult.tailoredExperiences.length === 0 ? (
                  <p className="muted-text">
                    还没有可润色的经历。请先到经历素材库添加素材。
                  </p>
                ) : (
                  <div className="tailored-list">
                    {workflowResult.tailoredExperiences.map((experience) => (
                      <TailoredExperienceCard
                        experience={experience}
                        key={experience.experienceId}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </section>
    </section>
  );
}

type ResultBlockProps = {
  title: string;
  items: string[];
};

function ResultBlock({ title, items }: ResultBlockProps) {
  return (
    <div className="result-block">
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

type TailoredExperienceCardProps = {
  experience: TailoredExperience;
};

function TailoredExperienceCard({ experience }: TailoredExperienceCardProps) {
  return (
    <article className="tailored-card">
      <div className="section-heading">
        <div>
          <span className="type-badge">润色经历</span>
          <h3>{experience.originalTitle}</h3>
          <p>{experience.positioning}</p>
        </div>
      </div>

      <div className="keyword-list compact">
        {experience.jdKeywordsUsed.map((keyword) => (
          <span key={keyword}>{keyword}</span>
        ))}
      </div>

      <ResultBlock title="润色后 bullets" items={experience.tailoredBullets} />
      <ResultBlock title="真实性说明" items={experience.authenticityNotes} />
      <ResultBlock
        title="建议补充的信息"
        items={
          experience.improvementSuggestions.length > 0
            ? experience.improvementSuggestions
            : ["当前素材已足够生成保守版本，可继续补充更具体的真实成果。"]
        }
      />
    </article>
  );
}

export default JobInputPage;
