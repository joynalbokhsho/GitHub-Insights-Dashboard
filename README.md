# 🚀 GitHub Insights Dashboard

<div align="center">

![GitHub Insights Dashboard](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Firebase](https://img.shields.io/badge/Firebase-10.0-orange?style=for-the-badge&logo=firebase)
![GitHub API](https://img.shields.io/badge/GitHub_API-v3-181717?style=for-the-badge&logo=github)

**A comprehensive, modern web application that provides detailed analytics and insights for GitHub users. Built with Next.js, React, and Firebase, this dashboard offers a beautiful, animated interface to visualize your GitHub activity and contributions.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-View_Project-green?style=for-the-badge)](https://github-insights-dashboard.vercel.app)
[![Documentation](https://img.shields.io/badge/Documentation-Wiki-blue?style=for-the-badge)](https://github.com/joynalbokhsho/GitHub-Insights-Dashboard/wiki)

</div>

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard Overview](/public/images/screenshots/dashboard-overview.png)
*Main dashboard with comprehensive GitHub analytics and visualizations*

### Repository Management
![Repository Management](/public/images/screenshots/repository-management.png)
*Repository grid with advanced filtering and search capabilities*

### Contribution Tracking
![Contribution Tracking](/public/images/screenshots/contribution-tracking.png)
*Interactive contribution heatmap and activity breakdown*

### Share & Export Features
![Share Features](/public/images/screenshots/share-export2.png)
![Share Features](/public/images/screenshots/share-export.png)
*Advanced sharing and export functionality*

---

## ✨ Key Features

### 🔐 **Authentication & User Management**
- **Firebase Authentication**: Secure user management with email/password
- **User Profile Management**: Store and sync user data with Firestore
- **GitHub Username Integration**: Connect your GitHub account for data fetching
- **Settings Persistence**: Save user preferences including dark mode
- **Session Management**: Automatic login state management

### 📊 **Dashboard Analytics**
- **Enhanced Overview Cards**: Total repositories, stars, forks, and open issues with animated stats
- **Advanced Visualizations**: Multiple chart types including radial bars, composed charts, area charts, and treemaps
- **Real-time Data**: Live GitHub API integration with comprehensive caching
- **Recent Activity**: Display latest commits, issues, and pull requests
- **Performance Metrics**: Loading states and error handling

### 📁 **Repository Insights**
- **Repository Grid**: Browse all your repositories with detailed stats
- **Advanced Filtering**: Filter by language, sort by stars/forks/updates
- **Search Functionality**: Find repositories by name or description
- **Repository Stats**: Stars, forks, issues, and last commit information
- **Language Distribution**: Visual breakdown of programming languages used
- **Private Repository Support**: Optional display of private repo statistics

### 📈 **Contribution Tracking**
- **Interactive Heatmap**: GitHub-style contribution calendar with live animations
- **Weekly Activity Trends**: Track your GitHub activity over time with animated charts
- **Activity Breakdown**: Detailed analysis of commits, issues, pull requests, and reviews
- **Repository Contributions**: Visualize contributions across different project types
- **Achievement Statistics**: Track streaks, active days, and milestones

### 🔗 **Export & Share**
- **JSON Export**: Export comprehensive data in JSON format
- **Multiple Export Types**: Choose from dashboard, repository, or contribution data
- **Settings Integration**: Export functionality integrated into user settings
- **Share Links**: Generate public/private shareable links
- **Privacy Controls**: Control what data is shared in public links

### 🎨 **User Experience**
- **Dark/Light Mode**: Seamless theme switching with persistent preferences
- **Smooth Animations**: Engaging user experience with Framer Motion animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Elements**: Hover effects, tooltips, and dynamic interactions
- **Loading States**: Beautiful loading animations and skeleton screens

---

## 🛠 Tech Stack

### **Frontend**
- **Next.js 14**: React framework with App Router and server-side rendering
- **TypeScript**: Type-safe development with strict type checking
- **Tailwind CSS**: Utility-first CSS framework with dark mode support
- **Shadcn/ui**: Beautiful, accessible UI components built on Radix UI
- **Recharts**: Interactive charts and visualizations with animations
- **Framer Motion**: Smooth animations and transitions
- **React Hot Toast**: User notifications and feedback

### **Backend**
- **Next.js API Routes**: Serverless API endpoints with TypeScript
- **Firebase Authentication**: User authentication and management
- **Firestore**: NoSQL database for user data and settings
- **GitHub API**: REST and GraphQL integration for comprehensive data
- **Firebase Admin SDK**: Server-side authentication and database access

### **Development & Deployment**
- **Vercel**: Frontend and backend deployment with automatic CI/CD
- **Firebase Hosting**: Alternative hosting option
- **ESLint & Prettier**: Code quality and formatting
- **Husky**: Git hooks for pre-commit checks

---

## 📦 Installation

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Firebase project
- GitHub account with API access

### **1. Clone the Repository**
```bash
git clone https://github.com/joynalbokhsho/GitHub-Insights-Dashboard.git
cd GitHub-Insights-Dashboard
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

### **3. Set Up Firebase**

1. **Create a new Firebase project** at [Firebase Console](https://console.firebase.google.com/)
2. **Enable Authentication** with email/password provider
3. **Create Firestore Database** in production mode
4. **Configure Firestore security rules** for user data
5. **Download your Firebase config** from project settings

### **4. Configure Environment Variables**

Copy the example environment file:
```bash
cp env.example .env.local
```

Fill in your Firebase configuration:
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

### **5. Run the Development Server**
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚀 Deployment

### **Deploy to Vercel (Recommended)**

1. **Push your code** to GitHub
2. **Connect your repository** to Vercel
3. **Add environment variables** in Vercel dashboard
4. **Deploy automatically** on every push

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### **Deploy to Firebase Hosting**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase
firebase init

# Build and deploy
npm run build
firebase deploy
```

---

## 📁 Project Structure

```
GitHub-Insights-Dashboard/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── contributions/       # Contribution data endpoints
│   │   ├── dashboard/           # Dashboard data endpoints
│   │   ├── export/              # Export functionality
│   │   ├── issues/              # Issues data endpoints
│   │   ├── pull-requests/       # PR data endpoints
│   │   ├── repositories/        # Repository data endpoints
│   │   ├── shared/              # Shared link endpoints
│   │   └── shares/              # Share management endpoints
│   ├── contributions/           # Contributions page
│   ├── dashboard/               # Dashboard pages
│   ├── export/                  # Export page
│   ├── repositories/            # Repository pages
│   ├── settings/                # User settings page
│   ├── share/                   # Share functionality
│   ├── shared/                  # Shared link pages
│   ├── globals.css              # Global styles with dark mode
│   ├── layout.tsx               # Root layout with theme provider
│   └── page.tsx                 # Landing page
├── components/                   # React components
│   ├── ui/                     # Shadcn/ui components
│   ├── sidebar.tsx             # Navigation sidebar
│   └── theme-provider.tsx      # Theme management
├── lib/                         # Utility libraries
│   ├── auth-context.tsx        # Authentication context
│   ├── firebase.ts             # Firebase client config
│   ├── firebase-admin.ts       # Firebase admin config
│   ├── github-api.ts           # GitHub API utilities
│   ├── pdf-generator.ts        # PDF export functionality
│   └── utils.ts                # Helper functions
├── public/                      # Static assets
│   └── images/                 # Images and screenshots
├── wiki/                        # Documentation
├── package.json                 # Dependencies
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # Project documentation
```

---

## 🎨 Key Features in Detail

### **Dark Mode Support**
- **Seamless Theme Switching**: Toggle between light and dark modes
- **Persistent Preferences**: User preferences saved in Firestore
- **CSS Variables**: Consistent theming across all components
- **Automatic Detection**: Respects system theme preferences
- **Smooth Transitions**: Animated theme switching

### **Advanced Animations**
- **Entrance Animations**: Staggered card and chart animations
- **Interactive Hover Effects**: Scale, lift, and color transitions
- **Continuous Animations**: Floating cards, pulsing icons, and shimmer effects
- **Chart Animations**: Staggered data loading and interactive elements
- **Page Transitions**: Smooth navigation between pages

### **Enhanced Visualizations**
- **Contribution Heatmap**: Interactive GitHub-style calendar with tooltips
- **Weekly Activity Trends**: Multi-line charts with animated data points
- **Activity Breakdown**: Animated pie charts and radial bars
- **Repository Statistics**: Bar charts with staggered animations
- **Achievement Tracking**: Pulsing circular progress indicators
- **Language Distribution**: Treemap visualization of programming languages

### **Data Export & Sharing**
- **JSON Format**: Comprehensive data export in structured JSON
- **Multiple Export Types**: Dashboard, repository, and contribution data
- **User Settings Integration**: Export functionality in settings page
- **Real-time Data**: Export current session data
- **Share Links**: Generate public/private shareable links
- **Privacy Controls**: Control what data is shared

---

## 🔧 Configuration

### **Firebase Setup**

1. **Authentication**: Enable email/password authentication
2. **Firestore**: Create database with user profile collections
3. **Service Account**: Download and configure admin SDK
4. **Security Rules**: Configure Firestore security rules

### **GitHub API Integration**

The application uses GitHub's REST API for:
- Repository data and statistics
- User profile information
- Contribution history and heatmap data
- Issues and pull requests
- Recent commits and activity

### **Rate Limiting**

GitHub API has rate limits:
- **Authenticated requests**: 5,000 requests/hour
- **Unauthenticated requests**: 60 requests/hour

The application includes rate limit handling and user notifications.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### **Development Guidelines**
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation if needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

---

## 🙏 Acknowledgments

- [GitHub API](https://docs.github.com/en/rest) for providing comprehensive data
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Recharts](https://recharts.org/) for interactive charts
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- [Next.js](https://nextjs.org/) for the amazing React framework
- [Firebase](https://firebase.google.com/) for backend services

---

## 📞 Support

If you have any questions or need help, please:

1. **Check the [Issues](https://github.com/joynalbokhsho/GitHub-Insights-Dashboard/issues)** page
2. **Create a new issue** with detailed information
3. **Contact the maintainers**

### **Getting Help**
- 📖 **Documentation**: Check the [Wiki](https://github.com/joynalbokhsho/GitHub-Insights-Dashboard/wiki)
- 🐛 **Bug Reports**: Use the Issues page
- 💡 **Feature Requests**: Submit through Issues
- 💬 **Discussions**: Use GitHub Discussions

---

<div align="center">

**Experience your GitHub data like never before with stunning visualizations, smooth animations, and comprehensive analytics!** 🚀

Made with ❤️ by [Joynal Bokhsho](https://github.com/joynalbokhsho)

[![GitHub](https://img.shields.io/badge/GitHub-Profile-black?style=for-the-badge&logo=github)](https://github.com/joynalbokhsho)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/joynalbokhsho)

</div>
