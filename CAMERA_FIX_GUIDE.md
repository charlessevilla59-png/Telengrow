🎥 CAMERA FIX GUIDE - BLACK SCREEN / CAMERA NOT SHOWING
═══════════════════════════════════════════════════════════════════

## 🔧 QUICK FIX (Try this first)

### **STEP 1: Hard Refresh the Page**
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

### **STEP 2: Check Browser Console (F12)**
Look for these green messages:
```
✅ mood-tracker.js loaded and running
✅ Mood Tracker Improvements loaded successfully
✅ Enhanced Emotion Confirmation loaded
```

If you see errors instead, try **STEP 3**.

### **STEP 3: Open Developer Console and Run Auto-Fix**
```
1. Press F12 (Developer Console)
2. Click on "Console" tab
3. Copy & paste this command:
   window.quickDiagnostic()

4. Wait 2 seconds and run:
   window.fixCameraVisibility()

5. Check if camera now shows
```

---

## 🚨 IF CAMERA STILL NOT SHOWING

### **Option A: Restart Camera**
```javascript
// In browser console (F12 → Console):
window.restartCamera()

// Wait 3 seconds, then click "Start Scanning"
```

### **Option B: Full Reset**
```javascript
// In browser console:
window.fullCameraReset()

// This will:
// 1. Stop all camera streams
// 2. Request fresh camera permission
// 3. Restart the video
// 4. Fix all visibility issues
```

### **Option C: Use Demo Mode** (Temporary fix)
```javascript
// In browser console:
window.forceDemoMode()

// This allows testing without actual camera
// You'll see simulated emotions instead
```

---

## 🔍 DIAGNOSTIC CHECKS

### **Check if Camera Exists**
```javascript
window.checkVideoStream()
// Look for: "Stream active: true"
```

### **Check Browser Compatibility**
```javascript
window.checkBrowserCompatibility()
// Should show: ✅ for getUserMedia, Canvas, WebGL
```

### **Run Full Diagnostic**
```javascript
window.quickDiagnostic()
// Shows everything and recommends next steps
```

---

## ✅ PERMISSION CHECK

**Make sure you:**
1. ✅ Clicked "ALLOW" when browser asked for camera
2. ✅ Check browser settings (not camera blocked)
3. ✅ Using HTTPS (or localhost)
4. ✅ Camera is plugged in and working

**To check permissions:**
- Chrome: ⚙️ Settings → Privacy → Camera → Find "Tellngrow"
- Firefox: 🔒 Lock icon → Permissions → Camera
- Safari: Safari → Settings → Websites → Camera

---

## 📱 BROWSER REQUIREMENTS

**Supported Browsers:**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14.1+
- ✅ Edge 90+

**NOT Supported:**
- ❌ Internet Explorer
- ❌ Old mobile browsers

---

## 🚀 COMPLETE FIX WORKFLOW

```
1. Hard refresh page (Ctrl+Shift+R)
2. Open console (F12)
3. Run: window.quickDiagnostic()
4. Based on results:
   - If stream OK → window.fixCameraVisibility()
   - If stream not OK → window.fullCameraReset()
   - If still failing → window.forceDemoMode()
5. Click "Start Scanning"
```

---

## 🎯 AVAILABLE CONSOLE COMMANDS

All commands listed when camera-fix.js loads:

| Command | What it does |
|---------|-------------|
| `window.fixCameraVisibility()` | Fix camera display CSS |
| `window.checkVideoStream()` | Check stream status |
| `window.restartCamera()` | Restart camera stream |
| `window.fullCameraReset()` | Complete camera reset |
| `window.forceDemoMode()` | Use simulated emotions |
| `window.checkBrowserCompatibility()` | Check browser support |
| `window.quickDiagnostic()` | Full diagnostic report |

---

## 🆘 STILL NOT WORKING?

### **Check These:**
1. **Camera Permission**
   - Is browser asking for permission?
   - Did you click "ALLOW"?
   - Check browser settings

2. **Device Support**
   - Does your device have a camera?
   - Is camera working in other apps?
   - Try another browser

3. **Network/Localhost**
   - Are you on HTTPS or localhost?
   - Check browser URL bar

4. **Browser Console Errors**
   - Press F12
   - Look for red error messages
   - Copy error and search for it

### **If all else fails:**
Use **Demo Mode**:
```javascript
window.forceDemoMode()
```

This lets you test the full emotion detection workflow without a real camera.

---

## 📊 COMPLETE CONSOLE OUTPUT

When camera-fix.js loads, you should see:

```
🎥 CAMERA FIX UTILITY LOADED
================================================

💡 AVAILABLE COMMANDS:
  window.fixCameraVisibility()
  window.checkVideoStream()
  window.restartCamera()
  ...

================================================
```

If you don't see this, the script didn't load properly. Reload the page.

---

## 🎬 AFTER CAMERA IS FIXED

1. ✅ Camera should be visible
2. ✅ Click "Start Scanning"
3. ✅ Show your face to camera
4. ✅ System auto-detects emotion
5. ✅ Confirm accuracy
6. ✅ Get tips and recommendations

---

**Last Updated:** 2026-05-06
**Version:** 2.0 Camera Fix
**Status:** Ready to Use ✅
