import { z } from 'zod'

export const CONSENT_VERSION = '2024-01-v1'

// Step 1 — NDPA 2023 Explicit Consent
export const step1ConsentSchema = z.object({
  dataProcessConsent: z.literal(true, {
    message: 'You must affirmatively consent to personal data processing under NDPA 2023 to proceed.',
  }),
  marketingConsent: z.boolean().default(false),
  consentVersion: z.string().default(CONSENT_VERSION),
})

// Step 2 — Professional Profile (PII)
export const step2ProfileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  phone: z.string().min(7, 'Please enter a valid executive phone number'),
  nationality: z.string().min(2, 'Please specify your nationality'),
  currentTitle: z.string().min(2, 'Current title must be at least 2 characters'),
  currentOrg: z.string().min(2, 'Current organisation must be at least 2 characters'),
})

// Step 3 — Board Experience
export const boardPositionSchema = z.object({
  organisation: z.string().min(2, 'Organisation name required'),
  role: z.string().min(2, 'Board role required'),
  startYear: z.number().int().min(1960).max(new Date().getFullYear()),
  endYear: z.number().int().min(1960).max(new Date().getFullYear()).optional(),
  isCurrentRole: z.boolean().default(false),
})

export const step3BoardExperienceSchema = z.object({
  boardPositions: z.array(boardPositionSchema).min(1, 'Please record at least one current or previous board position'),
})

// Step 4 — Sector Expertise & Qualifications
export const SECTORS = [
  'Finance',
  'Energy',
  'Technology',
  'Healthcare',
  'Government',
  'Legal',
  'Other',
] as const

export const qualificationSchema = z.object({
  institution: z.string().min(2, 'Institution name required'),
  credential: z.string().min(2, 'Credential or degree title required'),
  year: z.number().int().min(1960).max(new Date().getFullYear()),
})

export const step4SectorSchema = z.object({
  sectors: z.array(z.enum(SECTORS)).min(1, 'Select at least one sector of expertise'),
  qualifications: z.array(qualificationSchema).min(1, 'Please record at least one academic or professional qualification'),
})

// Step 5 — Referees (PII)
export const refereeSchema = z.object({
  name: z.string().min(2, 'Referee full name required'),
  email: z.string().email('Please enter a valid institutional email address'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  relationship: z.string().min(2, 'Professional relationship required'),
  organisation: z.string().min(2, 'Organisation required'),
})

export const step5RefereesSchema = z.object({
  referees: z.array(refereeSchema).min(2, 'Please provide contact details for two institutional referees'),
})

// Full Application Validation
export const fullOnboardingSchema = z.object({
  consent: step1ConsentSchema,
  profile: step2ProfileSchema,
  boardExperience: step3BoardExperienceSchema,
  sectorAndQualifications: step4SectorSchema,
  referees: step5RefereesSchema,
})

export type Step1Consent = z.infer<typeof step1ConsentSchema>
export type Step2Profile = z.infer<typeof step2ProfileSchema>
export type Step3BoardExperience = z.infer<typeof step3BoardExperienceSchema>
export type Step4Sector = z.infer<typeof step4SectorSchema>
export type Step5Referees = z.infer<typeof step5RefereesSchema>
export type FullOnboardingData = z.infer<typeof fullOnboardingSchema>
