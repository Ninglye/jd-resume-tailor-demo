import { useMemo, useState } from "react";
import {
  analyzeJD,
  generateResume,
  matchExperiences,
  tailorExperiences,
} from "./ai/aiService";
import { demoExperiences, demoJobDescription } from "./data/demoData";
import {
  loadExperiences,
  loadGeneratedResumes,
  loadJobDescriptions,
  saveExperiences,
  saveGeneratedResumes,
  saveJobDescriptions,
} from "./data/storage";
import ExperiencesPage from "./pages/ExperiencesPage";
import JobInputPage from "./pages/JobInputPage";
import ResumePage from "./pages/ResumePage";
import type {
  AIWorkflowWarning,
  ExperienceMatch,
  GeneratedResume,
  JDAnalysis,
  JobDescription,
  TailoredExperience,
} from "./types";

type PageKey = "experiences" | "jd" | "resume";

type NavItem = {
  key: PageKey;
  label: string;
};

export type WorkflowResult = {
  job: JobDescription;
  analysis: JDAnalysis;
  matches: ExperienceMatch[];
  tailoredExperiences: TailoredExperience[];
  resume: GeneratedResume;
  warnings: AIWorkflowWarning[];
};

const navItems: NavItem[] = [
  { key: "experiences", label: "经历素材库" },
  { key: "jd", label: "JD 管理" },
  { key: "resume", label: "定制简历" },
];

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function refreshDemoJob(): JobDescription {
  return {
    ...demoJobDescription,
    createdAt: new Date().toISOString(),
  };
}

function upsertJob(jobs: JobDescription[], job: JobDescription) {
  return [job, ...jobs.filter((item) => item.id !== job.id)];
}

function resultFromResume(
  resume: GeneratedResume,
  jobs: JobDescription[],
): WorkflowResult | null {
  const job = jobs.find((item) => item.id === resume.jobId);

  if (!job) {
    return null;
  }

  return {
    job,
    analysis: resume.jdAnalysis,
    matches: resume.matchResults,
    tailoredExperiences: resume.tailoredExperiences ?? [],
    resume,
    warnings: [],
  };
}

