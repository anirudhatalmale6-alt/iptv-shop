import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendMail } from '@/lib/mail'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, department, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    const settings = await prisma.siteSettings.findFirst()
    const adminEmail = settings?.smtpFrom || process.env.ADMIN_EMAIL

    if (!adminEmail) {
      return NextResponse.json(
        { error: 'Contact form is not configured' },
        { status: 500 }
      )
    }

    const siteName = settings?.siteName || 'IPTV Shop'

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Contact Form Message</h2>

        <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0;"><strong>From:</strong> ${name} (${email})</p>
          ${department ? `<p style="margin: 8px 0 0;"><strong>Department:</strong> ${department}</p>` : ''}
          <p style="margin: 8px 0 0;"><strong>Subject:</strong> ${subject || 'No subject'}</p>
        </div>

        <div style="padding: 16px; border: 1px solid #eee; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>

        <p style="color: #999; font-size: 12px;">Sent from the contact form on ${siteName}</p>
      </div>
    `

    const emailSubject = department
      ? `[${department}] ${subject || 'New Message'} - from ${name}`
      : `Contact Form: ${subject || 'New Message'} - from ${name}`

    await sendMail({
      to: adminEmail,
      subject: emailSubject,
      html: emailHtml,
    })

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    console.error('Error sending contact form:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
