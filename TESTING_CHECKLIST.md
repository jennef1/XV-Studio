# XV Studio - Post-Deployment Testing Checklist

Complete testing checklist to verify all features work correctly after deployment to Vercel.

---

## How to Use This Checklist

1. **After deploying** to Vercel, work through each section
2. **Check each box** ✅ as you complete tests
3. **Document issues** in the "Issues Found" section at the bottom
4. **Retest** after fixing any issues
5. **Sign off** once all tests pass

**Estimated Time:** 30-45 minutes

---

## Section 1: Basic Accessibility & Performance

### 1.1 Domain & SSL
- [ ] Root domain loads (`https://yourdomain.com`)
- [ ] www subdomain works (`https://www.yourdomain.com`)
- [ ] Correct redirect happens (www → root or vice versa)
- [ ] Padlock icon 🔒 shows in browser (HTTPS working)
- [ ] SSL certificate is valid (click padlock to verify)
- [ ] No mixed content warnings in console

### 1.2 Page Load Performance
- [ ] Landing page loads in < 3 seconds
- [ ] No JavaScript errors in console (F12)
- [ ] Images load correctly
- [ ] Fonts render properly (no FOUT - Flash of Unstyled Text)
- [ ] No broken links on landing page

### 1.3 Mobile Responsiveness
- [ ] Site works on mobile (test with browser DevTools mobile view)
- [ ] Navigation is usable on small screens
- [ ] Buttons are tappable (not too small)
- [ ] Text is readable (not too small)
- [ ] No horizontal scrolling

---

## Section 2: Landing Page Functionality

### 2.1 Hero Section
- [ ] Badge "KI für Marketing" displays correctly
- [ ] Main headline shows in 2 lines:
  - Line 1 (black): "KI-Marketing für dein KMU"
  - Line 2 (gradient): "Geführt, schnell & kostengünstig."
- [ ] Subtitle text is readable
- [ ] "Let's start" button displays with gradient
- [ ] "Let's start" button has arrow icon

### 2.2 Header Navigation
- [ ] "XV STUDIO" text displays (no logo image)
- [ ] Login button visible in header
- [ ] Login button has gradient border
- [ ] Header is sticky (stays at top when scrolling)

### 2.3 How It Works Section
- [ ] Section title displays correctly
- [ ] All 4 steps show:
  - Step 01: Gib deine URL ein
  - Step 02: Generiere Bilder & Videos
  - Step 03: Bearbeite & personalisiere
  - Step 04: Downloade & veröffentliche
- [ ] Visual mockups display for each step
- [ ] Gradient lines connect the steps

### 2.4 Login Modal
- [ ] Click "Let's start" opens login modal
- [ ] Click header "Login" button opens login modal
- [ ] Modal displays correctly:
  - [ ] XV STUDIO gradient badge at top
  - [ ] "Willkommen zurück" title
  - [ ] Google sign-in button
  - [ ] "oder" divider
  - [ ] Email sign-in button
- [ ] Close button (X) works
- [ ] Click outside modal closes it
- [ ] Modal has proper backdrop blur effect

---

## Section 3: Authentication

### 3.1 Google Sign-In
- [ ] Click "Mit Google anmelden" button
- [ ] Google OAuth popup opens
- [ ] Can select Google account
- [ ] After auth, redirects to /studio
- [ ] User stays logged in (refresh page)
- [ ] User can log out

### 3.2 Email Sign-In
- [ ] Click "Mit E-Mail anmelden" button
- [ ] Email form displays
- [ ] Back button returns to main login screen
- [ ] Can enter email address
- [ ] Can enter password
- [ ] "Anmelden" button works
- [ ] Shows loading state during sign-in
- [ ] Redirects to /studio on success
- [ ] Shows error message on failure

### 3.3 First-Time User Onboarding
**For NEW users only (clear test):**
- [ ] After first login, onboarding modal appears
- [ ] Modal shows welcome message about business URL
- [ ] "Los geht's" button visible
- [ ] Click button closes modal
- [ ] Automatically navigates to Firmenprofil section
- [ ] Shows URL input interface

---

## Section 4: Studio Interface

### 4.1 Page Load & Layout
- [ ] Studio page loads at `/studio`
- [ ] Three-column layout displays:
  - [ ] Left: Sidebar
  - [ ] Center: Chat area
  - [ ] Right: Preview panel
- [ ] "XV STUDIO" text in sidebar (no logo)
- [ ] Profile section visible in sidebar
- [ ] Spacing looks correct (consistent top spacing)

