# 🚀 Quick Start Guide - GTM/GA4 Setup

**Complete in 15 minutes** ⏱️

---

## 📝 Step 1: Replace Placeholder IDs (2 minutes)

### File: `index.html`

✅ **Already Configured:**
- GTM Container ID: `GTM-5GCSP6H7`
- GA4 Measurement ID (in GTM): `G-DN204S2BBC`

**Only need to update:**
```html
<!-- Line 37: Replace with your Google Search Console verification code -->
content="YOUR_VERIFICATION_CODE_HERE"  →  content="abc123xyz..."
```

---

## 🎯 Step 2: Configure GTM Container (8 minutes)

### A. Create Variables (2 min)
Go to **Variables → User-Defined Variables → New**

| Name | Type | Data Layer Variable Name |
|------|------|--------------------------|
| Page Path | Data Layer Variable | `page_path` |
| Page Location | Data Layer Variable | `page_location` |
| Page Title | Data Layer Variable | `page_title` |
| Scroll Percent | Data Layer Variable | `scroll_percent` |
| Button Text | Data Layer Variable | `button_text` |
| Button URL | Data Layer Variable | `button_url` |
| Form ID | Data Layer Variable | `form_id` |
| Form Name | Data Layer Variable | `form_name` |

### B. Create Triggers (2 min)
Go to **Triggers → New**

| Name | Type | Event Name |
|------|------|------------|
| SPA Pageview | Custom Event | `pageview` |
| Scroll Depth | Custom Event | `scroll_depth` |
| CTA Click | Custom Event | `cta_click` |
| Form Submit | Custom Event | `form_submit` |

### C. Create GA4 Configuration Tag (2 min)
Go to **Tags → New**

```
Tag Name: GA4 Configuration
Tag Type: Google Analytics: GA4 Configuration
Measurement ID: G-DN204S2BBC

⚠️ CRITICAL: UNCHECK "Send a pageview event when this configuration loads"

Fields to Set:
  page_path → {{Page Path}}
  page_location → {{Page Location}}
  page_title → {{Page Title}}

Triggering (add all 3):
  1. All Pages (initial load)
  2. History Change (⚠️ CRITICAL for React!)
  3. SPA Pageview (custom event)
```

### D. Create Event Tags (2 min)
Go to **Tags → New** (create for each event)

**GA4 - Scroll Depth:**
```
Tag Type: GA4 Event
Configuration Tag: {{GA4 Configuration}}
Event Name: scroll
Parameters:
  scroll_percent → {{Scroll Percent}}
  page_path → {{Page Path}}
Trigger: Scroll Depth
```

**GA4 - CTA Click:**
```
Tag Type: GA4 Event
Configuration Tag: {{GA4 Configuration}}
Event Name: cta_click
Parameters:
  button_text → {{Button Text}}
  button_url → {{Button URL}}
  page_path → {{Page Path}}
Trigger: CTA Click
```

**GA4 - Form Submit:**
```
Tag Type: GA4 Event
Configuration Tag: {{GA4 Configuration}}
Event Name: form_submit
Parameters:
  form_id → {{Form ID}}
  form_name → {{Form Name}}
  page_path → {{Page Path}}
Trigger: Form Submit
```

---

## 🧪 Step 3: Test (3 minutes)

1. In GTM, click **Preview**
2. Enter your site URL
3. Navigate between pages → Check for `pageview` events
4. Scroll down → Check for `scroll_depth` events at 25%, 50%, 75%, 100%
5. Click tracked buttons → Check for `cta_click` events
6. Submit forms → Check for `form_submit` events

---

## ✅ Step 4: Verify in GA4 (2 minutes)

1. Go to GA4 → **Reports → Realtime**
2. Look for your test session
3. Verify events appear:
   - ✅ `page_view`
   - ✅ `scroll`
   - ✅ `cta_click`
   - ✅ `form_submit`

**OR use DebugView:**
1. GA4 → **Configure → DebugView**
2. Watch events in real-time with full parameters

---

## 🎉 Step 5: Publish

