# Google Tag Manager Container Configuration Reference

This document provides the exact configuration needed for your GTM container to work with the React SPA tracking implementation.

---

## 📋 Quick Setup Checklist

- [ ] Variables configured (8 total)
- [ ] Triggers configured (7 total)
- [ ] Tags configured (7 total)
- [ ] Container tested in Preview mode
- [ ] Container published

---

## 🔧 VARIABLES TO CREATE

### Built-in Variables (Enable These)

Go to **Variables → Built-in Variables → Configure**

Enable:
- ✅ Page URL
- ✅ Page Hostname
- ✅ Page Path
- ✅ Referrer
- ✅ Click Element
- ✅ Click URL
- ✅ Error Message

### User-Defined Variables

#### 1. Page Path (DLV)
```
Variable Name: Page Path
Variable Type: Data Layer Variable
Data Layer Variable Name: page_path
Default Value: {{Page Path}} (built-in)
```

#### 2. Page Location (DLV)
```
Variable Name: Page Location
Variable Type: Data Layer Variable
Data Layer Variable Name: page_location
Default Value: {{Page URL}}
```

#### 3. Page Title (DLV)
```
Variable Name: Page Title
Variable Type: Data Layer Variable
Data Layer Variable Name: page_title
Default Value: (blank)
```

#### 4. Scroll Percent (DLV)
```
Variable Name: Scroll Percent
Variable Type: Data Layer Variable
Data Layer Variable Name: scroll_percent
Default Value: 0
```

#### 5. Button Text (DLV)
```
Variable Name: Button Text
Variable Type: Data Layer Variable
Data Layer Variable Name: button_text
Default Value: (blank)
```

#### 6. Button URL (DLV)
```
Variable Name: Button URL
Variable Type: Data Layer Variable
Data Layer Variable Name: button_url
Default Value: (blank)
```

#### 7. Form ID (DLV)
```
Variable Name: Form ID
Variable Type: Data Layer Variable
Data Layer Variable Name: form_id
Default Value: (blank)
```

#### 8. Form Name (DLV)
```
Variable Name: Form Name
Variable Type: Data Layer Variable
Data Layer Variable Name: form_name
Default Value: (blank)
```

---

## 🎯 TRIGGERS TO CREATE

### 1. All Pages (Built-in)
```
Trigger Name: All Pages
Trigger Type: Page View
This trigger fires on: All Page Views
```
*This is a built-in trigger - no need to create*

### 2. History Change (Built-in) ⚠️ CRITICAL FOR REACT
```
Trigger Name: History Change
Trigger Type: History Change
This trigger fires on: All History Changes
```
*This is a built-in trigger - just enable it*

**WHY THIS IS CRITICAL FOR REACT SPAs:**
- React Router uses the History API for navigation
- Browser back/forward buttons trigger history changes
- Without this trigger, back/forward navigation won't be tracked
- This complements our custom pageview events

### 3. SPA Pageview
```
Trigger Name: SPA Pageview
Trigger Type: Custom Event
Event name: pageview
This trigger fires on: All Custom Events
```

### 4. Scroll Depth Tracking
```
Trigger Name: Scroll Depth
Trigger Type: Custom Event
Event name: scroll_depth
This trigger fires on: All Custom Events
```

### 5. CTA Click
```
Trigger Name: CTA Click
Trigger Type: Custom Event
Event name: cta_click
This trigger fires on: All Custom Events
```

### 6. Form Submit
```
Trigger Name: Form Submit
Trigger Type: Custom Event
Event name: form_submit
This trigger fires on: All Custom Events
```

### 7. Form Error
```
Trigger Name: Form Error
Trigger Type: Custom Event
Event name: form_error
This trigger fires on: All Custom Events
```

### 7. Outbound Click
```
Trigger Name: Outbound Click
Trigger Type: Custom Event
Event name: outbound_click
This trigger fires on: All Custom Events
```

---

## 🏷️ TAGS TO CREATE

### 1. GA4 Configuration Tag

```
Tag Name: GA4 Configuration
Tag Type: Google Analytics: GA4 Configuration
Measurement ID: G-DN204S2BBC

Configuration:
☑️ Configuration Settings
  ☐ Send a pageview event when this configuration loads (UNCHECK THIS!)
  
Fields to Set:
  page_path: {{Page Path}}
  page_location: {{Page Location}}
  page_title: {{Page Title}}

Advanced Settings:
  Tag firing options: Once per page

Triggering:
  Trigger 1: All Pages (initial page load)
  Trigger 2: History Change (⚠️ CRITICAL for React SPAs!)
  Trigger 3: SPA Pageview (our custom event)
```

**CRITICAL:** 
- The "Send a pageview event when this configuration loads" MUST be unchecked!
- For React SPAs, you MUST add the "History Change" trigger
- This ensures tracking works on browser back/forward buttons

### 2. GA4 Event - Pageview

```
Tag Name: GA4 - Pageview
Tag Type: Google Analytics: GA4 Event
Configuration Tag: {{GA4 Configuration}}
Event Name: page_view

Event Parameters:
  page_path: {{Page Path}}
  page_location: {{Page Location}}
  page_title: {{Page Title}}

Triggering:
  Trigger: SPA Pageview
```

