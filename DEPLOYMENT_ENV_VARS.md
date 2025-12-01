# XV Studio - Environment Variables Reference

This document lists all required environment variables for deploying XV Studio to Vercel (or any other platform).

## Required Environment Variables

### 1. Supabase Configuration (3 variables)

#### `NEXT_PUBLIC_SUPABASE_URL`
- **Type**: Client-side (publicly accessible)
- **Description**: Your Supabase project URL
- **Format**: `https://[project-id].supabase.co`
- **Where to find**: Supabase Dashboard → Project Settings → API → Project URL
- **Example**: `https://khvcsdzqqmudeuprgzjf.supabase.co`

#### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Type**: Client-side (publicly accessible)
- **Description**: Supabase anonymous/public API key
- **Format**: Long JWT token starting with `eyJ...`
- **Where to find**: Supabase Dashboard → Project Settings → API → Project API keys → anon/public
- **Security**: Safe to expose (has Row Level Security protection)

#### `SUPABASE_SERVICE_KEY`
- **Type**: Server-side only (NEVER expose to client)
- **Description**: Supabase service role key with admin privileges
- **Format**: Long JWT token starting with `eyJ...`
- **Where to find**: Supabase Dashboard → Project Settings → API → Project API keys → service_role
- **Security**: ⚠️ CRITICAL - Keep this secret! Has full database access

---

### 2. OpenAI API (1 variable)

#### `OPENAI_API_KEY`
- **Type**: Server-side only
- **Description**: OpenAI API key for GPT-4o-mini chat assistant
- **Format**: Starts with `sk-...`
- **Where to find**: https://platform.openai.com/api-keys
- **Cost**: Pay-per-use (~$0.002 per 1K tokens for GPT-4o-mini)
- **Security**: Keep secret - allows API usage on your account

---

### 3. n8n Webhook URLs (8 variables)

All webhook URLs must be **HTTPS** and publicly accessible. Since you're using n8n Cloud, these should be provided by your n8n workflows.

#### `N8N_WEBHOOK_URL_MARKETINGBILDER_PROMPT_ONLY`
- **Type**: Server-side only
- **Description**: Webhook for generating marketing images from text prompts only
- **Format**: `https://[your-n8n-instance].app.n8n.cloud/webhook/[webhook-id]`
- **Workflow**: Marketing images (prompt-only mode)

#### `N8N_WEBHOOK_URL_MARKETINGBILDER_WITH_IMAGES`
- **Type**: Server-side only
- **Description**: Webhook for generating marketing images with reference images
- **Workflow**: Marketing images (with uploaded reference images)

#### `N8N_WEBHOOK_URL_MARKETINGBILDER_EDIT_IMAGE`
- **Type**: Server-side only
- **Description**: Webhook for editing existing marketing images
- **Workflow**: Image editing/refinement

#### `N8N_WEBHOOK_URL_WEEKLY_SOCIAL_MEDIA_PACKAGE`
- **Type**: Server-side only
- **Description**: Webhook for generating weekly social media content packages
- **Workflow**: Social media package generation

#### `N8N_WEBHOOK_URL_PRODUCT_VIDEO`
- **Type**: Server-side only
- **Description**: Webhook for generating product/service videos
- **Workflow**: Product video creation
- **Note**: This process can take up to 8 minutes

#### `N8N_WEBHOOK_URL_PRODUCT_DATA`
- **Type**: Server-side only
- **Description**: Webhook for scraping and analyzing product data from URLs
- **Workflow**: Product data extraction

#### `N8N_WEBHOOK_IMAGES_TO_VIDEO_GENERATION`
- **Type**: Server-side only
- **Description**: Webhook for converting images to video
- **Workflow**: Image-to-video generation

#### `NEXT_PUBLIC_N8N_WEBHOOK_URL_BUSINESS_WEBSITE_DNA`
- **Type**: Client-side (publicly accessible)
- **Description**: Webhook for analyzing business website and creating business profile
- **Workflow**: Business DNA extraction from website
- **Note**: This is the ONLY n8n webhook that's client-side accessible

---

## How to Set Environment Variables in Vercel

### Step 1: Navigate to Environment Variables
1. Go to your Vercel project dashboard
2. Click on **Settings** tab
3. Select **Environment Variables** from the sidebar

