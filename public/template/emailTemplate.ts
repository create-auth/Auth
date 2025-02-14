function EmailTemplate(code: string, date: Date) {
    return `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #4CAF50; text-align: center;">Login Verification Code</h2>
            <p style="font-size: 16px; color: #333;">Hello,</p>
            <p style="font-size: 16px; color: #333;">
              Your verification code is:
            </p>
            <div style="text-align: center; margin: 20px 0;">
              <span style="display: inline-block; padding: 10px 20px; background: #f0f0f0; border-radius: 5px; font-size: 24px; color: #000; font-weight: bold;">
                ${code}
              </span>
            </div>
            <p style="font-size: 16px; color: #333;">
              This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.
            </p>
            <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">
              &copy; ${date} Auth. All rights reserved.
            </p>
          </div>
        `
}
export default EmailTemplate;