function App() {
  const initialJobs = loadJobDescriptions();
  const initialResumes = loadGeneratedResumes();
  const [activePage, setActivePage] = useState<PageKey>("experiences");
  const [jobs, setJobs] = useState<JobDescription[]>(initialJobs);
  const [generatedResumes, setGeneratedResumes] =
    useState<GeneratedResume[]>(initialResumes);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    initialJobs[0]?.id ?? null,
  );
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | null>(
    () =>
      initialResumes[0] ? resultFromResume(initialResumes[0], initialJobs) : null,
  );
  const [demoDataVersion, setDemoDataVersion] = useState(0);

  const pageTitle = useMemo(
    () => navItems.find((item) => item.key === activePage)?.label,
    [activePage],
  );
  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;
  const latestResume = generatedResumes[0] ?? null;
  const latestResumeJob = latestResume
    ? jobs.find((job) => job.id === latestResume.jobId) ?? null
    : null;

  function persistJobs(nextJobs: JobDescription[]) {
    setJobs(nextJobs);
    saveJobDescriptions(nextJobs);
  }

  function persistGeneratedResumes(nextResumes: GeneratedResume[]) {
    setGeneratedResumes(nextResumes);
    saveGeneratedResumes(nextResumes);
  }

  async function generateForJob(job: JobDescription, nextJobs = jobs) {
    const experiences = loadExperiences();
    const warnings: AIWorkflowWarning[] = [];
    const analysisResult = await analyzeJD(job);
    const analysis = analysisResult.data;
    const matchResult = await matchExperiences(analysis, experiences);
    const matches = matchResult.data;
    const tailorResult = await tailorExperiences(analysis, matches, experiences);
    const tailored = tailorResult.data;
    const resumeResult = await generateResume(job, analysis, experiences, tailored);
    const resumeContent = resumeResult.data;

    if (analysisResult.warning) {
      warnings.push(analysisResult.warning);
    }

    if (resumeResult.warning) {
      warnings.push(resumeResult.warning);
    }

    const resume: GeneratedResume = {
      id: createId(),
      jobId: job.id,
      selectedExperienceIds: matches.map((match) => match.experienceId),
      jdAnalysis: analysis,
      matchResults: matches,
      tailoredExperiences: tailored,
      resumeContent,
      createdAt: new Date().toISOString(),
    };
    const result = {
      job,
      analysis,
      matches,
      tailoredExperiences: tailored,
      resume,
      warnings,
    };

    setWorkflowResult(result);
    setSelectedJobId(job.id);
    persistGeneratedResumes([resume, ...generatedResumes]);
    saveJobDescriptions(nextJobs);
    setActivePage("jd");
  }

  async function handleJobSubmitted(job: JobDescription) {
    const nextJobs = upsertJob(jobs, job);
    persistJobs(nextJobs);
    await generateForJob(job, nextJobs);
  }

  function handleJobSelected(job: JobDescription) {
    const latestForJob = generatedResumes.find((resume) => resume.jobId === job.id);
    setSelectedJobId(job.id);
    setWorkflowResult(
      latestForJob
        ? {
            job,
            analysis: latestForJob.jdAnalysis,
            matches: latestForJob.matchResults,
            tailoredExperiences: latestForJob.tailoredExperiences ?? [],
            resume: latestForJob,
            warnings: [],
          }
        : null,
    );
  }

  function handleJobDeleted(jobId: string) {
    const nextJobs = jobs.filter((job) => job.id !== jobId);
    const nextResumes = generatedResumes.filter(
      (resume) => resume.jobId !== jobId,
    );

    persistJobs(nextJobs);
    persistGeneratedResumes(nextResumes);

    if (selectedJobId === jobId) {
      const nextSelectedJob = nextJobs[0] ?? null;
      const nextSelectedResume = nextSelectedJob
        ? nextResumes.find((resume) => resume.jobId === nextSelectedJob.id)
        : null;

      setSelectedJobId(nextSelectedJob?.id ?? null);
      setWorkflowResult(
        nextSelectedResume && nextSelectedJob
          ? {
              job: nextSelectedJob,
              analysis: nextSelectedResume.jdAnalysis,
              matches: nextSelectedResume.matchResults,
              tailoredExperiences: nextSelectedResume.tailoredExperiences ?? [],
              resume: nextSelectedResume,
              warnings: [],
            }
          : null,
      );
    }
  }

  function loadDemoExperiences() {
    saveExperiences(demoExperiences);
    setDemoDataVersion((version) => version + 1);
    setActivePage("experiences");
  }

  function loadDemoJD() {
    const job = refreshDemoJob();
    const nextJobs = upsertJob(jobs, job);

    persistJobs(nextJobs);
    setSelectedJobId(job.id);
    setWorkflowResult(null);
    setActivePage("jd");
  }

  async function generateDemoResume() {
    const job = refreshDemoJob();
    const nextJobs = upsertJob(jobs, job);

    saveExperiences(demoExperiences);
    setDemoDataVersion((version) => version + 1);
    persistJobs(nextJobs);
    await generateForJob(job, nextJobs);
    setActivePage("resume");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="主导航">
        <div className="brand">
          <span className="brand-mark">JD</span>
          <div>
            <strong>简历定制</strong>
            <span>公开演示工作台</span>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={item.key === activePage ? "active" : ""}
              onClick={() => setActivePage(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <section className="demo-banner">
          <div>
            <p className="eyebrow">Public Demo</p>
            <h2>当前为公开演示模式，AI 结果使用 mock workflow；本地私有版本支持 DeepSeek API。</h2>
          </div>
          <div className="demo-actions">
            <button className="secondary-button" type="button" onClick={loadDemoExperiences}>
              一键加载示例经历
            </button>
            <button className="secondary-button" type="button" onClick={loadDemoJD}>
              一键加载示例 JD
            </button>
            <button className="primary-button" type="button" onClick={generateDemoResume}>
              一键生成 mock 简历结果
            </button>
          </div>
        </section>

        <header className="page-header">
          <div>
            <p className="eyebrow">Mock Mode</p>
            <h1>{pageTitle}</h1>
          </div>
        </header>

        {activePage === "experiences" && (
          <ExperiencesPage key={demoDataVersion} />
        )}
        {activePage === "jd" && (
          <JobInputPage
            jobs={jobs}
            selectedJob={selectedJob}
            workflowResult={workflowResult}
            onJobSubmitted={handleJobSubmitted}
            onJobSelected={handleJobSelected}
            onJobDeleted={handleJobDeleted}
            onRegenerateJob={generateForJob}
            onOpenResume={() => setActivePage("resume")}
          />
        )}
        {activePage === "resume" && (
          <ResumePage
            job={latestResumeJob}
            resume={latestResume}
            onGoToExperiences={() => setActivePage("experiences")}
            onGoToJobs={() => setActivePage("jd")}
          />
        )}
      </main>
    </div>
  );
}

export default App;