### Step 2: Add Each Variable
For each variable listed above:
1. Click **"Add New"**
2. **Key**: Enter the variable name exactly as shown (case-sensitive)
3. **Value**: Paste your actual value (no quotes needed)
4. **Environments**: Select which environments need this variable:
   - ✅ **Production** (required for live site)
   - ✅ **Preview** (recommended for testing PRs/branches)
   - ☐ **Development** (optional, use .env.local for local dev)

### Step 3: Important Notes
- Variables starting with `NEXT_PUBLIC_` are accessible in the browser
- Other variables are server-side only (API routes)
- Changes to environment variables require a **redeploy** to take effect
- Never commit `.env` or `.env.local` files to Git

---

## Environment Variable Checklist

Before deploying, verify you have all 12 variables:

### Supabase (3)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_KEY`

### OpenAI (1)
- [ ] `OPENAI_API_KEY`

### n8n Webhooks (8)
- [ ] `N8N_WEBHOOK_URL_MARKETINGBILDER_PROMPT_ONLY`
- [ ] `N8N_WEBHOOK_URL_MARKETINGBILDER_WITH_IMAGES`
- [ ] `N8N_WEBHOOK_URL_MARKETINGBILDER_EDIT_IMAGE`
- [ ] `N8N_WEBHOOK_URL_WEEKLY_SOCIAL_MEDIA_PACKAGE`
- [ ] `N8N_WEBHOOK_URL_PRODUCT_VIDEO`
- [ ] `N8N_WEBHOOK_URL_PRODUCT_DATA`
- [ ] `N8N_WEBHOOK_IMAGES_TO_VIDEO_GENERATION`
- [ ] `NEXT_PUBLIC_N8N_WEBHOOK_URL_BUSINESS_WEBSITE_DNA`

**Total: 12 environment variables**

---

## Local Development Setup

For local development, create a `.env.local` file in the project root:

```bash
# Copy this template and fill in your values
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
OPENAI_API_KEY=
N8N_WEBHOOK_URL_MARKETINGBILDER_PROMPT_ONLY=
N8N_WEBHOOK_URL_MARKETINGBILDER_WITH_IMAGES=
N8N_WEBHOOK_URL_MARKETINGBILDER_EDIT_IMAGE=
N8N_WEBHOOK_URL_WEEKLY_SOCIAL_MEDIA_PACKAGE=
N8N_WEBHOOK_URL_PRODUCT_VIDEO=
N8N_WEBHOOK_URL_PRODUCT_DATA=
N8N_WEBHOOK_IMAGES_TO_VIDEO_GENERATION=
NEXT_PUBLIC_N8N_WEBHOOK_URL_BUSINESS_WEBSITE_DNA=
```

**Note**: `.env.local` is already in `.gitignore` and will not be committed.

---

## Troubleshooting

### "Environment variable is undefined"
- Check that variable name matches exactly (case-sensitive)
- Verify it's set for the correct environment (Production/Preview/Development)
- Redeploy after adding variables (changes don't apply to existing deployments)

### Client-side vs Server-side
- **Client-side** variables (`NEXT_PUBLIC_*`): Accessible in React components
- **Server-side** variables: Only accessible in API routes and Server Components
- Mixing these up will cause "undefined" errors

### Supabase Connection Fails
- Verify `NEXT_PUBLIC_SUPABASE_URL` format is correct
- Check that anon key and service key are from the same project
- Ensure RLS policies allow the operations you're performing

### Webhook Calls Fail
- Verify all webhook URLs are HTTPS (not HTTP)
- Check that n8n workflows are active (not paused)
- Test webhooks manually with curl or Postman
- Ensure n8n Cloud instance is accessible

---

## Security Best Practices

1. **Never commit secrets to Git**
   - Use `.env.local` for local development
   - Add `.env*` to `.gitignore` (already done)

2. **Rotate keys if exposed**
   - If you accidentally commit a secret, rotate it immediately in the service

3. **Use environment-specific keys**
   - Consider using different Supabase projects for development/production
   - Use different OpenAI API keys if needed

4. **Monitor usage**
   - Check OpenAI usage dashboard regularly
   - Monitor Supabase storage and database usage
   - Set up billing alerts

---

## Next Steps

After setting up environment variables:
1. ✅ Deploy to Vercel
2. ✅ Test all features work correctly
3. ✅ Set up custom domain
4. ✅ Configure monitoring and alerts