### 4.2 Sidebar Navigation
- [ ] Navigation items in correct order:
  1. [ ] Bilder
  2. [ ] Produkt / Service Video
  3. [ ] Social Media Paket (with "Coming Soon" badge)
- [ ] "Logo Transformation" is NOT in list (removed)
- [ ] Click "Bilder" opens chat interface
- [ ] Click "Produkt / Service Video" opens chat
- [ ] Social Media Paket shows "Coming Soon" badge
- [ ] Social Media Paket is disabled/not clickable

### 4.3 Saved Projects Section
- [ ] "Gespeicherte Projekte" section visible
- [ ] Three items display:
  - [ ] Firmenprofil
  - [ ] Produkte / Services
  - [ ] Meine gespeicherten Projekte
- [ ] Click each item navigates correctly

### 4.4 Dark Mode (If Implemented)
- [ ] Theme toggle button visible
- [ ] Click toggles between light/dark mode
- [ ] Theme persists on page refresh
- [ ] All sections look good in dark mode
- [ ] Text is readable in both modes

---

## Section 5: Firmenprofil (Business Profile)

### 5.1 First-Time User Experience
**For users without business profile:**
- [ ] Shows welcome message about providing business URL
- [ ] URL input field displays
- [ ] "Los geht's" button visible
- [ ] Can enter website URL
- [ ] Button disabled if URL is empty
- [ ] Click "Los geht's" triggers workflow

### 5.2 Business DNA Webhook
- [ ] Loading modal appears after clicking "Los geht's"
- [ ] Shows "Analysiere deine Website..." message
- [ ] Loading animation displays
- [ ] Shows estimated time (2 minutes)
- [ ] Progress bar animates
- [ ] Shows business URL being analyzed
- [ ] After completion (wait ~2 minutes):
  - [ ] Loading modal disappears
  - [ ] Business profile displays

### 5.3 Populated Business Profile
**For users with existing profile:**
- [ ] Company name displays
- [ ] Logo shows (or gradient circle with initial)
- [ ] Tagline displays (if available)
- [ ] Website URL is clickable
- [ ] "Bearbeiten" button visible
- [ ] Business description section shows
- [ ] Brand values display as chips
- [ ] Brand colors show as color circles
- [ ] Website images grid displays (if available)

### 5.4 Edit Mode
- [ ] Click "Bearbeiten" button
- [ ] Switches to edit mode
- [ ] Business description becomes textarea
- [ ] Can add/remove brand values
- [ ] Can add/remove brand colors
- [ ] "Abbrechen" button appears
- [ ] "Speichern" button appears
- [ ] Click "Abbrechen" cancels changes
- [ ] Click "Speichern" saves to Supabase
- [ ] Page updates with saved data

---

## Section 6: Produkte / Services Section

### 6.1 Products View
- [ ] Navigate to "Produkte / Services"
- [ ] Page loads correctly
- [ ] If no products:
  - [ ] Shows empty state
  - [ ] "Produkt erstellen" button visible
- [ ] If products exist:
  - [ ] Product cards display
  - [ ] Each shows product name
  - [ ] Each shows product description
  - [ ] Product images display

### 6.2 Create New Product
- [ ] Click "Produkt erstellen" button
- [ ] Create form displays
- [ ] Can enter product name
- [ ] Can enter description
- [ ] Can upload product images
- [ ] "Speichern" button works
- [ ] New product appears in list
- [ ] Product saved to Supabase

### 6.3 Product Actions
- [ ] Can view product details
- [ ] Can edit existing product
- [ ] Can delete product (with confirmation)
- [ ] Changes persist after page refresh

---

## Section 7: AI Chat Functionality

### 7.1 Bilder (Image Generation)
- [ ] Select "Bilder" from navigation
- [ ] Chat interface loads
- [ ] Shows initial greeting message with options:
  1. [ ] Lasse der KI freien lauf
  2. [ ] Kombiniere mehrere Bilder zu einem
  3. [ ] Füge Referenzbilder oder Bilder deiner Produkte dazu
- [ ] If products exist, shows product cards
- [ ] Can select a product from cards

### 7.2 Chat Interaction
- [ ] Can type message in input field
- [ ] Send button enabled when text entered
- [ ] Press Enter sends message
- [ ] User message appears in chat
- [ ] AI response streams in (real-time typing effect)
- [ ] Loading indicator shows while AI responds
- [ ] Chat scrolls to show latest message
- [ ] Message timestamps display correctly

