#!/usr/bin/env node
/**
 * Script to load .env and update PM2 ecosystem config with actual values
 * Run this before starting PM2: node setup-pm2-env.js
 */

const fs = require('fs');
const path = require('path');

// Read .env file (or .env.local as fallback)
const envPath = path.join(__dirname, '.env');
const envLocalPath = path.join(__dirname, '.env.local');
const envFile = fs.existsSync(envPath) ? envPath : (fs.existsSync(envLocalPath) ? envLocalPath : null);
let envVars = {};

if (envFile) {
  const envContent = fs.readFileSync(envFile, 'utf8');
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Remove quotes if present
        envVars[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
  });
}

// Default values
const defaults = {
  NODE_ENV: 'production',
  SMTP_HOST: 'smtp.go2.unisender.ru',
  SMTP_PORT: '587',
  SMTP_SECURE: 'false',
  SMTP_FROM: 'noreply@transfrmr.ru',
  NEXT_PUBLIC_APP_URL: 'https://transfrmr.ru',
};

// Merge defaults with env vars
const config = { ...defaults, ...envVars };

// Generate ecosystem config
const ecosystemConfig = `module.exports = {
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
      NODE_ENV: '${config.NODE_ENV}',
      DATABASE_URL: '${config.DATABASE_URL || ''}',
      JWT_SECRET: '${config.JWT_SECRET || ''}',
      SMTP_HOST: '${config.SMTP_HOST}',
      SMTP_PORT: '${config.SMTP_PORT}',
      SMTP_SECURE: '${config.SMTP_SECURE}',
      SMTP_USER: '${config.SMTP_USER || ''}',
      SMTP_PASSWORD: '${config.SMTP_PASSWORD || ''}',
      SMTP_FROM: '${config.SMTP_FROM}',
      NEXT_PUBLIC_APP_URL: '${config.NEXT_PUBLIC_APP_URL}',
      OPENAI_API_KEY: '${config.OPENAI_API_KEY || ''}',
      PAYMENT_MERCHANT_ID: '${config.PAYMENT_MERCHANT_ID || ''}',
      PAYMENT_API_KEY: '${config.PAYMENT_API_KEY || ''}',
    },
    error_file: '/root/.pm2/logs/transfrmr-error.log',
    out_file: '/root/.pm2/logs/transfrmr-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }]
}
`;

// Write ecosystem config
fs.writeFileSync(path.join(__dirname, 'ecosystem.config.js'), ecosystemConfig);

if (envFile) {
  console.log(`✅ PM2 ecosystem config generated from ${path.basename(envFile)}`);
} else {
  console.log('⚠️  No .env or .env.local file found. Using defaults.');
}
console.log('📝 Review ecosystem.config.js and then run: pm2 start ecosystem.config.js');
