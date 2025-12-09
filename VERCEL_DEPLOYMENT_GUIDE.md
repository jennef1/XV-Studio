# XV Studio - Vercel Deployment Guide

Complete step-by-step guide for deploying XV Studio to Vercel.

---

## Prerequisites

Before you begin, ensure you have:
- [ ] GitHub account with access to the XV-Studio repository
- [ ] All 12 environment variables ready (see `DEPLOYMENT_ENV_VARS.md`)
- [ ] Supabase project set up and accessible
- [ ] OpenAI API key with available credits
- [ ] n8n Cloud workflows with webhook URLs
- [ ] Custom domain (if using one)

---

## Part 1: Create Vercel Account & Import Project

### Step 1.1: Sign Up for Vercel

1. Go to https://vercel.com
2. Click **"Sign Up"** in the top right
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. Complete the signup process

**Time: 2-3 minutes**

---

### Step 1.2: Import Your Repository

1. From the Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"XV-Studio"** in the list
4. Click **"Import"** next to it

**If you don't see the repository:**
- Click **"Adjust GitHub App Permissions"**
- Grant Vercel access to the repository
- Return to the import page

**Time: 1-2 minutes**

---

### Step 1.3: Configure Project Settings

Vercel will auto-detect your Next.js configuration:

#### Framework Preset
- ✅ Automatically detects: **Next.js**
- No changes needed

#### Root Directory
- ✅ Automatically set to: `./`
- No changes needed

#### Build and Output Settings
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

**DO NOT DEPLOY YET** - We need to add environment variables first!

Click **"Configure Project"** or skip to environment variables section.

**Time: 1 minute**

---

## Part 2: Configure Environment Variables

This is the most important step - the app won't work without these!

### Step 2.1: Access Environment Variables

1. In the project configuration screen, scroll down to **"Environment Variables"**
2. You'll see an "Add" button to add variables

**OR** if you've already deployed:
1. Go to your project dashboard
2. Click **"Settings"** tab
3. Select **"Environment Variables"** from the left sidebar

---

### Step 2.2: Add All 12 Variables

For each variable, follow this process:

#### Adding a Variable:
1. **Key**: Enter the variable name (from `DEPLOYMENT_ENV_VARS.md`)
2. **Value**: Paste the actual value (no quotes)
3. **Environments**: Select where this variable should be available:
   - ✅ **Production** (always check this)
   - ✅ **Preview** (recommended for testing)
   - ☐ **Development** (optional, use .env.local locally)
4. Click **"Add"** or **"Save"**

#### Complete List to Add:

**Supabase Variables (3)**
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_KEY`

**OpenAI Variable (1)**
4. `OPENAI_API_KEY`

**n8n Webhook Variables (8)**
5. `N8N_WEBHOOK_BILDER_PROMPT_ONLY`
6. `N8N_WEBHOOK_BILDER_WITH_IMAGES`
7. `N8N_WEBHOOK_BILDER_EDIT_IMAGE`
8. `N8N_WEBHOOK_URL_PRODUCT_VIDEO`
9. `N8N_WEBHOOK_URL_PRODUCT_DATA`
10. `N8N_WEBHOOK_VIDEO_FROM_REFERENCE_IMAGES`
11. `N8N_WEBHOOK_VIDEO_8S_PRODUCT_REAL_LIVE`
12. `N8N_WEBHOOK_URL_BUSINESS_WEBSITE_DNA`

**Time: 10-15 minutes**

---

### Step 2.3: Verify All Variables Are Set

Before deploying, double-check:
- [ ] All 12 variables are added
- [ ] No typos in variable names (they're case-sensitive!)
- [ ] Values don't have extra spaces or quotes
- [ ] Variables starting with `NEXT_PUBLIC_` are marked correctly
- [ ] Production environment is selected for all

---

## Part 3: Deploy Your Application

### Step 3.1: Trigger First Deployment

1. Click **"Deploy"** button (bottom of the configuration page)
2. Vercel will now:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build your Next.js app (`npm run build`)
   - Deploy to Vercel's global CDN

**What to Expect:**
- The build process takes **2-5 minutes**
- You'll see a real-time build log
- Watch for any errors (they'll be highlighted in red)

**Time: 2-5 minutes**

---

### Step 3.2: Monitor Build Progress

In the deployment view, you'll see:
- **Building**: Installing dependencies and building the app
- **Deploying**: Uploading to Vercel's CDN
- **Ready**: Deployment successful! ✅

#### If the build succeeds:
- You'll see "Deployment Complete" with a **"Visit"** button
- A unique URL will be generated: `https://xv-studio-[random].vercel.app`