### 7.3 OpenAI Integration
- [ ] AI responses are contextually relevant
- [ ] No "API key not found" errors
- [ ] Responses complete successfully
- [ ] No rate limit errors (if testing multiple times, wait)
- [ ] Check Vercel function logs for any errors

---

## Section 8: Produkt / Service Video Generation

### 8.1 Initial Flow
- [ ] Select "Produkt / Service Video" from navigation
- [ ] Chat shows greeting with options:
  1. [ ] Quick Import: Enter product website URL
  2. [ ] Use an existing Product
  3. [ ] Manually add products
- [ ] If products exist, shows product selection cards below options

### 8.2 Product Selection
- [ ] Can click on product card to select
- [ ] Selected product highlights
- [ ] AI confirms product selection
- [ ] Shows product images
- [ ] Presents video ideas
- [ ] Can select a video idea by number (1, 2, or 3)

### 8.3 Video Generation (May Take Time)
- [ ] After selecting idea, video generation starts
- [ ] Shows loading indicator
- [ ] **NOTE**: This takes several minutes (up to 8 minutes)
- [ ] Check Vercel function logs if timeout occurs
- [ ] If successful, video preview should display
- [ ] Video saved to gallery

**Timeout Handling:**
- [ ] If times out on free tier, verify this is expected
- [ ] Check n8n Cloud logs to see if workflow completed
- [ ] Video should still be generated by n8n even if Vercel times out

---

## Section 9: Image Upload & Storage

### 9.1 Image Upload
- [ ] Find image upload component (in products or chat)
- [ ] Click to upload or drag & drop image
- [ ] File picker opens
- [ ] Can select image (JPG, PNG, etc.)
- [ ] Upload progress shows (if applicable)
- [ ] Image preview displays after upload
- [ ] Image URL is from Supabase (`*.supabase.co`)

### 9.2 Image Display
- [ ] Uploaded images display correctly
- [ ] No broken image icons
- [ ] Images from Supabase storage load properly
- [ ] No CORS errors in console
- [ ] Thumbnails work if applicable

---

## Section 10: Saved Projects / Gallery

### 10.1 Gallery View
- [ ] Navigate to "Meine gespeicherten Projekte"
- [ ] Gallery grid displays
- [ ] If no projects:
  - [ ] Shows empty state message
- [ ] If projects exist:
  - [ ] Project cards display
  - [ ] Each shows thumbnail
  - [ ] Each shows project name
  - [ ] Each shows creation date

### 10.2 Project Interaction
- [ ] Can click project card to view details
- [ ] Modal or detail view opens
- [ ] Full resolution image/video displays
- [ ] Can close detail view
- [ ] Can delete project (with confirmation)
- [ ] Can favorite/unfavorite (if feature exists)

---

## Section 11: Error Handling

### 11.1 Network Errors
- [ ] Disconnect internet
- [ ] Try to send chat message
- [ ] Appropriate error message shows
- [ ] Reconnect and try again - works
- [ ] No app crash or white screen

### 11.2 API Errors
**Check browser console (F12) for:**
- [ ] No 500 errors
- [ ] No "Failed to fetch" errors
- [ ] No "CORS policy" errors
- [ ] No "Environment variable undefined" errors

### 11.3 User Input Validation
- [ ] Empty messages can't be sent
- [ ] Email validation in login form
- [ ] URL validation in business profile
- [ ] Required fields show appropriate errors

---

## Section 12: Cross-Browser Testing

### 12.1 Chrome/Edge (Chromium)
- [ ] All features work in Chrome
- [ ] All features work in Edge
- [ ] No console errors
- [ ] Layout looks correct

### 12.2 Firefox
- [ ] Landing page loads correctly
- [ ] Login works
- [ ] Chat functionality works
- [ ] No unique Firefox errors

### 12.3 Safari (Mac/iOS)
- [ ] Landing page loads
- [ ] Authentication works
- [ ] Images display correctly
- [ ] Chat works without issues

### 12.4 Mobile Browsers
- [ ] Test on actual mobile device or DevTools
- [ ] iOS Safari works
- [ ] Android Chrome works
- [ ] Touch interactions work properly

---

## Section 13: Performance & Monitoring

### 13.1 Vercel Analytics
- [ ] Analytics enabled in Vercel dashboard
- [ ] Page views are being tracked
- [ ] No errors in analytics dashboard
- [ ] Can view real-time visitor data

### 13.2 Function Logs
- [ ] Check Vercel → Functions tab
- [ ] API routes are executing successfully
- [ ] No unexpected errors in logs
- [ ] Response times are reasonable (< 10s for most)

