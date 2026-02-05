# Fix: GoogleSignInButton Not Rendering

**Date:** 22 tháng 10, 2025  
**Issue:** Google Sign-In button không hiển thị trên UI  
**Status:** ✅ **FIXED**

---

## 🔍 Problem Analysis

### Symptoms
- Google Sign-In button div visible nhưng không có Google button render
- Container có height nhưng empty
- Không thấy lỗi console

### Root Cause
**Race condition giữa 2 useEffect:**

```tsx
// useEffect 1: Load script
useEffect(() => {
  // Set scriptLoadedRef.current = true (inside callback)
}, [])

// useEffect 2: Render button
useEffect(() => {
  if (window.google && scriptLoadedRef.current) {  // ❌ PROBLEM!
    renderButton(...)
  }
}, [])  // ❌ Never re-runs!
```

**Timeline của bug:**
```
1. Component mounts
   ├─ useEffect 1 runs → script appends → onload scheduled
   └─ useEffect 2 runs → scriptLoadedRef.current = false → skip render ❌

2. Script loads (async)
   └─ script.onload → scriptLoadedRef.current = true
      BUT useEffect 2 already ran with empty dependency!
      
3. Result: Button never renders ❌
```

---

## ✅ Solution

### Key Changes

**Before (Bug):**
```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const scriptLoadedRef = useRef(false);  // ❌ Only ref, no state

// Script loading
useEffect(() => {
  script.onload = () => {
    scriptLoadedRef.current = true;  // ❌ No component update
  }
}, [])

// Button rendering
useEffect(() => {
  if (window.google && scriptLoadedRef.current) {  // ❌ Can't trigger re-render
    renderButton(...)
  }
}, [])  // ❌ No dependency to re-run
```

**After (Fixed):**
```tsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [scriptReady, setScriptReady] = useState(false);  // ✅ State for trigger
const scriptLoadedRef = useRef(false);

// Script loading
useEffect(() => {
  script.onload = () => {
    scriptLoadedRef.current = true;
    setScriptReady(true);  // ✅ Trigger re-render
  }
}, [])

// Button rendering
useEffect(() => {
  if (window.google && scriptReady) {  // ✅ Wait for state update
    const container = document.getElementById('google-signin-container');
    if (container && container.children.length === 0) {  // ✅ Prevent double render
      renderButton(container, config)
    }
  }
}, [scriptReady])  // ✅ Re-run when script ready
```

### Why This Works

1. **State Update Triggers Re-render:**
   - `setScriptReady(true)` causes component re-render
   - useEffect with `[scriptReady]` dependency runs again
   - Now `scriptReady === true`, so button renders ✅

2. **Dependency Array:**
   - `[scriptReady]` means: re-run when scriptReady changes
   - First run: `false` (skip)
   - Second run: `true` (render button) ✅

3. **Prevent Double Render:**
   - Check `container.children.length === 0`
   - Prevents calling `renderButton()` multiple times
   - Google button only renders once ✅

---

## 📋 Changes Made

### File: `GoogleSignInButton.tsx`

**Change 1: Add state for script readiness**
```tsx
const [scriptReady, setScriptReady] = useState(false);
```

**Change 2: Set state when script loads**
```tsx
script.onload = () => {
  if (window.google && !scriptLoadedRef.current) {
    scriptLoadedRef.current = true;
    setScriptReady(true);  // ✅ Added
    window.google.accounts.id.initialize({...});
  }
};
```

**Change 3: Also set in immediate load**
```tsx
if (typeof window !== 'undefined' && window.google) {
  scriptLoadedRef.current = true;
  setScriptReady(true);  // ✅ Added
  window.google.accounts.id.initialize({...});
  return;
}
```

**Change 4: Fix render useEffect**
```tsx
useEffect(() => {
  if (window.google && scriptReady) {  // ✅ Changed from scriptLoadedRef
    const container = document.getElementById('google-signin-container');
    if (container && container.children.length === 0) {  // ✅ Check length
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        size: 'large',
        text: 'signin_with',
        theme: 'outline',
        locale: 'vi',
      });
    }
  }
}, [scriptReady]);  // ✅ Changed dependency from []
```

---

## ✨ Result

### Before Fix
```
❌ Button container visible but empty
❌ No error messages
❌ User sees blank space
```

### After Fix
```
✅ Google Sign-In button renders correctly
✅ Single-click to open popup
✅ OAuth flow completes
✅ User authenticates successfully
```

---

## 🧪 Testing

### Manual Test
1. Open http://localhost:11000
2. Scroll to Google Sign-In button
3. ✅ Button should be visible (not blank)
4. Click button
5. ✅ Google popup should open
6. ✅ Login flow works

### Console Check
- ✅ No errors in console
- ✅ Script loads successfully
- ✅ Button renders without warnings

---

## 🎓 Lesson Learned

### Anti-pattern (What NOT to do)
```tsx
// ❌ DON'T: Use only ref + empty dependency array
const renderEffect = () => {
  // This only runs ONCE on mount
  // Never re-runs even if data changes
}

useEffect(renderEffect, [])  // ❌ Frozen in time
```

### Best Practice (What TO do)
```tsx
// ✅ DO: Use state + dependency array when data is async
const [dataReady, setDataReady] = useState(false);

useEffect(() => {
  loadData().then(() => setDataReady(true));
}, [])

useEffect(() => {
  if (dataReady) {
    renderUI()
  }
}, [dataReady])  // ✅ Re-runs when dataReady changes
```

---

## Summary Table

| Aspect | Before | After |
|--------|--------|-------|
| Script loading | ✅ Works | ✅ Works |
| State tracking | ❌ Ref only | ✅ State + Ref |
| Button render | ❌ Never runs | ✅ Runs after script load |
| User sees | ❌ Blank | ✅ Google button |
| Click handling | N/A | ✅ Works |

---

## Related Files
- Component: `GoogleSignInButton.tsx`
- Used in: `AuthPage.tsx` (line 339)
- Backend: `/api/v1/auth/google` endpoint
- Config: `next.config.ts` (COOP headers)

