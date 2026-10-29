export const ROLES = ['EXECUTIVE', 'CONSULTANT', 'ADMINISTRATOR'] as const
export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  EXECUTIVE: 'Senior Executive Candidate',
  CONSULTANT: 'Governance Recruitment Consultant',
  ADMINISTRATOR: 'Platform GRC Administrator',
}

export const SYNTHETIC_PERSONAS: Record<Role, { name: string; email: string; role: Role; title: string }> = {
  EXECUTIVE: {
    name: 'Alice Folashade Okafor',
    email: 'alice.okafor@synthetic-risktech.internal',
    role: 'EXECUTIVE',
    title: 'Chief Risk Officer & Board Advisor',
  },
  CONSULTANT: {
    name: 'Ben Adeyemi',
    email: 'ben.adeyemi@synthetic-risktech.internal',
    role: 'CONSULTANT',
    title: 'Senior Vetting & Search Consultant',
  },
  ADMINISTRATOR: {
    name: 'Carol Mensah',
    email: 'carol.mensah@synthetic-risktech.internal',
    role: 'ADMINISTRATOR',
    title: 'Lead GRC Compliance Officer',
  },
}
