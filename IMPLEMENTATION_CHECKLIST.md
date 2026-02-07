# 📋 Implementation Checklist

Complete checklist for Google Analytics 4, Tag Manager & Search Console setup for React SPA.

---

## ✅ Pre-Implementation

- [ ] Have Google Tag Manager account and container created
- [ ] Have Google Analytics 4 property created
- [ ] Have Google Search Console account
- [ ] Have site domain verified
- [ ] Have GTM Container ID (format: GTM-XXXXXXX)
- [ ] Have GA4 Measurement ID (format: G-XXXXXXXXXX)
- [ ] Have GSC verification code

---

## ✅ Code Implementation

### Files Created
- [ ] `src/components/PageTracker.tsx` exists
- [ ] `src/utils/gtm.ts` exists
- [ ] `src/utils/eventTracking.tsx` exists
- [ ] `src/hooks/useScrollDepth.ts` exists
- [ ] `src/utils/seo.ts` exists

### Files Modified
- [ ] `index.html` - GTM script added to `<head>`
- [ ] `index.html` - GTM noscript added to `<body>`
- [ ] `index.html` - GSC verification meta tag added
- [ ] `src/App.tsx` - PageTracker imported and rendered

### Configuration Updated
- [ ] `index.html` line 16 - GTM Container ID replaced
- [ ] `index.html` line 296 - GTM noscript ID replaced
- [ ] `index.html` line 37 - GSC verification code added

---

## ✅ Google Tag Manager Setup

### Variables
- [ ] Page Path (Data Layer Variable)
- [ ] Page Location (Data Layer Variable)
- [ ] Page Title (Data Layer Variable)
- [ ] Scroll Percent (Data Layer Variable)
- [ ] Button Text (Data Layer Variable)
- [ ] Button URL (Data Layer Variable)
- [ ] Form ID (Data Layer Variable)
- [ ] Form Name (Data Layer Variable)

### Triggers
- [ ] SPA Pageview (Custom Event: `pageview`)
- [ ] Scroll Depth (Custom Event: `scroll_depth`)
- [ ] CTA Click (Custom Event: `cta_click`)
- [ ] Form Submit (Custom Event: `form_submit`)
- [ ] Form Error (Custom Event: `form_error`) - Optional
- [ ] Outbound Click (Custom Event: `outbound_click`) - Optional

### Tags
- [ ] GA4 Configuration Tag
  - [ ] Measurement ID configured
  - [ ] Automatic pageview DISABLED
  - [ ] page_path field set to {{Page Path}}
  - [ ] page_location field set to {{Page Location}}
  - [ ] page_title field set to {{Page Title}}
  - [ ] Triggered on: SPA Pageview

- [ ] GA4 Event - Scroll Depth
  - [ ] Configuration Tag: {{GA4 Configuration}}
  - [ ] Event Name: `scroll`
  - [ ] Parameters configured
  - [ ] Triggered on: Scroll Depth

- [ ] GA4 Event - CTA Click
  - [ ] Configuration Tag: {{GA4 Configuration}}
  - [ ] Event Name: `cta_click`
  - [ ] Parameters configured
  - [ ] Triggered on: CTA Click

- [ ] GA4 Event - Form Submit
  - [ ] Configuration Tag: {{GA4 Configuration}}
  - [ ] Event Name: `form_submit`
  - [ ] Parameters configured
  - [ ] Triggered on: Form Submit

---

## ✅ Testing in GTM Preview Mode

### Pageview Tracking
- [ ] Navigate to homepage
- [ ] `pageview` custom event fires
- [ ] Page Path variable shows `/`
- [ ] GA4 Configuration tag fires
- [ ] Navigate to `/events`
- [ ] Another `pageview` event fires
- [ ] Page Path updates to `/events`
- [ ] Test browser back button - pageview fires
- [ ] Test browser forward button - pageview fires
- [ ] Test page refresh - pageview fires