#### If the build fails:
- Check the build logs for errors
- Common issues:
  - Missing environment variables starting with `NEXT_PUBLIC_`
  - TypeScript errors
  - Missing dependencies
- Fix the issue and click **"Redeploy"**

---

### Step 3.3: View Your Deployed Site

1. Click the **"Visit"** button or the generated URL
2. Your app should load! 🎉
3. You'll see the landing page with:
   - "KI für Marketing" badge
   - "KI-Marketing für dein KMU" headline
   - "Let's start" button

**Initial URL Format:**
- Production: `https://xv-studio.vercel.app`
- Or: `https://xv-studio-[project-name].vercel.app`

**Time: Instant once deployed**

---

## Part 4: Configure Custom Domain

Since you have a custom domain, let's set it up!

### Step 4.1: Add Domain to Vercel

1. Go to your project dashboard
2. Click **"Settings"** tab
3. Select **"Domains"** from the left sidebar
4. Click **"Add"** button
5. Enter your domain name (e.g., `xvstudio.com`)
6. Choose domain type:
   - **With www**: Redirects `www.xvstudio.com` → `xvstudio.com`
   - **Without www**: Uses root domain only
   - **Both**: Supports both (recommended)

**Time: 2 minutes**

---

### Step 4.2: Configure DNS Records

Vercel will show you which DNS records to add. You need to update these at your **domain registrar** (where you bought the domain).

#### For Root Domain (xvstudio.com):
```
Type: A
Name: @
Value: 76.76.21.21
```

#### For www Subdomain (www.xvstudio.com):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Where to add these:**
- Log into your domain registrar (GoDaddy, Namecheap, Google Domains, etc.)
- Find "DNS Settings" or "DNS Management"
- Add/edit the records as shown above
- Save changes

**Time: 5-10 minutes + DNS propagation (up to 48 hours, usually <1 hour)**

---

### Step 4.3: Wait for SSL Certificate

Vercel automatically provisions an SSL certificate for your domain:
- This usually takes **5-10 minutes**
- Status will change from "Pending" to "Valid"
- Your site will be accessible via HTTPS

**You can check status in:** Settings → Domains

Once valid, your site will be live at: `https://yourdomain.com` 🎉

**Time: 5-10 minutes (automatic)**

---

## Part 5: Update Supabase Settings

### Step 5.1: Add Vercel URL to Supabase

To prevent CORS errors:

1. Go to your Supabase dashboard
2. Navigate to **Settings** → **API**
3. Scroll to **"CORS Configuration"** or **"Allowed Origins"**
4. Add your Vercel URLs:
   ```
   https://xv-studio.vercel.app
   https://yourdomain.com
   https://*.vercel.app
   ```
5. Save changes

**Time: 2 minutes**

---

## Part 6: Initial Testing

Run these quick tests to ensure everything works:

### Test 1: Landing Page
- [ ] Visit your deployed URL
- [ ] Verify hero section displays correctly
- [ ] Check "Let's start" button opens login modal
- [ ] Test login modal close button

### Test 2: Authentication
- [ ] Click "Let's start"
- [ ] Try Google sign-in
- [ ] Or try email sign-in
- [ ] Verify redirect to /studio after login

### Test 3: Studio Interface
- [ ] Verify studio page loads
- [ ] Check sidebar navigation appears
- [ ] Test dark mode toggle (if applicable)
- [ ] Verify "XV STUDIO" branding shows correctly

### Test 4: Basic AI Chat (Critical)
- [ ] Select "Bilder" from navigation
- [ ] Send a test message
- [ ] Verify AI responds (OpenAI connection works)
- [ ] Check for any error messages

### Test 5: Supabase Connection
- [ ] Navigate to "Firmenprofil"
- [ ] If you have a business profile, it should load
- [ ] If not, test business URL input
- [ ] Verify data loads from Supabase

**If all tests pass: Deployment successful! ✅**

**Time: 10-15 minutes**

---

## Part 7: Enable Monitoring & Analytics

### Step 7.1: Enable Vercel Analytics

