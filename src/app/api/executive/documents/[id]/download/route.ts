import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import fs from 'fs'
import path from 'path'
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth/session'
import { assertRolePermission } from '@/lib/dal'
import { prisma } from '@/lib/db'
import { writeAuditLog } from '@/lib/audit'
import type { Role } from '@prisma/client'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    const session = token ? await verifySessionToken(token) : null

    // RBAC: Consultant or Administrator only
    assertRolePermission(session, 'DOWNLOAD_DOCUMENT')

    const doc = await prisma.document.findUnique({
      where: { id },
    })

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const fullFilePath = path.join(process.cwd(), doc.storagePath.replace(/^\//, ''))

    if (!fs.existsSync(fullFilePath)) {
      return NextResponse.json({ error: 'Physical document file missing on server' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(fullFilePath)

    // Log the download event in AuditLog
    await writeAuditLog({
      actorId: session!.id,
      actorRole: session!.role as Role,
      action: 'DOCUMENT_DOWNLOAD',
      targetType: 'Document',
      targetId: doc.id,
      metadataDiff: {
        documentName: doc.originalName,
        type: doc.type,
      },
    })

    const headers = new Headers()
    headers.set('Content-Type', doc.mimeType)
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.originalName)}"`)
    headers.set('X-File-Checksum', doc.sha256)

    return new Response(fileBuffer, {
      status: 200,
      headers,
    })
  } catch (err) {
    const error = err as { statusCode?: number; message?: string }
    return NextResponse.json(
      { error: error.message || 'Download failed' },
      { status: error.statusCode || 500 }
    )
  }
}
