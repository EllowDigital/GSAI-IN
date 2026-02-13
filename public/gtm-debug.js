/**
 * GTM & GA4 Diagnostic Script
 * 
 * HOW TO USE:
 * 1. Open your website in Chrome/Firefox
 * 2. Press F12 to open Developer Console
 * 3. Copy this entire file and paste into Console
 * 4. Press Enter
 * 5. Read the diagnostic results
 */

(function() {
  console.clear();
  console.log('%c🔍 GTM & GA4 DIAGNOSTIC REPORT', 'background: #4285f4; color: white; font-size: 20px; padding: 10px;');
  console.log('===============================================\n');

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // Test 1: Check if dataLayer exists
  console.log('%c1️⃣ Checking if GTM dataLayer exists...', 'font-weight: bold; font-size: 14px;');
  if (typeof window.dataLayer !== 'undefined') {
    results.passed.push('✅ dataLayer exists');
    console.log('%c   ✅ PASS: dataLayer exists', 'color: green;');
    console.log(`   📊 dataLayer has ${window.dataLayer.length} events`);
  } else {
    results.failed.push('❌ dataLayer does NOT exist');
    console.log('%c   ❌ FAIL: dataLayer does NOT exist', 'color: red;');
    console.log('%c   💡 FIX: Check if GTM script is in index.html', 'color: orange;');
  }
  console.log('');

  // Test 2: Check GTM Container ID
  console.log('%c2️⃣ Checking GTM Container ID...', 'font-weight: bold; font-size: 14px;');
  const expectedGTMId = 'GTM-5GCSP6H7';
  const htmlContent = document.documentElement.innerHTML;
  
  if (htmlContent.includes(expectedGTMId)) {
    results.passed.push(`✅ GTM Container ID found: ${expectedGTMId}`);
    console.log(`%c   ✅ PASS: GTM Container ID found: ${expectedGTMId}`, 'color: green;');
  } else if (htmlContent.includes('GTM-')) {
    const matches = htmlContent.match(/GTM-[A-Z0-9]+/g);
    const uniqueIds = [...new Set(matches)];
    results.warnings.push(`⚠️ Found different GTM ID(s): ${uniqueIds.join(', ')}`);
    console.log(`%c   ⚠️ WARNING: Found different GTM ID(s): ${uniqueIds.join(', ')}`, 'color: orange;');
    console.log(`%c   Expected: ${expectedGTMId}`, 'color: orange;');
  } else {
    results.failed.push('❌ No GTM Container ID found in HTML');
    console.log('%c   ❌ FAIL: No GTM Container ID found in HTML', 'color: red;');
  }
  console.log('');

  // Test 3: Check for pageview events
  console.log('%c3️⃣ Checking for pageview events...', 'font-weight: bold; font-size: 14px;');
  if (window.dataLayer) {
    const pageviewEvents = window.dataLayer.filter(item => item.event === 'pageview');
    if (pageviewEvents.length > 0) {
      results.passed.push(`✅ Found ${pageviewEvents.length} pageview event(s)`);
      console.log(`%c   ✅ PASS: Found ${pageviewEvents.length} pageview event(s)`, 'color: green;');
      console.log('   📋 Recent pageview events:');
      pageviewEvents.slice(-3).forEach((event, index) => {
        console.log(`      ${index + 1}. ${event.page_path || event.page_location || 'N/A'}`);
      });
    } else {
      results.warnings.push('⚠️ No pageview events found yet');
      console.log('%c   ⚠️ WARNING: No pageview events found yet', 'color: orange;');
      console.log('%c   💡 Navigate to another page to trigger pageview', 'color: orange;');
    }
  }
  console.log('');

  // Test 4: Check GA4 Measurement ID
  console.log('%c4️⃣ Checking GA4 Measurement ID...', 'font-weight: bold; font-size: 14px;');
  const expectedGA4Id = 'G-DN204S2BBC';
  
  if (htmlContent.includes(expectedGA4Id)) {
    results.passed.push(`✅ GA4 Measurement ID found: ${expectedGA4Id}`);
    console.log(`%c   ✅ PASS: GA4 Measurement ID found: ${expectedGA4Id}`, 'color: green;');
  } else {
    results.warnings.push('⚠️ GA4 ID not in HTML (this is OK if configured in GTM)');
    console.log('%c   ℹ️ INFO: GA4 ID not in HTML', 'color: blue;');
    console.log('%c   This is OK - GA4 should be configured in GTM, not HTML', 'color: blue;');
  }
  console.log('');

  // Test 5: Check for GTM script tags
  console.log('%c5️⃣ Checking GTM script tags...', 'font-weight: bold; font-size: 14px;');
  const scripts = Array.from(document.querySelectorAll('script'));
  const gtmScripts = scripts.filter(s => s.src && s.src.includes('googletagmanager.com/gtm.js'));
  
  if (gtmScripts.length > 0) {
    results.passed.push(`✅ GTM script tag loaded (${gtmScripts.length} found)`);
    console.log(`%c   ✅ PASS: GTM script tag loaded (${gtmScripts.length} found)`, 'color: green;');
    gtmScripts.forEach(script => {
      console.log(`   📄 ${script.src}`);
    });
  } else {
    results.failed.push('❌ GTM script tag NOT found');
    console.log('%c   ❌ FAIL: GTM script tag NOT found', 'color: red;');
    console.log('%c   💡 FIX: Add GTM script to index.html <head>', 'color: orange;');
  }
  console.log('');

  // Test 6: Check network requests to GA4
  console.log('%c6️⃣ Checking GA4 network requests...', 'font-weight: bold; font-size: 14px;');
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    const ga4Requests = resources.filter(r => 
      r.name.includes('google-analytics.com') || 
      r.name.includes('/g/collect') ||
      r.name.includes('/collect?')
    );
    
    if (ga4Requests.length > 0) {
      results.passed.push(`✅ GA4 collecting data (${ga4Requests.length} requests)`);
      console.log(`%c   ✅ PASS: GA4 collecting data (${ga4Requests.length} requests)`, 'color: green;');
      console.log('   📡 Recent GA4 requests:');
      ga4Requests.slice(-3).forEach((req, index) => {
        console.log(`      ${index + 1}. ${req.name.substring(0, 80)}...`);
      });
    } else {
      results.warnings.push('⚠️ No GA4 network requests detected');
      console.log('%c   ⚠️ WARNING: No GA4 network requests detected', 'color: orange;');
      console.log('%c   💡 This could mean:', 'color: orange;');
      console.log('%c      • GTM container not published', 'color: orange;');
      console.log('%c      • GA4 tag not configured in GTM', 'color: orange;');
      console.log('%c      • GA4 tag not firing', 'color: orange;');
    }
  }
  console.log('');

  // Test 7: Check React Router
  console.log('%c7️⃣ Checking React Router...', 'font-weight: bold; font-size: 14px;');
  const rootDiv = document.getElementById('root');
  if (rootDiv && rootDiv.innerHTML.length > 100) {
    results.passed.push('✅ React app is mounted');
    console.log('%c   ✅ PASS: React app is mounted', 'color: green;');
  } else {
    results.warnings.push('⚠️ React app may not be loaded');
    console.log('%c   ⚠️ WARNING: React app may not be loaded yet', 'color: orange;');
  }
  console.log('');

  // Test 8: Check dataLayer events
  console.log('%c8️⃣ Analyzing dataLayer events...', 'font-weight: bold; font-size: 14px;');
  if (window.dataLayer && window.dataLayer.length > 0) {
    const eventTypes = {};
    window.dataLayer.forEach(item => {
      if (item.event) {
        eventTypes[item.event] = (eventTypes[item.event] || 0) + 1;
      }
    });
    
    console.log('   📊 Event Summary:');
    Object.entries(eventTypes).forEach(([event, count]) => {
      console.log(`      • ${event}: ${count} time(s)`);
    });
    
    // Check for critical events
    if (eventTypes['gtm.js']) {
      results.passed.push('✅ GTM initialized (gtm.js event found)');
    }
    if (eventTypes['pageview']) {
      results.passed.push('✅ PageTracker is working (pageview events found)');
    } else {
      results.warnings.push('⚠️ No pageview events - PageTracker may not be active');
    }
  }
  console.log('');

  // SUMMARY
  console.log('\n');
  console.log('%c📋 DIAGNOSTIC SUMMARY', 'background: #34a853; color: white; font-size: 18px; padding: 10px;');
  console.log('===============================================\n');
  
  console.log(`%c✅ PASSED TESTS (${results.passed.length}):`, 'color: green; font-weight: bold; font-size: 14px;');
  results.passed.forEach(item => console.log(`   ${item}`));
  console.log('');
  
  if (results.warnings.length > 0) {
    console.log(`%c⚠️ WARNINGS (${results.warnings.length}):`, 'color: orange; font-weight: bold; font-size: 14px;');
    results.warnings.forEach(item => console.log(`   ${item}`));
    console.log('');
  }
  
  if (results.failed.length > 0) {
    console.log(`%c❌ FAILED TESTS (${results.failed.length}):`, 'color: red; font-weight: bold; font-size: 14px;');
    results.failed.forEach(item => console.log(`   ${item}`));
    console.log('');
  }

  // RECOMMENDATIONS
  console.log('\n');
  console.log('%c💡 RECOMMENDATIONS', 'background: #fbbc04; color: black; font-size: 18px; padding: 10px;');
  console.log('===============================================\n');

  if (results.failed.length === 0 && results.warnings.length === 0) {
    console.log('%c   🎉 Everything looks good!', 'color: green; font-size: 16px; font-weight: bold;');
    console.log('%c   Your GTM and GA4 setup appears to be working correctly.', 'color: green;');
    console.log('');
    console.log('   Next steps:');
    console.log('   1. Check GA4 Real-Time reports: https://analytics.google.com');
    console.log('   2. Navigate through your site and verify pageviews appear');
    console.log('   3. Test GTM Preview mode: https://tagmanager.google.com');
  } else {
    console.log('   Based on the diagnostic results, here are the issues to fix:\n');
    
    if (results.failed.some(f => f.includes('dataLayer does NOT exist'))) {
      console.log('%c   🔧 CRITICAL: Add GTM script to index.html', 'color: red; font-weight: bold;');
      console.log('      The GTM script is missing or not loading correctly.');
      console.log('      Check: index.html <head> section');
      console.log('');
    }
    
    if (results.warnings.some(w => w.includes('No pageview events'))) {
      console.log('%c   🔧 ACTION NEEDED: PageTracker not firing', 'color: orange; font-weight: bold;');
      console.log('      Solutions:');
      console.log('      1. Verify PageTracker component is imported in App.tsx');
      console.log('      2. Verify PageTracker is rendered in App.tsx');
      console.log('      3. Navigate to another page to trigger tracking');
      console.log('');
    }
    
    if (results.warnings.some(w => w.includes('No GA4 network requests'))) {
      console.log('%c   🔧 CRITICAL: Configure GTM Container', 'color: red; font-weight: bold;');
      console.log('      Your GTM container needs to be set up:');
      console.log('      1. Go to: https://tagmanager.google.com');
      console.log('      2. Open container: GTM-5GCSP6H7');
      console.log('      3. Create GA4 Configuration Tag');
      console.log('      4. Add Measurement ID: G-DN204S2BBC');
      console.log('      5. PUBLISH the container');
      console.log('      Follow the official GTM and GA4 documentation for detailed setup steps');
      console.log('');
    }
  }

  // Quick action commands
  console.log('\n');
  console.log('%c🚀 QUICK TEST COMMANDS', 'background: #ea4335; color: white; font-size: 18px; padding: 10px;');
  console.log('===============================================\n');
  console.log('Copy and paste these commands to test:\n');
  console.log('%c// Check dataLayer contents:', 'color: blue;');
  console.log('window.dataLayer\n');
  console.log('%c// Filter pageview events:', 'color: blue;');
  console.log('window.dataLayer.filter(e => e.event === "pageview")\n');
  console.log('%c// Manually trigger pageview:', 'color: blue;');
  console.log('window.dataLayer.push({event: "pageview", page_path: "/test", page_location: window.location.href, page_title: "Test"})\n');
  console.log('%c// Watch for new events (run this, then navigate):', 'color: blue;');
  console.log('const oldLength = window.dataLayer.length; setTimeout(() => console.log("New events:", window.dataLayer.slice(oldLength)), 2000)\n');

  console.log('\n');
  console.log('%c📚 DOCUMENTATION', 'background: #4285f4; color: white; font-size: 18px; padding: 10px;');
  console.log('===============================================\n');
  console.log('   📖 For setup and quick-start instructions, refer to your project\'s README or internal documentation.');
  console.log('\n');
  
  console.log('%c=== END OF DIAGNOSTIC REPORT ===', 'font-size: 14px; font-weight: bold;');
  console.log('');

  // Return summary object
  return {
    passed: results.passed.length,
    warnings: results.warnings.length,
    failed: results.failed.length,
    details: results
  };
})();