### Scroll Depth Tracking
- [ ] On any page, scroll to 25%
- [ ] `scroll_depth` event fires with percent: 25
- [ ] Scroll to 50% - event fires with percent: 50
- [ ] Scroll to 75% - event fires with percent: 75
- [ ] Scroll to 100% - event fires with percent: 100
- [ ] Each milestone fires only once per page
- [ ] Navigate to new page - milestones reset

### CTA Click Tracking
- [ ] Click tracked button
- [ ] `cta_click` event fires
- [ ] Button Text variable populated correctly
- [ ] Button URL variable populated correctly
- [ ] Section parameter captured (if set)

### Form Tracking
- [ ] Fill and submit tracked form
- [ ] `form_submit` event fires
- [ ] Form ID captured correctly
- [ ] Form Name captured correctly
- [ ] Test validation error - `form_error` fires (if implemented)

---

## ✅ Verification in GA4

### Real-time Reports
- [ ] Open GA4 → Reports → Realtime
- [ ] See active users
- [ ] See `page_view` events
- [ ] See custom events (`scroll`, `cta_click`, `form_submit`)
- [ ] Event count increases with interactions
- [ ] No errors in GA4 interface

### DebugView (Recommended)
- [ ] Open GA4 → Configure → DebugView
- [ ] Navigate site in debug mode
- [ ] Events appear in real-time
- [ ] Event parameters visible and correct
- [ ] No error events
- [ ] User properties configured (if any)

### Events Report (Wait 24-48 hours)
- [ ] GA4 → Reports → Events
- [ ] `page_view` event appears
- [ ] Custom events appear
- [ ] Event counts reasonable
- [ ] No duplicate events

---

## ✅ Google Search Console Setup

### Property Setup
- [ ] Property added to Search Console
- [ ] Domain or URL prefix selected
- [ ] Verification method chosen (HTML tag)
- [ ] Verification code copied
- [ ] Verification code added to `index.html`
- [ ] Changes deployed to production
- [ ] Verification completed successfully

### Sitemap Submission
- [ ] `sitemap.xml` file exists in `/public/`
- [ ] Sitemap accessible at `https://yourdomain.com/sitemap.xml`
- [ ] Sitemap submitted to Search Console
- [ ] No errors in sitemap parsing
- [ ] URLs discovered in Search Console
- [ ] Coverage report shows indexed pages

### Search Console Verification
- [ ] Property verified successfully
- [ ] No verification errors
- [ ] Data starts appearing (can take days/weeks)
- [ ] URL Inspection tool works
- [ ] Performance data visible (after time)

---

## ✅ SEO Implementation

### Canonical URLs
- [ ] `useCanonicalUrl` hook available
- [ ] Hook used in main pages
- [ ] Canonical link tag updates on route change
- [ ] No duplicate canonical tags
- [ ] Canonical URLs use HTTPS
- [ ] No trailing slashes (or consistent)

### Meta Tags
- [ ] react-helmet-async installed and configured
- [ ] Page titles update on route change
- [ ] Meta descriptions update on route change
- [ ] Open Graph tags present
- [ ] Twitter Card tags present
- [ ] Page-specific meta tags where needed

