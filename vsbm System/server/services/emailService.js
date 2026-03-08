const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP email using Resend with premium branded template
 */
const sendOTPEmail = async (email, otp, userName) => {
    const { data, error } = await resend.emails.send({
        from: 'FastOnService <onboarding@resend.dev>',
        to: email,
        subject: `🔐 Your Login OTP: ${otp} — FastOnService`,
        html: `
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
                        <td style="padding: 36px 40px 20px; text-align: center; background: linear-gradient(135deg, #1e40af, #7c3aed, #2563eb);">
                            <table cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 auto;">
                                <tr>
                                    <td style="background: rgba(255,255,255,0.15); border-radius: 14px; padding: 12px 16px; display: inline-block;">
                                        <span style="font-size: 28px;">🚗</span>
                                    </td>
                                    <td style="padding-left: 14px;">
                                        <h1 style="margin:0; color:#ffffff; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                                            Fast<span style="color: #93c5fd;">On</span>Service
                                        </h1>
                                        <p style="margin: 2px 0 0; color: rgba(255,255,255,0.7); font-size: 11px; letter-spacing: 2px; text-transform: uppercase;">
                                            Vehicle Service Booking
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
</html>`
    });

    if (error) {
        console.error('❌ Resend email error:', error);
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }

    console.log(`✅ OTP email sent to ${email} (ID: ${data?.id})`);
    return data;
};

module.exports = { sendOTPEmail };
