import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import type { NextRequest } from 'next/server';

interface RequestBody {
  to: string[];
  subject: string;
  text: string;
  senderEmail: string; // Added
  appPassword: string;  // Added
  html?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RequestBody;
    const { to, subject, text, senderEmail, appPassword, html } = body;

    if (!to || to.length === 0 || !subject || !text || !senderEmail || !appPassword) {
      return NextResponse.json({ success: false, message: 'Missing required fields: to, subject, text, senderEmail, or appPassword.' }, { status: 400 });
    }

    // Basic email validation for senderEmail
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
        return NextResponse.json({ success: false, message: 'Invalid sender email format.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === 'true', // false for port 587 (STARTTLS)
      auth: {
        user: senderEmail,    // Use user-provided senderEmail
        pass: appPassword,    // Use user-provided appPassword
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const mailOptions = {
      from: senderEmail, // Use sender's email as the from address
      to: to.join(','),
      subject: subject,
      text: text,
      html: html || `<p>${text.replace(/\n/g, '<br>')}</p>`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return NextResponse.json({ 
        success: true, 
        message: 'Emails processed by server.',
        accepted: info.accepted || [],
        rejected: info.rejected || [],
        pending: info.pending || []
      }, { status: 200 });

    } catch (mailError: any) {
      console.error('Nodemailer sendMail error:', mailError);
      const errorMessage = mailError.response || mailError.message || 'Failed to send email(s).';
      // Check for common authentication failure (often code 535 or similar)
      if (mailError.code === 'EAUTH' || (mailError.responseCode === 535)) {
        return NextResponse.json({
            success: false,
            message: 'Authentication failed. Please check your Gmail address and App Password. Ensure 2-Step Verification and App Password are set up correctly in your Google Account.',
            accepted: [],
            rejected: to,
            pending: []
        }, { status: 401 }); // Unauthorized
      }
      
      if (Array.isArray(mailError.errors) && mailError.errors.length > 0) {
        const rejected = mailError.errors.map((err: any) => err.recipient).filter(Boolean);
        return NextResponse.json({ 
          success: false, 
          message: `Some emails failed to send. ${errorMessage}`,
          accepted: mailError.accepted || [],
          rejected: rejected.length > 0 ? rejected : (mailError.rejected || []),
          pending: mailError.pending || []
        }, { status: 500 });
      }
      return NextResponse.json({ 
        success: false, 
        message: `Failed to send email(s). ${errorMessage}`,
        accepted: [],
        rejected: to, 
        pending: []
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('API sendEmail error:', error);
    return NextResponse.json({ success: false, message: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}

    