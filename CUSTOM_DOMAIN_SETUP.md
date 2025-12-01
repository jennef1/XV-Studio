# XV Studio - Custom Domain Setup Guide

Complete guide for connecting your custom domain to Vercel.

---

## Overview

This guide will walk you through:
1. Adding your domain to Vercel
2. Configuring DNS records at your registrar
3. Waiting for SSL certificate provisioning
4. Verifying everything works

**Time Required:** 15-30 minutes + DNS propagation time (usually < 1 hour, up to 48 hours)

---

## Prerequisites

- [ ] Vercel project deployed and working
- [ ] Custom domain purchased (e.g., `xvstudio.com`)
- [ ] Access to your domain registrar's DNS settings

---

## Part 1: Add Domain to Vercel

### Step 1.1: Navigate to Domains Settings

1. Log into your Vercel dashboard
2. Select your **XV-Studio** project
3. Click the **"Settings"** tab at the top
4. Select **"Domains"** from the left sidebar

---

### Step 1.2: Add Your Domain

1. Click the **"Add"** button
2. Enter your domain name:
   - **Example**: `xvstudio.com`
   - **Or with www**: `www.xvstudio.com`
3. Click **"Add"**

---

### Step 1.3: Choose Domain Configuration

Vercel will ask how you want to configure your domain:

#### Option 1: Root Domain Only (Recommended)
- **Primary**: `xvstudio.com`
- **Redirects from**: `www.xvstudio.com` → `xvstudio.com`
- Users typing `www.` get redirected to root domain

#### Option 2: www Subdomain Only
- **Primary**: `www.xvstudio.com`
- **Redirects from**: `xvstudio.com` → `www.xvstudio.com`
- Root domain redirects to www

#### Option 3: Both (No Redirects)
- Both `xvstudio.com` and `www.xvstudio.com` work independently
- Usually not recommended (can cause SEO issues)

**Recommendation:** Choose **Option 1** (root domain) for cleaner URLs.

---

## Part 2: Configure DNS Records

After adding your domain, Vercel will show you DNS records that need to be configured.

### DNS Records You Need to Add:

#### For Root Domain (xvstudio.com):
```
Type: A
Name: @ (or leave blank for root)
Value: 76.76.21.21
TTL: Auto or 3600
```