### 3. GA4 Event - Scroll Depth

```
Tag Name: GA4 - Scroll Depth
Tag Type: Google Analytics: GA4 Event
Configuration Tag: {{GA4 Configuration}}
Event Name: scroll

Event Parameters:
  scroll_percent: {{Scroll Percent}}
  page_path: {{Page Path}}

Triggering:
  Trigger: Scroll Depth
```

### 4. GA4 Event - CTA Click

```
Tag Name: GA4 - CTA Click
Tag Type: Google Analytics: GA4 Event
Configuration Tag: {{GA4 Configuration}}
Event Name: cta_click

Event Parameters:
  button_text: {{Button Text}}
  button_url: {{Button URL}}
  page_path: {{Page Path}}

Triggering:
  Trigger: CTA Click
```

### 5. GA4 Event - Form Submit

```
Tag Name: GA4 - Form Submit
Tag Type: Google Analytics: GA4 Event
Configuration Tag: {{GA4 Configuration}}
Event Name: form_submit

Event Parameters:
  form_id: {{Form ID}}
  form_name: {{Form Name}}
  page_path: {{Page Path}}

Triggering:
  Trigger: Form Submit
```

### 6. GA4 Event - Form Error

```
Tag Name: GA4 - Form Error
Tag Type: Google Analytics: GA4 Event
Configuration Tag: {{GA4 Configuration}}
Event Name: form_error

Event Parameters:
  form_id: {{Form ID}}
  form_name: {{Form Name}}
  page_path: {{Page Path}}

Triggering:
  Trigger: Form Error
```

### 7. GA4 Event - Outbound Click

```
Tag Name: GA4 - Outbound Click
Tag Type: Google Analytics: GA4 Event
Configuration Tag: {{GA4 Configuration}}
Event Name: click

Event Parameters:
  link_url: {{Button URL}}
  link_text: {{Button Text}}
  page_path: {{Page Path}}
  outbound: true

Triggering:
  Trigger: Outbound Click
```

---

## 🧪 TESTING YOUR CONFIGURATION

### Step 1: Enable Preview Mode

1. In GTM, click **Preview** button (top right)
2. Enter your website URL: `http://localhost:5173` or your production URL
3. Click **Connect**
4. New tab opens with GTM Debug panel

### Step 2: Test Pageview Tracking

1. Navigate to homepage
2. In GTM Debug, check **Summary** tab
3. Look for `pageview` custom event
4. Click on the event
5. Verify:
   - **Tags Fired:** GA4 Configuration, GA4 - Pageview
   - **Variables:** Page Path, Page Location, Page Title are correct

6. Navigate to another page (e.g., /events)
7. Verify another `pageview` event fires
8. Check that Page Path updates to `/events`

### Step 3: Test Scroll Depth

1. On any page, scroll down slowly
2. Watch for `scroll_depth` events at 25%, 50%, 75%, 100%
3. Verify:
   - **Tags Fired:** GA4 - Scroll Depth
   - **Variables:** Scroll Percent shows correct value (25, 50, 75, or 100)

### Step 4: Test CTA Click

1. Click any button/link you've wrapped with `TrackedButton` or `trackCTAClick`
2. Look for `cta_click` custom event
3. Verify:
   - **Tags Fired:** GA4 - CTA Click
   - **Variables:** Button Text and Button URL are correct

### Step 5: Test Form Submit

1. Fill out and submit a form wrapped with `TrackedForm`
2. Look for `form_submit` custom event
3. Verify:
   - **Tags Fired:** GA4 - Form Submit
   - **Variables:** Form ID and Form Name are correct

### Step 6: Verify in GA4

1. Go to GA4 → **Reports → Realtime**
2. Look for events in the **Event count by Event name** card
3. You should see:
   - `page_view`
   - `scroll`
   - `cta_click`
   - `form_submit`
   - etc.

4. Click on an event to see event parameters

**Alternative:** Use **DebugView** in GA4 (Configure → DebugView)

---

## 📊 EXPECTED DATALAYER STRUCTURE

When your React app pushes events to dataLayer, they should look like this:

### Pageview Event
```javascript
{
  event: 'pageview',
  page_path: '/events',
  page_location: 'https://ghataksportsacademy.com/events',
  page_title: 'Events | Ghatak Sports Academy India™'
}
```

### Scroll Depth Event
```javascript
{
  event: 'scroll_depth',
  scroll_percent: 50,
  page_path: '/events'
}
```

### CTA Click Event
```javascript
{
  event: 'cta_click',
  button_text: 'Join Now',
  button_url: '/signup',
  section: 'hero_section',
  page_path: '/'
}
```

### Form Submit Event
```javascript
{
  event: 'form_submit',
  form_id: 'contact_form',
  form_name: 'Contact Form',
  form_success: true,
  page_path: '/contact'
}
```

---

## 🔍 DEBUGGING TIPS

### Issue: Pageviews not tracking on route change

