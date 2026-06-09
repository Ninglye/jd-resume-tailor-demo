import { FormEvent, useEffect, useMemo, useState } from "react";
import { loadExperiences, saveExperiences } from "../data/storage";
import type { Experience } from "../types";

type ExperienceFormState = Omit<
  Experience,
  "id" | "keywords" | "achievements"
> & {
  keywords: string;
  achievements: string;
};

const emptyForm: ExperienceFormState = {
  title: "",
  type: "项目经历",
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  keywords: "",
  rawDescription: "",
  achievements: "",
};

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitKeywords(value: string) {
  return value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function experienceToForm(experience: Experience): ExperienceFormState {
  return {
    ...experience,
    keywords: experience.keywords.join(", "),
    achievements: experience.achievements.join("\n"),
  };
}

function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>(() =>
    loadExperiences(),
  );
  const [form, setForm] = useState<ExperienceFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    saveExperiences(experiences);
  }, [experiences]);

  const sortedExperiences = useMemo(
    () =>
      [...experiences].sort((first, second) =>
        second.startDate.localeCompare(first.startDate),
      ),
    [experiences],
  );

  const isEditing = editingId !== null;

  function updateField<K extends keyof ExperienceFormState>(
    field: K,
    value: ExperienceFormState[K],
  ) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const experience: Experience = {
      id: editingId ?? createId(),
      title: form.title.trim(),
      type: form.type.trim(),
      company: form.company.trim(),
      role: form.role.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      keywords: splitKeywords(form.keywords),
      rawDescription: form.rawDescription.trim(),
      achievements: splitLines(form.achievements),
    };

    if (isEditing) {
      setExperiences((currentExperiences) =>
        currentExperiences.map((item) =>
          item.id === editingId ? experience : item,
        ),
      );
    } else {
      setExperiences((currentExperiences) => [experience, ...currentExperiences]);
    }

    resetForm();
  }

  function handleEdit(experience: Experience) {
    setEditingId(experience.id);
    setForm(experienceToForm(experience));
  }

  function handleDelete(id: string) {
    setExperiences((currentExperiences) =>
      currentExperiences.filter((experience) => experience.id !== id),
    );

    if (editingId === id) {
      resetForm();
    }
  }

  return (
    <section className="experience-layout">
      <form className="experience-form" onSubmit={handleSubmit}>
        <div className="section-heading">
          <h2>{isEditing ? "编辑经历" : "新增经历"}</h2>
          {isEditing && (
            <button className="text-button" onClick={resetForm} type="button">
              取消编辑
            </button>
          )}
        </div>

        <label>
          经历标题
          <input
            required
            placeholder="例如：会员增长系统重构"
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
        </label>

        <div className="field-grid">
          <label>
            类型
            <select
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
            >
              <option>项目经历</option>
              <option>工作经历</option>
              <option>实习经历</option>
              <option>校园经历</option>
              <option>其他</option>
            </select>
          </label>

          <label>
            公司/组织
            <input
              placeholder="例如：某科技公司"
              value={form.company}
              onChange={(event) => updateField("company", event.target.value)}
            />
          </label>
        </div>

        <div className="field-grid">
          <label>
            角色
            <input
              placeholder="例如：产品经理"
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
            />
          </label>

          <label>
            关键词
            <input
              placeholder="增长, 数据分析, A/B 测试"
              value={form.keywords}
              onChange={(event) => updateField("keywords", event.target.value)}
            />
          </label>
        </div>

        <div className="field-grid">
          <label>
            开始时间
            <input
              type="month"
              value={form.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
            />
          </label>

          <label>
            结束时间
            <input
              type="month"
              value={form.endDate}
              onChange={(event) => updateField("endDate", event.target.value)}
            />
          </label>
        </div>

        <label>
          原始描述
          <textarea
            required
            placeholder="记录这段经历的背景、职责、过程和结果。"
            rows={5}
            value={form.rawDescription}
            onChange={(event) =>
              updateField("rawDescription", event.target.value)
            }
          />
        </label>

        <label>
          关键成果
          <textarea
            placeholder="每行一条成果，例如：将转化率提升 18%。"
            rows={4}
            value={form.achievements}
            onChange={(event) => updateField("achievements", event.target.value)}
          />
        </label>

        <button className="primary-button" type="submit">
          {isEditing ? "保存修改" : "保存经历"}
        </button>
      </form>

      <div className="experience-list-panel">
        <div className="section-heading">
          <div>
            <h2>经历列表</h2>
            <p>{experiences.length} 条素材</p>
          </div>
        </div>

        {sortedExperiences.length === 0 ? (
          <div className="empty-state">
            <h3>还没有经历素材</h3>
            <p>先把项目、工作或实习经历存下来，后续会用于匹配目标 JD。</p>
          </div>
        ) : (
          <div className="experience-list">
            {sortedExperiences.map((experience) => (
              <article className="experience-card" key={experience.id}>
                <div className="card-header">
                  <div>
                    <span className="type-badge">{experience.type}</span>
                    <h3>{experience.title}</h3>
                    <p>
                      {[experience.company, experience.role]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <div className="card-actions">
                    <button type="button" onClick={() => handleEdit(experience)}>
                      编辑
                    </button>
                    <button
                      className="danger-button"
                      type="button"
                      onClick={() => handleDelete(experience.id)}
                    >
                      删除
                    </button>
                  </div>
                </div>

                {(experience.startDate || experience.endDate) && (
                  <p className="date-range">
                    {experience.startDate || "未填写"} -{" "}
                    {experience.endDate || "至今"}
                  </p>
                )}

                {experience.keywords.length > 0 && (
                  <div className="keyword-list">
                    {experience.keywords.map((keyword) => (
                      <span key={keyword}>{keyword}</span>
                    ))}
                  </div>
                )}

                <p className="description">{experience.rawDescription}</p>

                {experience.achievements.length > 0 && (
                  <ul className="achievement-list">
                    {experience.achievements.map((achievement) => (
                      <li key={achievement}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default ExperiencesPage;
