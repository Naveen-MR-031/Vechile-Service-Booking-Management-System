/**
 * Email service using Brevo (Sendinblue) HTTP API.
 * Render free tier blocks SMTP ports (587/465), so we use HTTPS (port 443).
 * 
 * Required env var: BREVO_API_KEY (get from https://app.brevo.com/settings/keys/api)
 * Optional env var: EMAIL_FROM (sender email, default: fastonsevice@gmail.com)
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'fastonsevice@gmail.com';
const FROM_NAME = 'FastOnService';

console.log(`📧 Email service: Brevo HTTP API | From: ${FROM_EMAIL}`);
console.log(`📧 BREVO_API_KEY: ${process.env.BREVO_API_KEY ? 'SET (' + process.env.BREVO_API_KEY.length + ' chars)' : 'NOT SET'}`);

/**
 * Send OTP email via Brevo's HTTP API (uses HTTPS, no SMTP).
 */
const sendOTPEmail = async (email, otp, userName) => {
    if (!process.env.BREVO_API_KEY) {
        throw new Error('BREVO_API_KEY not configured. Get one free at https://app.brevo.com/settings/keys/api');
    }

    console.log(`📧 Sending OTP to ${email} via Brevo...`);

    const body = JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: [{ email }],
        subject: `Your FastOnService Code: ${otp}`,
        htmlContent: generateOTPTemplate(otp, userName),
        textContent: `Your FastOnService code is: ${otp}. Valid for 10 minutes.`,
    });

    const response = await fetch(BREVO_API_URL, {
        method: 'POST',
        headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body,
    });

    const data = await response.json();

    if (!response.ok) {
        console.error('❌ Brevo API error:', response.status, JSON.stringify(data));
        throw new Error(`Email failed: ${data.message || response.statusText}`);
    }

    console.log(`✅ OTP sent to ${email} (messageId: ${data.messageId})`);
    return { id: data.messageId };
};

function generateOTPTemplate(otp, userName) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FastOnService OTP</title>
</head>
<body style="margin:0; padding:0; background-color:#0a0e1a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 32px 16px;">
        <tr>
            <td align="center">
                <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="background: linear-gradient(145deg, #111827, #1e293b); border-radius: 20px; border: 1px solid #1e3a5f; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                    
                    <!-- Logo Header -->
                    <tr>
                        <td style="padding: 36px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);">
                            <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="text-align: center;">
                                        <h1 style="margin:0; color:#EF4444; font-size: 32px; font-weight: 900; letter-spacing: -1px; font-family: 'Segoe UI', Roboto, Arial, sans-serif;">
                                            Fast<span style="color: #93c5fd;">On</span><span style="color: #EF4444;">Service</span>
                                        </h1>
                                        <p style="margin: 6px 0 0; color: rgba(255,255,255,0.5); font-size: 11px; letter-spacing: 3px; text-transform: uppercase;">
                                            Vehicle Service Booking Platform
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 36px 40px 28px;">
                            <p style="color:#e2e8f0; font-size: 17px; margin: 0 0 6px; font-weight: 600;">
                                Hello${userName ? ', ' + userName : ''} 👋
                            </p>
                            <p style="color:#94a3b8; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">
                                Your identity has been verified. Use the one-time password below to complete your login. This code is valid for <strong style="color:#e2e8f0;">10 minutes</strong>.
                            </p>

                            <!-- OTP Box -->
                            <div style="background: linear-gradient(145deg, #0f172a, #1a2332); border: 2px solid #2563eb; border-radius: 16px; padding: 28px; text-align: center; margin: 0 0 28px; position: relative;">
                                <p style="margin: 0 0 12px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 3px; font-weight: 600;">Your OTP Code</p>
                                <div style="font-size: 40px; font-weight: 800; letter-spacing: 16px; color: #3b82f6; font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace; padding: 4px 0;">
                                    ${otp}
                                </div>
                            </div>

                            <!-- Security Notice -->
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; margin: 0 0 24px;">
                                <tr>
                                    <td style="padding: 14px 18px;">
                                        <p style="margin: 0; color: #fca5a5; font-size: 13px; line-height: 1.5;">
                                            🔒 <strong>Security Notice:</strong> Never share this OTP with anyone. FastOnService will never ask for your OTP via phone or chat.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #475569; font-size: 13px; margin: 0; line-height: 1.5;">
                                If you didn't attempt to log in, please secure your account by changing your password immediately.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 40px 28px; border-top: 1px solid #1e293b;">
                            <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                                <tr>
                                    <td style="text-align: center;">
                                        <p style="margin: 0 0 4px; color: #334155; font-size: 11px;">
                                            © ${new Date().getFullYear()} FastOnService — Vehicle Service Booking Platform
                                        </p>
                                        <p style="margin: 0; color: #1e293b; font-size: 10px;">
                                            This is an automated email. Please do not reply.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
}

module.exports = { sendOTPEmail };
