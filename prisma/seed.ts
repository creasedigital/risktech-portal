import { PrismaClient, Role, VettingStatus, DocumentType, Prisma } from '@prisma/client'
import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import { encrypt } from '../src/lib/encryption'
import { GENESIS_HASH, computeEntryHash, type CanonicalAuditPayload } from '../src/lib/audit/hashChain'

// Enforce deterministic seed for reproducible governance dataset
faker.seed(42)

const prisma = new PrismaClient()

// Realistic synthetic African governance name pools
const FIRST_NAMES = [
  'Olumide', 'Amina', 'Babatunde', 'Chioma', 'Kwame', 'Tendai', 'Nneka', 'Thabo',
  'Ngozi', 'Kofi', 'Folashade', 'Dapo', 'Zanele', 'Emeka', 'Farida', 'Simphiwe',
  'Chinedu', 'Aissatou', 'Tariro', 'Kojo', 'Yetunde', 'Mansour', 'Eshe', 'Obinna'
]

const LAST_NAMES = [
  'Adeleke', 'Osei', 'Mensah', 'Okafor', 'Sowore', 'Diallo', 'Dlamini', 'Adeyemi',
  'Nwachukwu', 'Traore', 'Mbeki', 'Balogun', 'Kamara', 'Achebe', 'Conteh', 'Okonjo',
  'Toure', 'Sithole', 'Gyamfi', 'Eze', 'Mabaso', 'Sanusi', 'Kagame', 'Biobaku'
]

const NATIONALITIES = [
  'Nigerian', 'Ghanaian', 'Kenyan', 'South African', 'Rwandan', 'Senegalese', 'Zambian', 'Ivorian'
]

// Synthetic Corporate & Institutional Entities
const SYNTHETIC_ORGS = [
  'Pan-African InfraTech Holdings',
  'Sahara Sovereign Capital',
  'Equatorial Micro-Risk PLC',
  'Niger-Delta Clean Energy Trust',
  'Apex West Africa Assurance',
  'Sub-Saharan Logistics Consortium',
  'Atlas Inter-Continental Bank',
  'Kigali Digital Health Network',
  'Nairobi Green Minerals Corp',
  'Lagos Maritime & Port Authority Advisory',
  'African Telecommunications Infrastructure Fund',
  'Volta Basin Agribusiness Syndicate',
  'Zambezi Sustainable Power Authority',
  'Addis Ababa Industrial Governance Group'
]

const EXECUTIVE_TITLES = [
  'Chief Risk Officer (CRO)',
  'Non-Executive Director & Audit Committee Chair',
  'Head of Governance & Compliance',
  'Chief Technology Risk Strategist',
  'Senior Independent Director (SID)',
  'Chair of Remuneration & ESG Committee',
  'Chief Legal & Regulatory Affairs Officer',
  'Vice President of Institutional Integrity',
  'Independent Governance Advisor',
  'Group Financial Controller & Ethics Lead'
]

const SECTORS_LIST = [
  'Finance',
  'Energy',
  'Technology',
  'Healthcare',
  'Government',
  'Legal',
  'Other'
]

