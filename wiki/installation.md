# Installation Guide

This guide will walk you through the complete setup process for the GitHub Insights Dashboard, from cloning the repository to running the application locally.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Firebase account** (free tier available)
- **GitHub account** (for data fetching)

### Checking Your Environment

Verify your installations:

```bash
# Check Node.js version
node --version  # Should be 18.x or higher

# Check npm version
npm --version

# Check Git version
git --version
```

## 🚀 Step-by-Step Installation

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/joynalbokhsho/GitHub-Insights-Dashboard.git

# Navigate to the project directory
cd GitHub-Insights-Dashboard
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### 3. Set Up Firebase Project

#### Create a New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "GitHub-Insights-Dashboard")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

#### Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click "Get started"
3. Go to the **Sign-in method** tab
4. Enable **Email/Password** authentication
5. Click "Save"

#### Set Up Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click "Create database"
3. Choose **Start in test mode** (for development)
4. Select a location for your database
5. Click "Done"

#### Get Firebase Configuration

1. Go to **Project settings** (gear icon)
2. Scroll down to **Your apps** section
3. Click the web icon (</>) to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

#### Download Service Account Key

1. In Project settings, go to **Service accounts** tab
2. Click "Generate new private key"
3. Download the JSON file
4. Keep this file secure and never commit it to version control

### 4. Configure Environment Variables

#### Create Environment File

```bash
# Copy the example environment file
cp env.example .env.local
```

#### Fill in Your Configuration

Edit `.env.local` with your Firebase credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK (for server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
```

### 5. Set Up Firestore Security Rules

In your Firebase console, go to **Firestore Database** > **Rules** and update the rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read and write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow users to read and write their own settings
    match /users/{userId}/settings/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Run the Development Server

```bash
# Start the development server
npm run dev

# Or using yarn
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration Options

### Customizing the Application

You can customize various aspects of the application by modifying the configuration files:

#### Tailwind CSS Configuration

Edit `tailwind.config.js` to customize the design system:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Add your custom colors here
      },
      animation: {
        // Add custom animations
      }
    }
  }
}
```

#### Next.js Configuration

Edit `next.config.js` for Next.js specific settings:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig
```

## 🚨 Troubleshooting

### Common Issues

#### Firebase Configuration Errors

**Problem**: Firebase initialization fails
**Solution**: 
- Verify all environment variables are correctly set
- Ensure Firebase project is properly configured
- Check that Authentication and Firestore are enabled

#### Port Already in Use

**Problem**: Port 3000 is already occupied
**Solution**:
```bash
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

#### Module Not Found Errors

**Problem**: Missing dependencies
**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Build Errors

**Problem**: TypeScript compilation errors
**Solution**:
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Fix linting issues
npm run lint -- --fix
```

## ✅ Verification

After installation, verify everything is working:

1. **Application loads** at http://localhost:3000
2. **Authentication works** - try signing up/signing in
3. **GitHub data loads** - enter a GitHub username in settings
4. **Dashboard displays** - check if charts and data appear
5. **Dark mode works** - toggle theme in settings

## 🚀 Next Steps

Once installation is complete:

1. **Read the [Quick Start Guide](quick-start.md)** to learn the basics
2. **Explore the [Dashboard Overview](dashboard-overview.md)** to understand features
3. **Check the [Configuration Guide](configuration.md)** for advanced setup
4. **Review the [Contributing Guidelines](contributing.md)** if you want to contribute

## 📞 Getting Help

If you encounter issues during installation:

1. Check the [Troubleshooting Guide](troubleshooting.md)
2. Review the [FAQ](faq.md) for common questions
3. Open a GitHub issue with detailed error information
4. Include your environment details (OS, Node.js version, etc.)

---

**Happy coding! 🎉**
