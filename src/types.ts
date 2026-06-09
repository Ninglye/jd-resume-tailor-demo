export type Experience = {
  id: string;
  title: string;
  type: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  keywords: string[];
  rawDescription: string;
  achievements: string[];
};

export type JobDescription = {
  id: string;
  company: string;
  role: string;
  jdText: string;
  targetDirection: string;
  createdAt: string;
};

export type JDAnalysis = {
  targetDirection: string;
  coreResponsibilities: string[];
  hardSkills: string[];
  softSkills: string[];
  keywords: string[];
  candidateProfile: string;
};

export type ExperienceMatch = {
  experienceId: string;
  matchScore: number;
  matchReason: string;
  suggestedPositioning: string;
  suggestedKeywords: string[];
};

export type TailoredExperience = {
  experienceId: string;
  originalTitle: string;
  positioning: string;
  tailoredBullets: string[];
  jdKeywordsUsed: string[];
  authenticityNotes: string[];
  improvementSuggestions: string[];
};

export type ResumeBullet = {
  text: string;
  evidenceFromOriginalExperience: string;
  jdRelevance: string;
  confidence: "high" | "medium" | "low";
};

export type ResumeExperienceSection = {
  experienceId: string;
  title: string;
  bullets: ResumeBullet[];
};

export type ResumeContent = {
  resumeSummary: string;
  tailoredExperienceBullets: ResumeExperienceSection[];
  projectBullets: string[];
  skills: string[];
  keywordOptimizationSuggestions: string[];
};

export type GeneratedResume = {
  id: string;
  jobId: string;
  selectedExperienceIds: string[];
  jdAnalysis: JDAnalysis;
  matchResults: ExperienceMatch[];
  tailoredExperiences: TailoredExperience[];
  resumeContent: ResumeContent;
  createdAt: string;
};

export type AIWorkflowWarning = {
  step: "analyzeJD" | "generateResume";
  message: string;
};
