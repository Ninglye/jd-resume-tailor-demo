import type { Experience, GeneratedResume, JobDescription } from "../types";

const EXPERIENCE_STORAGE_KEY = "jd-resume-customizer:experiences";
const JOB_STORAGE_KEY = "jd-resume-customizer:job-descriptions";
const GENERATED_RESUME_STORAGE_KEY = "jd-resume-customizer:generated-resumes";

export function loadExperiences(): Experience[] {
  const savedExperiences = window.localStorage.getItem(EXPERIENCE_STORAGE_KEY);

  if (!savedExperiences) {
    return [];
  }

  try {
    const parsedExperiences = JSON.parse(savedExperiences);
    return Array.isArray(parsedExperiences) ? parsedExperiences : [];
  } catch {
    return [];
  }
}

export function saveExperiences(experiences: Experience[]) {
  window.localStorage.setItem(
    EXPERIENCE_STORAGE_KEY,
    JSON.stringify(experiences),
  );
}

export function loadJobDescriptions(): JobDescription[] {
  const savedJobs = window.localStorage.getItem(JOB_STORAGE_KEY);

  if (!savedJobs) {
    return [];
  }

  try {
    const parsedJobs = JSON.parse(savedJobs);
    return Array.isArray(parsedJobs) ? parsedJobs : [];
  } catch {
    return [];
  }
}

export function saveJobDescriptions(jobs: JobDescription[]) {
  window.localStorage.setItem(JOB_STORAGE_KEY, JSON.stringify(jobs));
}

export function loadGeneratedResumes(): GeneratedResume[] {
  const savedResumes = window.localStorage.getItem(GENERATED_RESUME_STORAGE_KEY);

  if (!savedResumes) {
    return [];
  }

  try {
    const parsedResumes = JSON.parse(savedResumes);
    return Array.isArray(parsedResumes) ? parsedResumes : [];
  } catch {
    return [];
  }
}

export function saveGeneratedResumes(resumes: GeneratedResume[]) {
  window.localStorage.setItem(
    GENERATED_RESUME_STORAGE_KEY,
    JSON.stringify(resumes),
  );
}
