/**
 * PM2 Ecosystem Configuration
 * 
 * IMPORTANT: Replace the placeholder values below with your actual values from .env.local
 * 
 * Option 1: Manually edit this file with your values
 * Option 2: Run `node setup-pm2-env.js` to auto-generate from .env.local
 */

module.exports = {
  apps: [{
    name: 'transfrmr',
    script: 'npm',
    args: 'start',
    cwd: '/root/apps/transfrmr',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      
      // Database - REQUIRED
      DATABASE_URL: 'REPLACE_WITH_YOUR_DATABASE_URL',
      
      // JWT Authentication - REQUIRED (must be at least 32 characters)
      JWT_SECRET: 'REPLACE_WITH_YOUR_JWT_SECRET',
      
      // SMTP Email Configuration (Unisender Go) - REQUIRED
      SMTP_HOST: 'smtp.go2.unisender.ru',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false', // 'true' for port 465, 'false' for port 587
      SMTP_USER: 'REPLACE_WITH_YOUR_SMTP_USERNAME',
      SMTP_PASSWORD: 'REPLACE_WITH_YOUR_SMTP_PASSWORD',
      SMTP_FROM: 'noreply@transfrmr.ru',
      
      // Application URL - REQUIRED
      NEXT_PUBLIC_APP_URL: 'https://transfrmr.ru',
      
      // OpenAI API (required for labs) - must be set here or via: node setup-pm2-env.js && pm2 restart
      OPENAI_API_KEY: '',
      
      // Payment API (optional - only if using payment features)
      PAYMENT_MERCHANT_ID: '',
      PAYMENT_API_KEY: '',
    },
    error_file: '/root/.pm2/logs/transfrmr-error.log',
    out_file: '/root/.pm2/logs/transfrmr-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }]
}
