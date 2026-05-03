import nodemailer from 'nodemailer'
import { prisma } from './prisma'

interface SendMailOptions {
  to: string
  subject: string
  html: string
}

async function getSmtpSettings() {
  const settings = await prisma.siteSettings.findFirst()

  if (!settings) {
    throw new Error('Site settings not found. Please configure SMTP settings in admin panel.')
  }

  return {
    host: settings.smtpHost,
    port: settings.smtpPort,
    secure: settings.smtpPort === 465,
    user: settings.smtpUser,
    pass: settings.smtpPass,
    from: settings.smtpFromName ? `${settings.smtpFromName} <${settings.smtpFrom}>` : settings.smtpFrom,
  }
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
  const smtp = await getSmtpSettings()

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  })

  const info = await transporter.sendMail({
    from: smtp.from,
    to,
    subject,
    html,
  })

  return info
}