1. In GTM, click **Submit**
2. Version Name: `Initial GA4 Setup - SPA Tracking`
3. Click **Publish**

---

## 💡 Quick Usage Examples

### Track Pageviews (Already Done!)
```tsx
// In App.tsx - already implemented
import PageTracker from './components/PageTracker';

<PageTracker /> // ✅ Tracks all route changes automatically
```

### Track Scroll Depth
```tsx
import { useScrollDepth } from '@/hooks/useScrollDepth';

function HomePage() {
  useScrollDepth(); // ✅ Tracks 25%, 50%, 75%, 100%
  return <div>Content</div>;
}
```

### Track Button Clicks
```tsx
import { TrackedButton } from '@/utils/eventTracking';

<TrackedButton
  trackingLabel="Join Now"
  trackingCategory="hero_section"
  trackingUrl="/signup"
  onClick={handleJoin}
>
  Join Now
</TrackedButton>
```

### Track Form Submissions
```tsx
import { TrackedForm } from '@/utils/eventTracking';

<TrackedForm
  formId="contact_form"
  formName="Contact Form"
  onSubmit={handleSubmit}
>
  <input type="email" name="email" required />
  <button type="submit">Submit</button>
</TrackedForm>
```

### Manual Event Tracking
```tsx
import { trackCTAClick, trackFormSubmit } from '@/utils/gtm';

// Track any action
trackCTAClick('Download Brochure', '/brochure.pdf', 'downloads');
trackFormSubmit('newsletter', 'Newsletter Form', true);
```

---

## 🔍 Troubleshooting

### No pageviews on navigation?
- ✅ Check PageTracker is in App.tsx
- ✅ Check GTM Preview for `pageview` custom events
- ✅ Verify GA4 Config Tag has pageview DISABLED

### Events not in GA4?
- ✅ Check GA4 Measurement ID is correct
- ✅ Use DebugView for real-time data
- ✅ Wait up to 24 hours for reports

### Duplicate events?
- ✅ Ensure only one PageTracker component
- ✅ Check for duplicate GTM containers

---

## 📚 Documentation

**Full documentation:**
- [GTM_GA4_SETUP_GUIDE.md](./GTM_GA4_SETUP_GUIDE.md) - Complete setup guide
- [GTM_CONTAINER_CONFIG.md](./GTM_CONTAINER_CONFIG.md) - GTM configuration reference
- [TRACKING_EXAMPLES.tsx](./TRACKING_EXAMPLES.tsx) - Code examples

**Files created:**
- `src/components/PageTracker.tsx` - SPA pageview tracking
- `src/utils/gtm.ts` - GTM utilities
- `src/utils/eventTracking.tsx` - Tracked components
- `src/hooks/useScrollDepth.ts` - Scroll tracking hook
- `src/utils/seo.ts` - SEO utilities

**Modified files:**
- `index.html` - GTM script added
- `src/App.tsx` - PageTracker integrated

---

## ⚡ Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🎯 Expected Results

After setup, you'll have:

✅ Automatic pageview tracking on all route changes  
✅ Scroll depth tracking (25%, 50%, 75%, 100%)  
✅ CTA button click tracking  
✅ Form submission tracking  
✅ Error tracking capabilities  
✅ SEO optimization with canonical URLs  
✅ Google Search Console integration  
✅ Production-ready sitemap  

---

## 🆘 Need Help?

**Check these in order:**

1. **GTM Preview Mode** - Shows exactly what's firing
2. **Browser Console** - Check for JavaScript errors
3. **GA4 DebugView** - Real-time event verification
4. **Network Tab** - Verify GTM script loads
5. **Documentation** - See full guides above

---

## ✨ Pro Tips

💡 **Development Mode** - Events are logged to console  
💡 **Test Thoroughly** - Use GTM Preview before publishing  
💡 **Monitor Data** - Check GA4 reports regularly  
💡 **Keep Updated** - Update sitemap when adding new routes  
💡 **Privacy First** - Never track PII (emails, names, etc.)  

---

**You're all set! Happy tracking! 📊🚀**