#### For www Subdomain (www.xvstudio.com):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto or 3600
```

**Note:** Some registrars use different terminology:
- **Name** might be called "Host" or "Record"
- **Value** might be called "Points to" or "Target"
- **@** represents the root domain

---

## Part 3: Update DNS at Your Registrar

Below are specific instructions for popular domain registrars:

---

### Option A: GoDaddy

1. Log into your GoDaddy account
2. Go to **"My Products"** → **"Domains"**
3. Find your domain and click **"DNS"** or **"Manage DNS"**
4. Scroll to **"Records"** section

#### Add A Record (Root Domain):
1. Click **"Add"** → Select **"A"**
2. **Name**: @ (or leave blank)
3. **Value**: `76.76.21.21`
4. **TTL**: 600 seconds (or custom)
5. Click **"Save"**

#### Add CNAME Record (www):
1. Click **"Add"** → Select **"CNAME"**
2. **Name**: www
3. **Value**: `cname.vercel-dns.com`
4. **TTL**: 1 Hour
5. Click **"Save"**

**Delete any conflicting records:**
- If you see an A record for www, delete it
- If you see a CNAME for @, delete it

**Save changes and wait for propagation (usually 10-30 minutes).**

---

### Option B: Namecheap

1. Log into Namecheap
2. Go to **"Domain List"**
3. Click **"Manage"** next to your domain
4. Navigate to **"Advanced DNS"** tab

#### Add A Record:
1. Click **"Add New Record"**
2. **Type**: A Record
3. **Host**: @
4. **Value**: `76.76.21.21`
5. **TTL**: Automatic
6. Click **"Save"**

#### Add CNAME Record:
1. Click **"Add New Record"**
2. **Type**: CNAME Record
3. **Host**: www
4. **Value**: `cname.vercel-dns.com`
5. **TTL**: Automatic
6. Click **"Save"**

**Delete default parking page records if they exist.**

**Propagation time: Usually 30 minutes - 1 hour.**

---

### Option C: Google Domains (Now Squarespace)

1. Sign into Google Domains
2. Click on your domain
3. Click **"DNS"** in the left menu
4. Scroll to **"Custom resource records"**

#### Add A Record:
1. **Name**: @ (leave blank)
2. **Type**: A
3. **TTL**: 3600
4. **Data**: `76.76.21.21`
5. Click **"Add"**

#### Add CNAME Record:
1. **Name**: www
2. **Type**: CNAME
3. **TTL**: 3600
4. **Data**: `cname.vercel-dns.com.` (note the trailing dot!)
5. Click **"Add"**

**Important:** Google Domains requires a trailing dot for CNAME values!

**Propagation time: Usually very fast, 5-15 minutes.**

---

### Option D: Cloudflare

1. Log into Cloudflare
2. Select your domain
3. Go to **"DNS"** tab

#### Add A Record:
1. Click **"Add record"**
2. **Type**: A
3. **Name**: @
4. **IPv4 address**: `76.76.21.21`
5. **Proxy status**: DNS only (gray cloud, NOT proxied)
6. **TTL**: Auto
7. Click **"Save"**

#### Add CNAME Record:
1. Click **"Add record"**
2. **Type**: CNAME
3. **Name**: www
4. **Target**: `cname.vercel-dns.com`
5. **Proxy status**: DNS only (gray cloud)
6. **TTL**: Auto
7. Click **"Save"**

**Important:** Make sure **"Proxy status"** is set to **"DNS only"** (gray cloud). If it's proxied (orange cloud), SSL might not work correctly.

**Propagation time: Usually 2-5 minutes (Cloudflare is very fast).**

---

### Option E: Other Registrars

If your registrar isn't listed above, follow these general steps:

1. Log into your domain registrar
2. Find "DNS Settings", "DNS Management", or "Name Servers"
3. Look for a section to add/edit DNS records
4. Add the A record and CNAME record as specified above
5. Save changes

**Common registrar portals:**
- **Hover**: DNS settings under domain details
- **Domain.com**: DNS & Nameservers section
- **1&1 IONOS**: Domain settings → DNS settings
- **Register.com**: Manage domain → Advanced technical settings

---

## Part 4: Verify DNS Configuration

### Step 4.1: Check DNS Propagation

Use online tools to check if your DNS records have propagated:

**Recommended Tools:**
1. **whatsmydns.net**
   - Enter your domain
   - Select "A" record type
   - Check if `76.76.21.21` appears globally

2. **nslookup (Command Line)**
   ```bash
   # Check A record
   nslookup xvstudio.com

   # Check CNAME record
   nslookup www.xvstudio.com
   ```

3. **dig (Mac/Linux)**
   ```bash
   # Check A record
   dig xvstudio.com

   # Check CNAME record
   dig www.xvstudio.com
   ```

**What to look for:**
- A record should point to `76.76.21.21`
- CNAME should point to `cname.vercel-dns.com`

---

### Step 4.2: Check Vercel Status

Back in Vercel Domains settings:
1. Your domain should show a status indicator
2. **Initial states:**
   - **Pending**: DNS not configured yet
   - **Invalid Configuration**: DNS records incorrect
3. **Success state:**
   - **Valid**: DNS configured correctly ✅

**If status shows "Invalid Configuration":**
- Double-check DNS records
- Wait a bit longer (DNS can take up to 48 hours)
- Use DNS propagation checker tools

---

## Part 5: SSL Certificate

Vercel automatically provisions an SSL certificate for your domain using Let's Encrypt.

### Step 5.1: Wait for SSL

After DNS is verified:
- Vercel automatically requests an SSL certificate
- This usually takes **5-10 minutes**
- You'll see "Provisioning SSL Certificate" status

### Step 5.2: Verify HTTPS

Once SSL is ready:
1. Visit `https://yourdomain.com`
2. You should see a padlock icon 🔒 in the browser
3. Click the padlock to view certificate details
4. Verify it's issued by **"Let's Encrypt"**

**If you see "Not Secure" warning:**
- Wait a few more minutes
- SSL provisioning can take up to 30 minutes in rare cases
- Check Vercel domain settings for error messages

---

## Part 6: Update Application Settings

### Step 6.1: Update Supabase CORS

Add your custom domain to Supabase:

1. Go to Supabase Dashboard
2. Navigate to **Settings** → **API**
3. Find **"Site URL"** or **"CORS Configuration"**
4. Add your custom domain:
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```
5. Save changes

---

### Step 6.2: Update n8n Callbacks (If Applicable)

If any n8n workflows send callbacks to your app:

1. Update callback URLs in your n8n workflows
2. Change from `https://xv-studio.vercel.app`
3. To your custom domain: `https://yourdomain.com`

---

## Part 7: Testing Your Custom Domain

Run these tests to ensure everything works:

### Test 1: Domain Accessibility
- [ ] Visit `https://yourdomain.com` (root domain)
- [ ] Visit `https://www.yourdomain.com` (www subdomain)
- [ ] Verify correct redirect happens (based on your configuration)
- [ ] Check for padlock icon (HTTPS working)

### Test 2: Certificate Validity
- [ ] Click padlock icon in browser
- [ ] View certificate details
- [ ] Verify it's valid and trusted
- [ ] Check expiration date (should be 90 days out)

### Test 3: All Features Work
- [ ] Landing page loads correctly
- [ ] Login functionality works
- [ ] AI chat responds
- [ ] Images load from Supabase
- [ ] All navigation works
- [ ] Dark mode toggle works (if applicable)