### Structured Data
- [ ] Organization schema present
- [ ] BreadcrumbList schema present
- [ ] Event schema on event pages (if applicable)
- [ ] Articles schema on blog posts (if applicable)
- [ ] Test with [Rich Results Test](https://search.google.com/test/rich-results)

---

## ✅ Production Deployment

### Pre-Deployment
- [ ] All placeholder IDs replaced
- [ ] GTM container tested thoroughly
- [ ] No console errors in development
- [ ] Build process completes successfully
- [ ] Preview build tested
- [ ] All tracking functions imported correctly

### Deployment
- [ ] Code deployed to production
- [ ] GTM container published
- [ ] Site accessible with HTTPS
- [ ] No mixed content warnings
- [ ] GTM script loads on production
- [ ] dataLayer initialized correctly

### Post-Deployment Verification
- [ ] Visit site in incognito/private mode
- [ ] Open GTM Preview on production URL
- [ ] Navigate through site
- [ ] Verify events fire correctly
- [ ] Check GA4 Realtime for production data
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Test on different browsers

---

## ✅ Monitoring & Maintenance

### Weekly Checks
- [ ] Review GA4 Realtime reports
- [ ] Check for tracking errors
- [ ] Monitor event volume
- [ ] Review user behavior patterns

### Monthly Checks
- [ ] Review GA4 Events report
- [ ] Check Search Console performance
- [ ] Verify sitemap is up-to-date
- [ ] Review Top Events in GA4
- [ ] Check for new GSC errors
- [ ] Update sitemap if new pages added

### Quarterly Checks
- [ ] Review GTM container versions
- [ ] Audit tracking implementation
- [ ] Update documentation if changes made
- [ ] Review tag firing patterns
- [ ] Check for unused variables/tags
- [ ] Optimize event tracking based on data

---

## ✅ Documentation

- [ ] Team members know where to find documentation
- [ ] GTM access granted to team members
- [ ] GA4 access granted to relevant team
- [ ] GSC access granted to relevant team
- [ ] Quick Start guide shared
- [ ] Setup guide shared
- [ ] Example code reviewed by team

---

## ✅ Optional Advanced Features

### Enhanced Tracking
- [ ] Video interaction tracking implemented
- [ ] File download tracking implemented
- [ ] Search query tracking implemented
- [ ] Social share tracking implemented
- [ ] Error/exception tracking implemented

### Performance Tracking
- [ ] Core Web Vitals tracking
- [ ] Custom timing events
- [ ] API performance tracking

### Conversion Tracking
- [ ] Lead form submissions tracked as conversions
- [ ] Newsletter signups tracked
- [ ] Download conversions configured
- [ ] Custom conversion events defined

### User Properties
- [ ] User type tracked (anonymous, authenticated)
- [ ] User segments defined
- [ ] Enhanced measurement enabled
- [ ] User ID implemented (if authenticated)

---

## 🎯 Success Criteria

Your implementation is complete when:

✅ **Tracking Works:**
- Pageviews tracked on every route change
- Scroll depth events fire at milestones
- Button clicks tracked correctly
- Form submissions tracked

✅ **Data Appears:**
- Events visible in GA4 Realtime
- Events visible in GA4 DebugView
- Data appears in GA4 standard reports
- No errors in GTM or GA4

✅ **SEO Configured:**
- Search Console verified
- Sitemap submitted and parsed
- Canonical URLs updating
- Meta tags dynamic

✅ **Production Ready:**
- No console errors
- GTM container published
- Code deployed
- Team trained

---

## 📊 Key Metrics to Monitor

After 7 days:
- [ ] Total pageviews
- [ ] Average engagement time
- [ ] Bounce rate
- [ ] Top events
- [ ] User demographics

After 30 days:
- [ ] Search Console impressions
- [ ] Search Console clicks
- [ ] Average CTR from search
- [ ] Indexed pages count
- [ ] GA4 user retention

---

## 🚨 Common Issues Checklist

If tracking not working:
- [ ] Check GTM Container ID is correct
- [ ] Check GA4 Measurement ID is correct
- [ ] Verify GTM script loads (Network tab)
- [ ] Check dataLayer in console: `window.dataLayer`
- [ ] Verify PageTracker component renders
- [ ] Check for ad blockers
- [ ] Review browser console for errors
- [ ] Test in incognito mode
- [ ] Clear cache and retry

If duplicate events:
- [ ] Only one PageTracker component
- [ ] No duplicate GTM containers
- [ ] No old gtag.js code
- [ ] React.StrictMode disabled in production

---

## 📝 Notes

**Date Implemented:** _______________

**Implemented By:** _______________

**GTM Container ID:** GTM-_______________

**GA4 Measurement ID:** G-_______________

**Production URL:** _______________

**Issues Encountered:**
- 
- 
- 

**Additional Customizations:**
- 
- 
- 

---

**Save this checklist and refer back as needed!**

**Date Completed:** _______________
