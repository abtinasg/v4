// Email Templates for Deep Terminal

export const emailStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #0a0a0a; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: linear-gradient(135deg, #111827 0%, #1f2937 100%); border-radius: 16px; padding: 40px; border: 1px solid #374151; }
    .logo { font-size: 24px; font-weight: bold; color: #06b6d4; margin-bottom: 30px; }
    .title { font-size: 28px; font-weight: 600; color: #ffffff; margin-bottom: 16px; }
    .text { font-size: 16px; color: #9ca3af; line-height: 1.6; margin-bottom: 20px; }
    .highlight { color: #06b6d4; font-weight: 600; }
    .button { display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #374151; font-size: 12px; color: #6b7280; }
    .stat-box { background: #1f2937; border-radius: 8px; padding: 16px; margin: 10px 0; }
    .stat-label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .stat-value { font-size: 24px; color: #ffffff; font-weight: bold; }
  </style>
`

// Welcome Email
export function welcomeEmail(userName: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">🚀 Deep Terminal</div>
          <h1 class="title">Welcome to Deep Terminal, ${userName}!</h1>
          <p class="text">
            You've just joined the most powerful financial analysis platform. 
            Get ready to access real-time market data, AI-powered insights, and professional-grade tools.
          </p>
          <div class="stat-box">
            <div class="stat-label">Your Access Level</div>
            <div class="stat-value" style="color: #10b981;">Pro Trial - 14 Days</div>
          </div>
          <p class="text">Here's what you can do:</p>
          <ul class="text">
            <li>📊 Access real-time market data</li>
            <li>🤖 Use AI assistant for market analysis</li>
            <li>📈 Track unlimited watchlists</li>
            <li>💼 Professional Terminal Pro interface</li>
          </ul>
          <a href="https://deepterminal.io/dashboard" class="button">Go to Dashboard →</a>
          <div class="footer">
            <p>Need help? Reply to this email or visit our support center.</p>
            <p>© 2025 Deep Terminal. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Trial Ending Reminder
export function trialEndingEmail(userName: string, daysLeft: number): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">⏰ Deep Terminal</div>
          <h1 class="title">Your trial ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}</h1>
          <p class="text">
            Hey ${userName}, your Pro trial is almost over. Don't lose access to:
          </p>
          <ul class="text">
            <li>Real-time market data feeds</li>
            <li>AI-powered analysis</li>
            <li>Terminal Pro interface</li>
            <li>Unlimited watchlists</li>
          </ul>
          <div class="stat-box">
            <div class="stat-label">Special Offer</div>
            <div class="stat-value" style="color: #f59e0b;">20% OFF</div>
            <p style="color: #9ca3af; font-size: 14px; margin: 8px 0 0 0;">Use code: EARLY20</p>
          </div>
          <a href="https://deepterminal.io/pricing" class="button">Upgrade Now →</a>
          <div class="footer">
            <p>Questions? We're here to help.</p>
            <p>© 2025 Deep Terminal. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Payment Receipt
export function paymentReceiptEmail(
  userName: string, 
  amount: string, 
  plan: string, 
  invoiceId: string,
  date: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">✅ Deep Terminal</div>
          <h1 class="title">Payment Confirmed</h1>
          <p class="text">Thank you for your payment, ${userName}!</p>
          <div class="stat-box">
            <div class="stat-label">Amount Paid</div>
            <div class="stat-value" style="color: #10b981;">${amount}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Plan</div>
            <div class="stat-value">${plan}</div>
          </div>
          <p class="text" style="font-size: 14px;">
            <strong>Invoice ID:</strong> ${invoiceId}<br>
            <strong>Date:</strong> ${date}
          </p>
          <a href="https://deepterminal.io/dashboard" class="button">Go to Dashboard →</a>
          <div class="footer">
            <p>This receipt was sent to your registered email.</p>
            <p>© 2025 Deep Terminal. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Password Reset
export function passwordResetEmail(resetLink: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">🔐 Deep Terminal</div>
          <h1 class="title">Reset Your Password</h1>
          <p class="text">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
          <a href="${resetLink}" class="button">Reset Password →</a>
          <p class="text" style="font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
          <div class="footer">
            <p>For security, this request was received from your account.</p>
            <p>© 2025 Deep Terminal. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Alert Notification
export function alertNotificationEmail(
  userName: string,
  alertType: string,
  symbol: string,
  condition: string,
  currentValue: string
): string {
  const isPositive = alertType === 'price_above' || alertType === 'gain'
  return `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">🔔 Deep Terminal Alert</div>
          <h1 class="title">Price Alert Triggered!</h1>
          <p class="text">Hey ${userName}, your alert for <span class="highlight">${symbol}</span> has been triggered.</p>
          <div class="stat-box">
            <div class="stat-label">${symbol}</div>
            <div class="stat-value" style="color: ${isPositive ? '#10b981' : '#ef4444'};">${currentValue}</div>
            <p style="color: #9ca3af; font-size: 14px; margin: 8px 0 0 0;">${condition}</p>
          </div>
          <a href="https://deepterminal.io/dashboard/stock-analysis?symbol=${symbol}" class="button">View ${symbol} →</a>
          <div class="footer">
            <p>Manage your alerts in the dashboard.</p>
            <p>© 2025 Deep Terminal. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}

// Terminal Pro Visit Notification
export function terminalProVisitEmail(
  userName: string, 
  userEmail: string, 
  visitTime: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="card">
          <div class="logo">bos be mehdi Deep Terminal</div>
          <h1 class="title">Terminal Pro Access</h1>
          <p class="text">A user accessed Terminal Pro:</p>
          <div class="stat-box">
            <div class="stat-label">User</div>
            <div class="stat-value" style="font-size: 18px;">${userName}</div>
            <p style="color: #9ca3af; font-size: 14px; margin: 8px 0 0 0;">${userEmail}</p>
          </div>
          <div class="stat-box">
            <div class="stat-label">Access Time</div>
            <div class="stat-value" style="font-size: 16px; color: #06b6d4;">${visitTime}</div>
          </div>
          <div class="footer">
            <p>This is an automated notification.</p>
            <p>© 2025 Deep Terminal. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