### 13.3 Lighthouse Score (Optional but Recommended)
Run Lighthouse in Chrome DevTools:
- [ ] Performance score > 80
- [ ] Accessibility score > 90
- [ ] Best Practices score > 90
- [ ] SEO score > 80

---

## Section 14: Security Checks

### 14.1 Environment Variables
- [ ] `NEXT_PUBLIC_*` variables are accessible in browser
- [ ] Server-side variables (API keys) NOT visible in browser
- [ ] Check Network tab - no API keys in responses
- [ ] No secrets in client-side JavaScript

### 14.2 HTTPS & Headers
- [ ] All requests use HTTPS
- [ ] No mixed content warnings
- [ ] Check response headers (in Network tab):
  - [ ] `X-Frame-Options` present
  - [ ] `Content-Security-Policy` present (if configured)

### 14.3 Authentication
- [ ] Can't access /studio without login (redirects to landing)
- [ ] Session persists correctly
- [ ] Logout works and clears session
- [ ] Can't access other users' data

---

## Section 15: Final Integration Tests

### 15.1 Complete User Journey (New User)
1. [ ] Visit landing page
2. [ ] Click "Let's start"
3. [ ] Sign up with Google or email
4. [ ] See onboarding modal
5. [ ] Close modal, arrive at Firmenprofil
6. [ ] Enter business URL
7. [ ] Wait for business DNA analysis
8. [ ] See populated business profile
9. [ ] Navigate to Bilder
10. [ ] Send a message to AI
11. [ ] Receive AI response
12. [ ] Generate an image (if time allows)
13. [ ] View saved project in gallery

### 15.2 Complete User Journey (Returning User)
1. [ ] Visit site
2. [ ] Log in
3. [ ] Already have business profile
4. [ ] Navigate directly to products
5. [ ] Create or select a product
6. [ ] Generate product video
7. [ ] Check saved projects

---

## Issues Found

**Document any issues you encounter during testing:**

### Issue #1
- **Area**: (e.g., Login, Chat, etc.)
- **Description**:
- **Steps to Reproduce**:
- **Expected Behavior**:
- **Actual Behavior**:
- **Status**: (Open / Fixed / Won't Fix)

### Issue #2
- **Area**:
- **Description**:
- **Steps to Reproduce**:
- **Expected Behavior**:
- **Actual Behavior**:
- **Status**:

*(Add more as needed)*

---

## Sign-Off

### Testing Completed By:
- **Name**:
- **Date**:
- **Environment Tested**: (Production / Staging)
- **URL Tested**:

### Overall Status:
- [ ] ✅ All critical tests passed
- [ ] ⚠️ Some non-critical issues found (documented above)
- [ ] ❌ Critical issues prevent sign-off

### Notes:
*(Any additional observations or recommendations)*

---

## Post-Testing Actions

After completing testing:

1. **Fix any critical issues** found during testing
2. **Retest** the areas that had problems
3. **Update documentation** if you discovered new behavior
4. **Notify team** (if applicable) that deployment is validated
5. **Monitor** Vercel analytics and logs for first 24 hours
6. **Set up uptime monitoring** (UptimeRobot, Pingdom, etc.)

---

## Ongoing Monitoring

Set up recurring checks:

### Daily (First Week)
- [ ] Check Vercel dashboard for errors
- [ ] Review function logs
- [ ] Monitor uptime
- [ ] Check OpenAI usage/costs
- [ ] Verify Supabase storage usage

### Weekly (Ongoing)
- [ ] Review analytics data
- [ ] Check for any user-reported issues
- [ ] Monitor costs (Vercel, OpenAI, Supabase, n8n)
- [ ] Test critical user flows
- [ ] Review and rotate secrets if needed

---

## Support Resources

If you encounter issues during testing:

1. **Vercel Issues**:
   - Check Vercel docs: https://vercel.com/docs
   - Vercel community: https://github.com/vercel/vercel/discussions

2. **Supabase Issues**:
   - Supabase docs: https://supabase.com/docs
   - Supabase Discord: https://discord.supabase.com

3. **OpenAI Issues**:
   - OpenAI docs: https://platform.openai.com/docs
   - Check API status: https://status.openai.com

4. **n8n Issues**:
   - n8n docs: https://docs.n8n.io
   - n8n community: https://community.n8n.io

---

**Congratulations on completing thorough testing of XV Studio! 🎉**

Your app is now validated and ready for users.