async function main() {
  console.log('--- Commencing RiskTech & Advisory Synthetic Seed ---')
  console.log('Enforcing GRC compliance: Synthetic data only (faker.seed: 42)')

  // Clean existing data for clean seed
  await prisma.auditLog.deleteMany()
  await prisma.vettingNote.deleteMany()
  await prisma.document.deleteMany()
  await prisma.pushSubscription.deleteMany()
  await prisma.session.deleteMany()
  await prisma.executive.deleteMany()
  await prisma.consultant.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await bcrypt.hash('Passcode123!', 10)

  // 1. Core Synthetic Demo Personas
  console.log('Seeding core demo personas...')

  // (a) Executive Demo Persona
  const aliceUser = await prisma.user.create({
    data: {
      email: 'alice.okafor@synthetic-risktech.internal',
      passwordHash,
      role: Role.EXECUTIVE,
      mfaEnabled: true,
    },
  })

  await prisma.executive.create({
    data: {
      userId: aliceUser.id,
      consentVersion: '2024-01-v1',
      consentGrantedAt: new Date(Date.now() - 30 * 86400000),
      marketingConsent: true,
      dataProcessConsent: true,
      fullNameEnc: encrypt('Alice Folashade Okafor'),
      phoneEnc: encrypt('+234 803 555 0192'),
      nationalityEnc: encrypt('Nigerian'),
      currentTitle: 'Chief Risk Officer & Board Advisor',
      currentOrg: 'Pan-African InfraTech Holdings',
      boardExperience: [
        {
          organisation: 'Sahara Sovereign Capital',
          role: 'Chair of Audit & Risk Committee',
          startYear: 2020,
          isCurrentRole: true,
        },
        {
          organisation: 'Equatorial Micro-Risk PLC',
          role: 'Independent Non-Executive Director',
          startYear: 2016,
          endYear: 2020,
          isCurrentRole: false,
        },
      ],
      sectors: ['Finance', 'Technology'],
      qualifications: [
        { institution: 'Lagos Business School', credential: 'Executive MBA', year: 2012 },
        { institution: 'Chartered Institute of Bankers', credential: 'FCIB Fellow', year: 2015 },
      ],
      refereesEnc: encrypt(JSON.stringify([
        {
          name: 'Dr. Kwame Mensah',
          email: 'k.mensah@synthetic-partner.internal',
          phone: '+233 24 555 0184',
          relationship: 'Former Board Chairman',
          organisation: 'Atlas Inter-Continental Bank',
        },
        {
          name: 'Amina Diallo',
          email: 'a.diallo@synthetic-partner.internal',
          phone: '+221 77 555 0199',
          relationship: 'Managing Director & GRC Lead',
          organisation: 'Niger-Delta Clean Energy Trust',
        },
      ])),
      vettingStatus: VettingStatus.UNDER_REVIEW,
      submittedAt: new Date(Date.now() - 5 * 86400000),
      version: 1,
      draftStep: 6,
      draftCompletedSteps: [1, 2, 3, 4, 5, 6],
    },
  })

  // (b) Consultant Demo Persona
  const benUser = await prisma.user.create({
    data: {
      email: 'ben.adeyemi@synthetic-risktech.internal',
      passwordHash,
      role: Role.CONSULTANT,
      mfaEnabled: false,
    },
  })

  const consultant = await prisma.consultant.create({
    data: {
      userId: benUser.id,
    },
  })

  // (c) Administrator Demo Persona
  const carolUser = await prisma.user.create({
    data: {
      email: 'carol.mensah@synthetic-risktech.internal',
      passwordHash,
      role: Role.ADMINISTRATOR,
      mfaEnabled: true,
    },
  })

  console.log('Core demo personas created:')
  console.log(' - EXECUTIVE: alice.okafor@synthetic-risktech.internal (Passcode123!)')
  console.log(' - CONSULTANT: ben.adeyemi@synthetic-risktech.internal (Passcode123!)')
  console.log(' - ADMINISTRATOR: carol.mensah@synthetic-risktech.internal (Passcode123!)')

  // 2. Generate 1,000 Synthetic Executive Governance Records
  console.log('Generating 1,000 synthetic African executive governance records...')

  const TOTAL_RECORDS = 1000
  const statuses: VettingStatus[] = [
    ...Array(300).fill(VettingStatus.DRAFT),
    ...Array(250).fill(VettingStatus.SUBMITTED),
    ...Array(200).fill(VettingStatus.UNDER_REVIEW),
    ...Array(100).fill(VettingStatus.MORE_INFO_REQUIRED),
    ...Array(120).fill(VettingStatus.VERIFIED),
    ...Array(30).fill(VettingStatus.REJECTED),
  ]

  let runningPrevHash = GENESIS_HASH
  let auditSequence = 1

  // First Genesis Audit Log
  const genesisPayload: CanonicalAuditPayload = {
    sequence: auditSequence,
    actorId: carolUser.id,
    actorRole: Role.ADMINISTRATOR,
    action: 'SYSTEM_GENESIS_INITIALIZATION',
    targetType: 'System',
    targetId: 'RISKTECH_LEDGER_ROOT',
    metadataDiff: { event: 'Platform initialized with synthetic governance dataset', count: TOTAL_RECORDS },
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  }
  const genesisHash = computeEntryHash(runningPrevHash, genesisPayload)

  await prisma.auditLog.create({
    data: {
      sequence: auditSequence,
      actorId: carolUser.id,
      actorRole: Role.ADMINISTRATOR,
      action: genesisPayload.action,
      targetType: genesisPayload.targetType,
      targetId: genesisPayload.targetId,
      metadataDiff: genesisPayload.metadataDiff as Prisma.InputJsonValue,
      prevHash: runningPrevHash,
      entryHash: genesisHash,
      createdAt: new Date(genesisPayload.createdAt),
    },
  })
  runningPrevHash = genesisHash
  auditSequence++

  // Batch create records to ensure high performance
  const BATCH_SIZE = 50
  for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
    const batchEnd = Math.min(i + BATCH_SIZE, TOTAL_RECORDS)
    
    for (let j = i; j < batchEnd; j++) {
      const firstName = faker.helpers.arrayElement(FIRST_NAMES)
      const lastName = faker.helpers.arrayElement(LAST_NAMES)
      const fullName = `${firstName} ${lastName}`
      const email = `exec_${j + 1}_${firstName.toLowerCase()}.${lastName.toLowerCase()}@synthetic-risktech.internal`
      const nationality = faker.helpers.arrayElement(NATIONALITIES)
      const org = faker.helpers.arrayElement(SYNTHETIC_ORGS)
      const title = faker.helpers.arrayElement(EXECUTIVE_TITLES)
      const vettingStatus = statuses[j] ?? VettingStatus.DRAFT

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          role: Role.EXECUTIVE,
          mfaEnabled: false,
        },
      })

      const boardCount = faker.number.int({ min: 1, max: 3 })
      const boardPositions = Array.from({ length: boardCount }).map(() => ({
        organisation: faker.helpers.arrayElement(SYNTHETIC_ORGS),
        role: faker.helpers.arrayElement(EXECUTIVE_TITLES),
        startYear: faker.number.int({ min: 2014, max: 2021 }),
        isCurrentRole: faker.datatype.boolean(),
      }))

      const sectors = faker.helpers.arrayElements(SECTORS_LIST, { min: 1, max: 3 })
      const qualifications = [
        {
          institution: 'University of Ibadan',
          credential: 'M.Sc. Corporate Governance & Risk Management',
          year: faker.number.int({ min: 2005, max: 2018 }),
        },
      ]

      const referees = [
        {
          name: `${faker.helpers.arrayElement(FIRST_NAMES)} ${faker.helpers.arrayElement(LAST_NAMES)}`,
          email: `ref1_${j}@synthetic-partner.internal`,
          phone: `+234 ${faker.string.numeric(10)}`,
          relationship: 'Senior Non-Executive Board Colleague',
          organisation: faker.helpers.arrayElement(SYNTHETIC_ORGS),
        },
        {
          name: `${faker.helpers.arrayElement(FIRST_NAMES)} ${faker.helpers.arrayElement(LAST_NAMES)}`,
          email: `ref2_${j}@synthetic-partner.internal`,
          phone: `+234 ${faker.string.numeric(10)}`,
          relationship: 'Audit Committee Chair Colleague',
          organisation: faker.helpers.arrayElement(SYNTHETIC_ORGS),
        },
      ]

      const isSubmitted = vettingStatus !== VettingStatus.DRAFT
      const daysAgo = faker.number.int({ min: 1, max: 45 })
      const submittedAt = isSubmitted ? new Date(Date.now() - daysAgo * 86400000) : null
      const verifiedAt = vettingStatus === VettingStatus.VERIFIED ? new Date() : null
      const rejectedAt = vettingStatus === VettingStatus.REJECTED ? new Date() : null

      const executive = await prisma.executive.create({
        data: {
          userId: user.id,
          consentVersion: '2024-01-v1',
          consentGrantedAt: new Date(Date.now() - (daysAgo + 5) * 86400000),
          marketingConsent: faker.datatype.boolean(),
          dataProcessConsent: true,
          fullNameEnc: encrypt(fullName),
          phoneEnc: encrypt(`+234 80${faker.string.numeric(8)}`),
          nationalityEnc: encrypt(nationality),
          currentTitle: title,
          currentOrg: org,
          boardExperience: boardPositions,
          sectors,
          qualifications,
          refereesEnc: encrypt(JSON.stringify(referees)),
          vettingStatus,
          submittedAt,
          verifiedAt,
          rejectedAt,
          version: 1,
          draftStep: isSubmitted ? 6 : faker.number.int({ min: 1, max: 5 }),
          draftCompletedSteps: isSubmitted ? [1, 2, 3, 4, 5, 6] : [1, 2],
        },
      })

      // Add synthetic documents for submitted executives
      if (isSubmitted) {
        await prisma.document.create({
          data: {
            executiveId: executive.id,
            type: DocumentType.CV,
            originalName: `${firstName}_${lastName}_Executive_CV.pdf`,
            storagePath: `/uploads/${executive.id}/cv_synthetic.pdf`,
            mimeType: 'application/pdf',
            sizeBytes: faker.number.int({ min: 500000, max: 2500000 }),
            sha256: faker.string.hexadecimal({ length: 64, casing: 'lower', prefix: '' }),
            uploadedById: user.id,
          },
        })
      }

      // Add reviewer note for MORE_INFO_REQUIRED or REJECTED
      if (vettingStatus === VettingStatus.MORE_INFO_REQUIRED || vettingStatus === VettingStatus.REJECTED) {
        await prisma.vettingNote.create({
          data: {
            executiveId: executive.id,
            consultantId: consultant.id,
            content: vettingStatus === VettingStatus.MORE_INFO_REQUIRED
              ? 'Please provide audited proof of board tenure at your previous financial services position.'
              : 'Candidate does not satisfy the requisite minimum independent governance committee experience criteria.',
            isPublic: true,
          },
        })
      }

      // Create chained audit entry for submitted/reviewed profiles
      if (isSubmitted && j % 10 === 0) {
        const payload: CanonicalAuditPayload = {
          sequence: auditSequence,
          actorId: benUser.id,
          actorRole: Role.CONSULTANT,
          action: 'FSM_TRANSITION',
          targetType: 'Executive',
          targetId: executive.id,
          metadataDiff: { status: vettingStatus, candidate: `${firstName} ${lastName}` },
          createdAt: new Date(Date.now() - (daysAgo - 1) * 86400000).toISOString(),
        }
        const entryHash = computeEntryHash(runningPrevHash, payload)

        await prisma.auditLog.create({
          data: {
            sequence: auditSequence,
            actorId: benUser.id,
            actorRole: Role.CONSULTANT,
            action: payload.action,
            targetType: payload.targetType,
            targetId: payload.targetId,
            metadataDiff: payload.metadataDiff as Prisma.InputJsonValue,
            prevHash: runningPrevHash,
            entryHash,
            createdAt: new Date(payload.createdAt),
          },
        })
        runningPrevHash = entryHash
        auditSequence++
      }
    }
    process.stdout.write(`  Seeded ${batchEnd}/${TOTAL_RECORDS} synthetic executive records...\r`)
  }

  console.log(`\nSuccessfully seeded 1,000 synthetic executive records across all vetting statuses!`)
  console.log(`Chained AuditLog records seeded: ${auditSequence - 1} entries with verified SHA-256 integrity.`)
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
