# 📱 Myzymo - Android Deployment Guide

## ⚠️ IMPORTANT: Read ANDROID_SETUP_REQUIRED.md First!

**Before proceeding, you MUST copy the app icons to the correct location.**

See **ANDROID_SETUP_REQUIRED.md** for critical setup steps.

---

## ✅ Setup Complete!

Your Myzymo app is now ready to be deployed to the **Google Play Store**. Here's what has been configured:

### What's Already Done
- ✅ **Capacitor Installed** - Native Android wrapper configured
- ✅ **Android Project Created** - Located in `/android` directory
- ✅ **PWA Manifest** - App metadata and icons defined
- ✅ **Production Build** - Web assets compiled to `/dist/public`
- ✅ **Assets Synced** - Web app copied to Android project

---

## 📋 Prerequisites

Before building your APK, ensure you have:

1. **Android Studio** installed ([Download here](https://developer.android.com/studio))
2. **Java JDK** (comes with Android Studio)
3. **Google Play Console Account** ($25 one-time registration fee)

---

## 🚀 Step-by-Step: Build Your APK

### Step 1: Open Project in Android Studio

```bash
npx cap open android
```

This command will launch Android Studio with your Myzymo Android project.

**First-time setup:**
- Wait for Gradle sync to complete (5-10 minutes on first launch)
- Android Studio may prompt you to update Gradle or SDK versions - accept the updates

---

### Step 2: Test on Emulator (Optional)

1. In Android Studio, click **Device Manager** (phone icon in toolbar)
2. Create a new virtual device (e.g., Pixel 6 with Android 13)
3. Click the **Run** button (green play icon)
4. Your Myzymo app will launch in the emulator

**Troubleshooting:**
- If you see a blank screen, run `npm run build && npx cap sync` in your terminal and try again
- Check the Logcat panel for errors

---

### Step 3: Build Debug APK (For Testing)

1. Go to **Build → Build Bundle(s)/APK(s) → Build APK(s)**
2. Wait for the build to complete (~2-5 minutes)
3. Click **Locate** in the bottom-right notification
4. Find your APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

**Install on Physical Device:**
1. Transfer `app-debug.apk` to your Android phone
2. Enable **Settings → Security → Install from unknown sources**
3. Open the APK file to install
4. Launch Myzymo from your app drawer

---

### Step 4: Build Release APK (For Google Play Store)

#### 4a. Generate Signing Key

Run this command in your terminal:

```bash
keytool -genkey -v -keystore myzymo-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias myzymo-key
```

You'll be prompted for:
- Password (remember this!)
- Your name
- Organization details
- Location

**Important:** Keep `myzymo-release-key.jks` safe - you'll need it for all future app updates!

#### 4b. Sign the APK

1. In Android Studio: **Build → Generate Signed Bundle/APK**
2. Select **Android App Bundle** (required for Play Store)
3. Click **Next**
4. Choose your keystore file (`myzymo-release-key.jks`)
5. Enter your key password and alias
6. Click **Next**
7. Select **release** build variant
8. Check both **V1** and **V2** signature versions
9. Click **Finish**

Your signed AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📤 Google Play Store Submission

### 1. Create Play Console Account

1. Go to [Google Play Console](https://play.google.com/console)
2. Pay the $25 one-time developer fee
3. Complete your developer profile

### 2. Create New App Listing

1. Click **Create app**
2. Fill in app details:
   - **App name:** Myzymo - Social Gatherings Platform
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free

### 3. Upload AAB File

1. Go to **Production → Create new release**
2. Upload `app-release.aab`
3. Add release notes (what's new in this version)

### 4. Complete Store Listing

You'll need to provide:

#### App Icon
- Use the generated icons at `attached_assets/generated_images/myzymo_512px_app_icon.png`
- Upload as a 512x512 PNG

#### Screenshots (Required: 2 minimum)
**You need to take screenshots of your app:**
1. Open Myzymo on an Android device/emulator
2. Capture screens showing:
   - Profile page with event invites
   - Event detail page with chat/expenses/vendors tabs
   - Vendor marketplace
3. Recommended size: 1080x1920 pixels (portrait)

#### Feature Graphic
- 1024 x 500 pixels
- Showcases your app (create using Canva or similar tool)

#### App Description
```
Myzymo is India's premier social gatherings platform for planning unforgettable celebrations.

🎉 Event Management
Create and manage reunions, birthdays, weddings, and festivals with ease.

💬 Group Chat
Real-time messaging keeps everyone connected and informed.

💰 Split Expenses
Track shared costs and get approvals from participants.

🏪 Vendor Marketplace
Book trusted vendors for catering, venues, photography, and decorations.

Perfect for:
• College reunions
• Birthday parties
• Wedding receptions
• Festival celebrations
• Family gatherings
• Farewell parties

Download Myzymo today and make your next celebration unforgettable!
```

#### Privacy Policy (Required)
You must host a privacy policy on a public URL. Example template:

```markdown
# Privacy Policy for Myzymo

Last updated: [Date]

## Data Collection
Myzymo collects:
- User profile information (name, email, phone)
- Event data created by users
- Messages sent in group chats
- Expense records for event planning

## Data Usage
We use your data to:
- Provide event management services
- Enable communication between participants
- Process expense splits and vendor bookings

## Data Sharing
We do not sell or share your data with third parties.

## Contact
Email: support@myzymo.com
```

Host this on your website or use [GitHub Pages](https://pages.github.com/).

### 5. Content Rating

Complete the content rating questionnaire:
- Your app will likely be rated **Everyone** or **Teen**
- Answer questions about violence, sexual content, etc. (Myzymo should be "No" for all)

### 6. App Category

- **Category:** Social
- **Tags:** Events, Social Gatherings, Party Planning, Expense Splitting

### 7. Submit for Review

1. Click **Review release**
2. Address any warnings/errors
3. Click **Start rollout to Production**

**Review Time:** 1-7 days (typically 2-3 days)

---

## 🔄 Updating Your App

When you make changes to Myzymo:

```bash
# 1. Build updated web app
npm run build

# 2. Sync to Android project
npx cap sync

# 3. Open in Android Studio
npx cap open android

# 4. Build → Generate Signed Bundle (increment version number!)
```

**Important:** Update version in `android/app/build.gradle`:
```gradle
versionCode 2      // Increment by 1 for each release
versionName "1.1"  // User-visible version
```

---

## 📱 App Icons Setup

**Action Required:** Copy the generated app icons to the public folder:

1. Copy `attached_assets/generated_images/myzymo_192px_app_icon.png` to `client/public/icon-192.png`
2. Copy `attached_assets/generated_images/myzymo_512px_app_icon.png` to `client/public/icon-512.png`

Then rebuild:
```bash
npm run build && npx cap sync
```

---

## 🐛 Common Issues

### "App shows blank screen"
**Fix:**
```bash
npm run build && npx cap sync
```
Make sure `capacitor.config.ts` has `webDir: 'dist/public'`

### "Gradle build failed"
**Fix:**
- Update Android Studio to latest version
- In Android Studio: **File → Sync Project with Gradle Files**
- Try **Build → Clean Project** then rebuild

### "Signing failed"
**Fix:**
- Verify keystore password is correct
- Ensure keystore file path is correct
- Re-generate keystore if lost (note: you'll need a new package name)

---

## 📊 Monitoring

After your app is published:
- Monitor crash reports in Play Console
- Respond to user reviews
- Track installs and engagement metrics

---

## ✨ Additional Features (Future Enhancements)

Consider adding these native features using Capacitor plugins:

```bash
# Camera for event photos
npm install @capacitor/camera

# Push notifications for event updates
npm install @capacitor/push-notifications

# Geolocation for venue directions
npm install @capacitor/geolocation

# Share API for inviting friends
npm install @capacitor/share
```

Usage example:
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePhoto = async () => {
  const photo = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  // Use photo.webPath in your app
};
```

---

## 📞 Support

- **Capacitor Docs:** https://capacitorjs.com/docs
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Android Studio Docs:** https://developer.android.com/docs

---

## 🎉 Congratulations!

Your Myzymo app is ready for the Google Play Store! Follow the steps above to build, sign, and publish your Android app.

**Next Steps:**
1. Build your release AAB
2. Take screenshots of your app
3. Create a privacy policy
4. Submit to Google Play Console
5. Wait for approval (1-7 days)
6. Launch! 🚀
