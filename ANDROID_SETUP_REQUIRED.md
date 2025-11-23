# ⚠️ REQUIRED SETUP BEFORE BUILDING ANDROID APP

## 🚨 Critical: App Icons Must Be Added

**Your app will not deploy correctly without completing these steps first!**

### Step 1: Copy App Icons to Public Folder

The app icons have been generated but need to be copied to the correct location:

**Generated Icons Location:**
- `attached_assets/generated_images/myzymo_192px_app_icon.png`
- `attached_assets/generated_images/myzymo_512px_app_icon.png`

**Required Actions:**

```bash
# Copy 192px icon
cp attached_assets/generated_images/myzymo_192px_app_icon.png client/public/icon-192.png

# Copy 512px icon
cp attached_assets/generated_images/myzymo_512px_app_icon.png client/public/icon-512.png
```

### Step 2: Rebuild and Resync

After copying the icons:

```bash
# Rebuild the production app with icons
npm run build

# Sync to Android project
npx cap sync
```

### Step 3: Update Android Launcher Icons (Optional but Recommended)

For proper branding in the Android app launcher, replace the default Capacitor icons:

1. Open Android Studio: `npx cap open android`
2. Right-click `android/app/src/main/res`
3. Select **New → Image Asset**
4. Choose **Launcher Icons (Adaptive and Legacy)**
5. Set path to `client/public/icon-512.png`
6. Click **Next** → **Finish**

This will generate all required mipmap sizes (hdpi, xhdpi, xxhdpi, xxxhdpi).

---

## ✅ Verification Checklist

Before building your APK, verify:

- [ ] Icons copied to `client/public/icon-192.png` and `client/public/icon-512.png`
- [ ] Run `npm run build && npx cap sync`
- [ ] Icons visible in `dist/public/icon-192.png` and `dist/public/icon-512.png`
- [ ] (Optional) Android launcher icons updated via Image Asset tool

---

## 🔐 Security Configuration

The Capacitor config has been set up with secure defaults:
- ✅ HTTPS scheme enforced
- ✅ No wildcard navigation allowed
- ✅ Splash screen configured

**Do not** add `allowNavigation: ['*']` - this violates Google Play Store security policies.

---

## 📱 Ready to Build?

Once icons are in place, proceed to **ANDROID_DEPLOYMENT_GUIDE.md** for:
- Building APK for testing
- Generating signed AAB for Play Store
- Submitting to Google Play Console

---

## 🆘 Troubleshooting

**"Icons don't show up in app"**
→ Make sure you ran `npm run build && npx cap sync` AFTER copying icons

**"Play Console rejects my app"**
→ Verify icon files exist in `dist/public/` before building

**"App shows Capacitor logo"**
→ Update Android launcher icons via Image Asset tool in Android Studio