1. Go to your project dashboard
2. Click **"Analytics"** tab
3. Click **"Enable Analytics"**
4. This is **FREE** on the Hobby plan

**What you get:**
- Real-time performance metrics
- Page load times
- User analytics
- Core Web Vitals

**Time: 1 minute**

---

### Step 7.2: Set Up Deployment Notifications

Get notified when deployments succeed or fail:

1. Go to **Settings** → **Integrations**
2. Choose your preferred notification method:
   - **Slack**: Get deployment updates in Slack
   - **Email**: Receive deployment emails
   - **Discord**: Post to Discord channel

**Time: 2-3 minutes**

---

## Troubleshooting Common Issues

### Issue 1: Build Fails with "Environment variable is undefined"

**Symptom:** Build fails with error about missing environment variables

**Solution:**
1. Check that variables starting with `NEXT_PUBLIC_` are added
2. Variable names are case-sensitive - verify exact spelling
3. Redeploy after adding variables

---

### Issue 2: Page Loads But Features Don't Work

**Symptom:** Landing page loads but login/features don't work

**Solution:**
1. Open browser DevTools (F12) → Console tab
2. Look for errors related to:
   - Supabase connection
   - OpenAI API
   - Webhook URLs
3. Verify all 12 environment variables are correctly set
4. Check Supabase CORS settings include your Vercel URL

---

### Issue 3: "Failed to connect to Supabase"

**Symptom:** Errors about Supabase connection

**Solutions:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` format: `https://[project-id].supabase.co`
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Ensure Supabase project is active (not paused)
4. Add Vercel URL to Supabase allowed origins

---

### Issue 4: Images Not Loading

**Symptom:** Broken image icons or 403 errors

**Solutions:**
1. Check `next.config.js` has `*.supabase.co` in remotePatterns ✅ (we fixed this!)
2. Verify Supabase storage bucket is public
3. Check image URLs are valid
4. Ensure images exist in Supabase storage

---

### Issue 5: Dark Mode Not Working

**Symptom:** Theme toggle doesn't work

**Solutions:**
1. Clear browser cache and cookies
2. Try in incognito/private mode
3. Check browser console for errors

---

## Advanced: Vercel Pro Features

If you exceed the free tier limits, consider upgrading to Vercel Pro ($20/month):

### Pro Benefits:
- **1TB** bandwidth (vs 100GB on Hobby)
- **300 second** function timeout (vs 10 seconds)
- **Unlimited** team members
- **Password protection** for preview deployments
- **Advanced analytics**
- **Priority support**

### When to Upgrade:
- You exceed 100GB bandwidth/month
- You need longer function timeouts (though your video generation is handled by n8n)
- You want team collaboration features
- Your app gets significant traffic (1000+ users/month)

**For your current needs (100-1000 users/month), the FREE tier should be sufficient.**

---

## Maintenance & Updates

### Automatic Deployments

Vercel is connected to your GitHub repository:
- **Every push to `main`** branch triggers a new production deployment
- **Pull requests** get preview deployments automatically
- **No manual deployment needed** after initial setup

### Updating Environment Variables

If you need to change environment variables:
1. Go to Settings → Environment Variables
2. Find the variable to change
3. Click **"Edit"**
4. Update the value
5. **Click "Redeploy"** for changes to take effect

**Important:** Changes to environment variables don't apply to existing deployments - you must redeploy!

---

## Getting Help

### Vercel Resources:
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions
- Support: Email support@vercel.com (Pro plan gets priority)

### Next.js Resources:
- Documentation: https://nextjs.org/docs
- GitHub Issues: https://github.com/vercel/next.js/issues

### Your Support Channels:
- Check `DEPLOYMENT_ENV_VARS.md` for environment variable help
- Review `TESTING_CHECKLIST.md` for testing procedures
- Check Vercel function logs for runtime errors

---

## Congratulations! 🎉

You've successfully deployed XV Studio to Vercel!

**Your app is now:**
- ✅ Live on the internet
- ✅ Automatically building on every push
- ✅ Secured with HTTPS
- ✅ Running on a global CDN
- ✅ Connected to Supabase, OpenAI, and n8n

**Next steps:**
- Test all features thoroughly (see `TESTING_CHECKLIST.md`)
- Share your custom domain with users
- Monitor analytics and performance
- Iterate and improve based on user feedback

Welcome to production! 🚀
