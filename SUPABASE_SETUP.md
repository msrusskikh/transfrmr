# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in your project details:
   - **Name**: Your project name (e.g., "transfrmr")
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project" and wait for it to be ready (2-3 minutes)

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** (gear icon in the left sidebar)
2. Click on **API** in the settings menu
3. You'll see two important values:
   - **Project URL** - This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Create .env.local File

Create a file named `.env.local` in the root directory of your project (same level as `package.json`).

**Important**: Make sure the file is named exactly `.env.local` (with the dot at the beginning)

Add the following content, replacing the placeholder values with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Example (DO NOT use these values, they're just examples):

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzIwMCwiZXhwIjoxOTU0NTQzMjAwfQ.example
```

## Step 4: Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** (left sidebar)
2. Click on **Providers**
3. Find **Email** in the list
4. Make sure it's **enabled** (toggle should be on)
5. Optionally configure email templates if needed

## Step 5: Restart Your Development Server

After creating/updating your `.env.local` file:

1. Stop your development server (Ctrl+C or Cmd+C)
2. Start it again:
   ```bash
   npm run dev
   ```

**Important**: Next.js only reads environment variables when the server starts, so you must restart after changing `.env.local`.

## Troubleshooting

### "Invalid API key" Error

This usually means:
1. **Missing .env.local file** - Make sure the file exists in the project root
2. **Wrong variable names** - Must be exactly `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Wrong values** - Double-check you copied the correct URL and anon key from Supabase
4. **Server not restarted** - Restart your dev server after creating/updating `.env.local`
5. **Using wrong key** - Make sure you're using the **anon public** key, not the service_role key

### How to Verify Your Setup

1. Check that `.env.local` exists in the project root
2. Verify the file contains both variables (no typos)
3. Make sure there are no spaces around the `=` sign
4. Ensure the URL starts with `https://` and ends with `.supabase.co`
5. The anon key should be a long JWT token (starts with `eyJ...`)

### Common Mistakes

- ❌ Using `.env` instead of `.env.local`
- ❌ Using `SUPABASE_URL` instead of `NEXT_PUBLIC_SUPABASE_URL`
- ❌ Using the service_role key instead of anon key
- ❌ Forgetting to restart the server
- ❌ Adding quotes around the values (don't do this)
- ❌ Having spaces: `URL = value` (should be `URL=value`)

### Correct Format

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Need Help?

If you're still having issues:
1. Check the browser console for error messages
2. Check your terminal for server errors
3. Verify your Supabase project is active (not paused)
4. Make sure Email authentication is enabled in Supabase

