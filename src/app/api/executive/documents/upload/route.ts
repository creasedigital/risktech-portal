import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { validateMagicBytes, MAX_FILE_SIZE_BYTES, type DocumentTypeKey } from '@/lib/validation/document.schema'
import { writeAuditLog } from '@/lib/audit'
import { Role, DocumentType } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    assertRolePermission(session, 'SUBMIT_ONBOARDING')

    const executive = await prisma.executive.findUnique({
      where: { userId: session!.id },
    })

    if (!executive) {
      return NextResponse.json({ error: 'Executive profile not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const docType = (formData.get('type') as DocumentTypeKey) || 'OTHER'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'File size exceeds maximum limit of 10MB' }, { status: 413 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Magic-byte inspection
    const magicCheck = validateMagicBytes(buffer)
    if (!magicCheck.valid) {
      return NextResponse.json(
        { error: magicCheck.error || 'Invalid file binary signature. Spoofed MIME types are rejected.' },
        { status: 415 }
      )
    }

    // SHA-256 checksum computation
    const sha256 = crypto.createHash('sha256').update(buffer).digest('hex')

    // Create private storage directory
    const uploadDir = path.join(process.cwd(), 'uploads', executive.id)
    await fs.mkdir(uploadDir, { recursive: true })

    const ext = magicCheck.detectedMime === 'application/pdf' ? '.pdf' : magicCheck.detectedMime === 'image/png' ? '.png' : '.jpg'
    const storageFilename = `${crypto.randomUUID()}${ext}`
    const storagePath = path.join(uploadDir, storageFilename)

    // Write file to non-public server filesystem
    await fs.writeFile(storagePath, buffer)

    // Save Prisma record
    const documentRecord = await prisma.document.create({
      data: {
        executiveId: executive.id,
        type: docType as DocumentType,
        originalName: file.name,
        storagePath: `/uploads/${executive.id}/${storageFilename}`,
        mimeType: magicCheck.detectedMime!,
        sizeBytes: file.size,
        sha256,
        uploadedById: session!.id,
      },
    })

    // Write audit log
    await writeAuditLog({
      actorId: session!.id,
      actorRole: session!.role as Role,
      action: 'DOCUMENT_UPLOAD',
      targetType: 'Document',
      targetId: documentRecord.id,
      metadataDiff: {
        filename: file.name,
        type: docType,
        sizeBytes: file.size,
        sha256,
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        id: documentRecord.id,
        originalName: documentRecord.originalName,
        type: documentRecord.type,
        sizeBytes: documentRecord.sizeBytes,
        sha256: documentRecord.sha256,
      },
    })
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'File upload failed' },
      { status: error.statusCode || 500 }
    )
  }
}
