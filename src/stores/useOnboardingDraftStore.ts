import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface OnboardingDraftState {
  currentStep: number
  completedSteps: number[]
  stepData: {
    consent?: {
      dataProcessConsent: boolean
      marketingConsent: boolean
      consentVersion: string
    }
    profile?: {
      fullName: string
      phone: string
      nationality: string
      currentTitle: string
      currentOrg: string
    }
    boardExperience?: {
      boardPositions: Array<{
        organisation: string
        role: string
        startYear: number
        endYear?: number
        isCurrentRole: boolean
      }>
    }
    sectorAndQualifications?: {
      sectors: string[]
      qualifications: Array<{
        institution: string
        credential: string
        year: number
      }>
    }
    referees?: {
      referees: Array<{
        name: string
        email: string
        phone: string
        relationship: string
        organisation: string
      }>
    }
    documents?: {
      cvUploaded?: boolean
      idUploaded?: boolean
    }
  }
  idempotencyKeys: Record<number, string>

  setCurrentStep: (step: number) => void
  setStepData: <K extends keyof OnboardingDraftState['stepData']>(stepKey: K, data: OnboardingDraftState['stepData'][K]) => void
  markStepComplete: (step: number) => void
  resetDraft: () => void
}

const initialState = {
  currentStep: 1,
  completedSteps: [] as number[],
  stepData: {},
  idempotencyKeys: {},
}

export const useOnboardingDraftStore = create<OnboardingDraftState>()(
  persist(
    (set) => ({
      ...initialState,
      setCurrentStep: (step) => set({ currentStep: step }),
      setStepData: (stepKey, data) =>
        set((state) => ({
          stepData: {
            ...state.stepData,
            [stepKey]: data,
          },
        })),
      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: Array.from(new Set([...state.completedSteps, step])),
        })),
      resetDraft: () => set(initialState),
    }),
    {
      name: 'risktech-onboarding-draft',
    }
  )
)