### Test 4: Different Browsers
Test in multiple browsers to ensure consistency:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers

---

## Troubleshooting

### Issue 1: "Domain is not verified"

**Symptom:** Vercel shows "Invalid Configuration" or "Pending"

**Solutions:**
1. Double-check DNS records are correct
2. Ensure you're editing DNS at the correct registrar
3. Wait longer - DNS can take up to 48 hours to propagate
4. Use `whatsmydns.net` to check global propagation
5. Clear your local DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns

   # Mac
   sudo dscacheutil -flushcache

   # Linux
   sudo systemd-resolve --flush-caches
   ```

---

### Issue 2: SSL Certificate Error

**Symptom:** "Your connection is not private" or "NET::ERR_CERT_COMMON_NAME_INVALID"

**Solutions:**
1. Wait longer - SSL provisioning can take up to 30 minutes
2. Check that DNS is fully propagated first
3. Try visiting in incognito mode
4. Check Vercel domain status for SSL errors
5. If it persists, try removing and re-adding the domain in Vercel

---

### Issue 3: Redirect Loop

**Symptom:** Page keeps redirecting endlessly

**Solutions:**
1. Check for conflicting redirects in your domain settings
2. Ensure you don't have both @ and www pointing to different places
3. Clear browser cache and cookies
4. Check Vercel domain configuration (only one should be primary)

---

### Issue 4: Old Site Shows Up

**Symptom:** Old website appears instead of your new Vercel app

**Solutions:**
1. DNS records may be pointing to old host
2. Remove old A records and CNAME records
3. Ensure new records match Vercel's requirements exactly
4. Wait for DNS propagation
5. Clear browser cache

---

### Issue 5: www Not Working

**Symptom:** Root domain works but www doesn't (or vice versa)

**Solutions:**
1. Check CNAME record for www is correct
2. Ensure `cname.vercel-dns.com` is spelled correctly
3. Some registrars require trailing dot: `cname.vercel-dns.com.`
4. Wait for DNS propagation
5. Verify in Vercel that www redirect is configured

---

## Advanced: Apex Domain with Cloudflare

If you're using Cloudflare and want better performance:

### Option: Cloudflare Proxy

1. In Cloudflare DNS settings
2. Change **Proxy status** to **Proxied** (orange cloud)
3. This enables Cloudflare's CDN + DDoS protection
4. **Caveat:** May cause issues with Vercel Analytics

**Recommended:** Keep as **"DNS only"** (gray cloud) for Vercel deployments.

---

## Advanced: Multiple Domains

To point multiple domains to your app:

### Example: Both .com and .de domains

1. Add first domain in Vercel: `xvstudio.com`
2. Click "Add" again: `xvstudio.de`
3. Configure DNS for both domains
4. Vercel will provision SSL for both
5. Choose which is primary

**Use case:** Localized versions or brand variations

---

## Email Considerations

**Important:** If you use email with your domain (info@yourdomain.com):

### Preserve MX Records
- **Do NOT delete MX records** when adding A/CNAME records
- MX records handle email routing
- They're separate from web hosting
- Deleting them will break your email!

### Common Email Providers:
- **Google Workspace**: Keep Google's MX records
- **Microsoft 365**: Keep Microsoft's MX records
- **Proton Mail**: Keep Proton's MX records

**Tip:** Only modify A and CNAME records for web hosting. Leave MX, TXT, and other records untouched unless you know what you're doing.

---

## SSL Certificate Auto-Renewal

Vercel automatically renews SSL certificates:
- Certificates expire every **90 days**
- Vercel renews them **automatically** ~30 days before expiration
- **No action required from you**
- You'll receive an email if renewal fails

---

## Monitoring Your Domain

### Set Up Alerts

**Recommended monitoring:**
1. **Uptime monitoring**: Use services like UptimeRobot (free)
2. **SSL expiry**: Usually automated, but can use SSL Checker tools
3. **DNS monitoring**: Get alerted if DNS changes unexpectedly

---

## Changing Domain Later

If you need to change domains:

1. Add new domain in Vercel
2. Configure DNS for new domain
3. Wait for SSL provisioning
4. Update Supabase CORS settings
5. Update any n8n callbacks
6. Test everything on new domain
7. Remove old domain from Vercel (optional)

**Tip:** You can have multiple domains pointing to the same Vercel app!

---

## Congratulations! 🎉

Your custom domain is now live!

**Your app is accessible at:**
- ✅ `https://yourdomain.com`
- ✅ HTTPS secured with SSL
- ✅ Globally distributed via CDN
- ✅ Professional custom branding

**Next steps:**
- Share your domain with users
- Update marketing materials
- Add domain to business cards
- Configure analytics for your domain
- Consider setting up email forwarding

Your professional web presence is complete! 🚀
