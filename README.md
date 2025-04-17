# 💰 CashMate – Personal Expense Tracker with Google Drive Backup

**CashMate** is a lightweight and secure expense tracking app built with React Native.  
It helps you keep track of your spending and supports backup & restore via **Google Drive** – all under your control.

---

## ✨ Features

- 🧾 Track daily expenses by category
- 📅 View historical records and summaries
- ☁️ **Backup & restore** your SQLite database using your own Google Drive
- 🔐 All your data stays private — no third-party servers involved


---
## 📜TODO
- Redesign UI
- Improve the add expense/income function
---
## 📦 Tech Stack

- React Native
- SQLite
- Google Sign-In & Google Drive API
- TypeScript
- Node.js

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/CashMate.git
cd CashMate
```

---

### 2. Install Dependencies

```bash
npm install
npx pod-install   # for iOS
```

---

### 3. Configure Google Drive API (Required for Cloud Backup)

> 🛡️ Each user must configure their **own** Google API credentials for privacy and security.

#### 🔧 Create API Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use existing one)
3. Enable the following APIs:
   - **Google Drive API**
   - **Google People API**
4. Navigate to "Credentials" → Click **Create Credentials**
   - Choose **OAuth Client ID**
   - Application type: **Web application**
   - Note down your **Web Client ID**
5. Create another OAuth Client ID for Android (optional if using Android):
   - Application type: **Android**
   - Provide your **Android package name** and **SHA-1**

---

### 4. Setup Environment Variables

Create a `.env` file in your project root:

```env
GOOGLE_WEB_CLIENT_ID=<your_web_client_id>
```

Make sure `.env` is listed in `.gitignore` so it won’t be uploaded to GitHub.

---

### 5. Run the App

```bash
# For Android
npx react-native run-android

# For iOS (requires macOS and Xcode)
npx react-native run-ios
```

---

## ☁️ Backup & Restore Functionality

After logging in with Google, the app allows:

- **Upload** your local SQLite database (`cashmate.db`) to a dedicated folder in Google Drive
- **Download** the latest backup to restore your records on a new device or after reinstall

A loading animation will appear during upload/download to inform the user and prevent double actions.

---

## 🛡️ Security & Privacy

- No data is sent to any external servers.
- You control your data through your own Google Drive.
- Only the database file is uploaded (not any metadata or user analytics).

---


## 📄 License

MIT License © 2025 Kenny On
