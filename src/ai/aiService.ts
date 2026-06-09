import {
  mockAnalyzeJD,
  mockGenerateResume,
  mockMatchExperiences,
  mockTailorExperiences,
} from "./mockWorkflow";
import { analyzeJDPrompt, generateResumePrompt } from "./prompts";
import type {
  AIWorkflowWarning,
  Experience,
  ExperienceMatch,
  JDAnalysis,
  JobDescription,
  ResumeContent,
  TailoredExperience,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const mixedAIEnabled =
  Boolean(API_BASE_URL) && import.meta.env.VITE_USE_REAL_AI === "true";

export type AIServiceResult<T> = {
  data: T;
  warning?: AIWorkflowWarning;
  source: "real" | "mock" | "local";
};

export async function analyzeJD(
  job: JobDescription,
): Promise<AIServiceResult<JDAnalysis>> {
  if (!mixedAIEnabled) {
    return { data: mockAnalyzeJD(job), source: "mock" };
  }

  try {
    const data = await postJSON<JDAnalysis>(
      "/api/ai/analyze-jd",
      analyzeJDPrompt(job),
    );

    return { data, source: "real" };
  } catch (error) {
    return {
      data: mockAnalyzeJD(job),
      source: "mock",
      warning: {
        step: "analyzeJD",
        message: `真实 AI 分析 JD 失败，已 fallback 到 mock：${formatError(error)}`,
      },
    };
  }
}

export async function matchExperiences(
  analysis: JDAnalysis,
  experiences: Experience[],
): Promise<AIServiceResult<ExperienceMatch[]>> {
  return {
    data: mockMatchExperiences(analysis, experiences),
    source: "local",
  };
}

export async function tailorExperiences(
  analysis: JDAnalysis,
  matches: ExperienceMatch[],
  experiences: Experience[],
): Promise<AIServiceResult<TailoredExperience[]>> {
  return {
    data: mockTailorExperiences(analysis, matches, experiences),
    source: "local",
  };
}

export async function generateResume(
  job: JobDescription,
  analysis: JDAnalysis,
  originalExperiences: Experience[],
  tailoredExperiences: TailoredExperience[],
): Promise<AIServiceResult<ResumeContent>> {
  if (!mixedAIEnabled) {
    return {
      data: mockGenerateResume(
        job,
        analysis,
        originalExperiences,
        tailoredExperiences,
      ),
      source: "mock",
    };
  }

  try {
    const data = await postJSON<ResumeContent>(
      "/api/ai/generate-resume",
      generateResumePrompt(job, analysis, originalExperiences, tailoredExperiences),
    );

    return { data, source: "real" };
  } catch (error) {
    return {
      data: mockGenerateResume(
        job,
        analysis,
        originalExperiences,
        tailoredExperiences,
      ),
      source: "mock",
      warning: {
        step: "generateResume",
        message: `真实 AI 生成简历失败，已 fallback 到 mock：${formatError(error)}`,
      },
    };
  }
}

async function postJSON<T>(path: string, prompt: string): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error("VITE_API_BASE_URL is not configured.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMessage =
      payload?.error ||
      `AI proxy request failed with status ${response.status}.`;
    const rawText = payload?.rawText ? ` Raw: ${payload.rawText}` : "";
    throw new Error(`${errorMessage}${rawText}`);
  }

  return payload as T;
}

function formatError(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}