**Check:**
1. GTM Preview → Is `pageview` custom event appearing?
2. Variables → Is `page_path` updating?
3. Triggers → Is "SPA Pageview" trigger firing?
4. Tags → Is GA4 Configuration tag firing?
5. React → Is `<PageTracker />` component rendered?

### Issue: Events not appearing in GA4

**Check:**
1. GA4 Measurement ID is correct in GTM
2. GA4 Configuration tag is triggered properly
3. Wait for data (can take 1-24 hours in standard reports)
4. Use DebugView for real-time verification
5. Check browser console for errors

### Issue: Duplicate events

**Check:**
1. Only one `<PageTracker />` component rendered
2. No duplicate GTM containers
3. No old gtag.js code
4. React.StrictMode not causing double renders in production

### Issue: Variables showing undefined

**Check:**
1. Data Layer Variable names match exactly (case-sensitive)
2. Event is pushed to dataLayer before GTM processes it
3. Default values are set for variables
4. Test by manually pushing to console:
   ```javascript
   window.dataLayer.push({
     event: 'pageview',
     page_path: '/test',
     page_location: window.location.href,
     page_title: document.title
   });
   ```

---

## 📝 CONTAINER BEST PRACTICES

### Naming Conventions

**Variables:**
- Format: `[Type] - [Name]`
- Example: `DLV - Page Path`, `DLV - Button Text`

**Triggers:**
- Format: `[Event Type]`
- Example: `SPA Pageview`, `Scroll Depth`, `CTA Click`

**Tags:**
- Format: `GA4 - [Event Name]`
- Example: `GA4 - Pageview`, `GA4 - Scroll Depth`

### Tag Firing Priority

If you need specific firing order:
1. Go to Tag Settings → Advanced Settings
2. Set **Tag firing priority** (higher numbers fire first)
3. Typical setup:
   - GA4 Configuration: Priority 100
   - GA4 Events: Priority 50

### Version Control

When publishing:
1. Click **Submit**
2. **Version Name:** Use semantic versioning or date
   - Example: `v1.0.0 - Initial GA4 Setup`
   - Example: `2026-02-07 - Added Form Tracking`
3. **Version Description:** Detailed notes
   - List all changes
   - Note what was added/removed/modified

---

## 🚀 DEPLOYMENT CHECKLIST

Before going live:

- [ ] All placeholder IDs replaced with actual IDs
- [ ] All variables tested in Preview mode
- [ ] All triggers firing correctly
- [ ] All tags sending data to GA4
- [ ] No console errors
- [ ] DebugView showing events in GA4
- [ ] Consent management configured (if needed)
- [ ] Team members have been given access
- [ ] Documentation updated
- [ ] Backup of old container exported (if replacing)

**Final Steps:**
1. Test thoroughly in Preview mode
2. Review all container settings
3. Click **Submit** → **Publish**
4. Monitor GA4 Realtime reports for 15-30 minutes
5. Check for errors and verify data flow

---

## 📚 ADDITIONAL GTM FEATURES

### Optional Advanced Configurations

#### 1. Error Tracking
```
Tag Name: GA4 - JavaScript Error
Tag Type: Google Analytics: GA4 Event
Configuration Tag: {{GA4 Configuration}}
Event Name: exception

Event Parameters:
  description: {{Error Message}}
  fatal: false

Triggering:
  Trigger Type: JavaScript Error
```

#### 2. Click Tracking (All Clicks)
```
Tag Name: GA4 - All Clicks
Tag Type: Google Analytics: GA4 Event
Configuration Tag: {{GA4 Configuration}}
Event Name: click

Event Parameters:
  link_text: {{Click Text}}
  link_url: {{Click URL}}
  page_path: {{Page Path}}

Triggering:
  Trigger Type: All Elements
  Some Clicks where:
    Click URL matches RegEx .*
```

#### 3. Consent Management
```
Tag Name: GA4 Configuration (Consent)
Additional Settings:
  Consent Settings:
    ☑️ Require consent for tag to fire
    Consent Types:
      - analytics_storage
      - ad_storage (optional)
```

---

## 🎓 RESOURCES

- [GTM Developer Guide](https://developers.google.com/tag-platform/tag-manager)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9267735)
- [DataLayer Documentation](https://developers.google.com/tag-platform/tag-manager/datalayer)
- [GTM Recipes](https://www.simoahava.com/)

---

## ✅ SUCCESS CRITERIA

You'll know your setup is working when:

1. **GTM Preview Mode:**
   - ✅ `pageview` events fire on every route change
   - ✅ Custom events appear for user interactions
   - ✅ All tags fire with correct variables
   - ✅ No errors in console

2. **GA4 DebugView:**
   - ✅ Events appear in real-time
   - ✅ Event parameters are correct
   - ✅ User engagement is tracked
   - ✅ Events have proper timestamps

3. **GA4 Reports:**
   - ✅ Pageviews appear in Realtime reports
   - ✅ Events appear in Events report
   - ✅ User behavior tracked in User Explorer
   - ✅ No duplicate events

**Congratulations! Your GTM container is ready for production! 🎉**
