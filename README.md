# GitHub Insights Dashboard

A comprehensive, modern web application that provides detailed analytics and insights for GitHub users. Built with Next.js, React, and Firebase, this dashboard offers a beautiful, animated interface to visualize your GitHub activity and contributions.

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

## 🚀 Features

### Authentication & User Management
- **Firebase Authentication**: Secure user management with email/password
- **User Profile Management**: Store and sync user data with Firestore
- **GitHub Username Integration**: Connect your GitHub account for data fetching
- **Settings Persistence**: Save user preferences including dark mode

### Dashboard Analytics
- **Enhanced Overview Cards**: Total repositories, stars, forks, and open issues with animated stats
- **Advanced Visualizations**: Multiple chart types including radial bars, composed charts, area charts, and treemaps
- **Real-time Data**: Live GitHub API integration with comprehensive caching
- **Recent Activity**: Display latest commits, issues, and pull requests

### Repository Insights
- **Repository Grid**: Browse all your repositories with detailed stats
- **Advanced Filtering**: Filter by language, sort by stars/forks/updates
- **Search Functionality**: Find repositories by name or description
- **Repository Stats**: Stars, forks, issues, and last commit information
- **Language Distribution**: Visual breakdown of programming languages used

### Contribution Tracking
- **Interactive Heatmap**: GitHub-style contribution calendar with live animations
- **Weekly Activity Trends**: Track your GitHub activity over time with animated charts
- **Activity Breakdown**: Detailed analysis of commits, issues, pull requests, and reviews
- **Repository Contributions**: Visualize contributions across different project types
- **Achievement Statistics**: Track streaks, active days, and milestones

### Export & Share
- **JSON Export**: Export comprehensive data in JSON format
- **Multiple Export Types**: Choose from dashboard, repository, or contribution data
- **Settings Integration**: Export functionality integrated into user settings

### User Experience
- **Dark/Light Mode**: Seamless theme switching with persistent preferences
- **Smooth Animations**: Engaging user experience with Framer Motion animations
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Interactive Elements**: Hover effects, tooltips, and dynamic interactions

## 🛠 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework with dark mode support
- **Shadcn/ui**: Beautiful, accessible UI components
- **Recharts**: Interactive charts and visualizations with animations
- **Framer Motion**: Smooth animations and transitions
- **React Hot Toast**: User notifications and feedback

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Firebase Authentication**: User authentication and management
- **Firestore**: NoSQL database for user data and settings
- **GitHub API**: REST and GraphQL integration for comprehensive data

### Deployment
- **Vercel**: Frontend and backend deployment
- **Firebase Hosting**: Alternative hosting option

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- GitHub account

### 1. Clone the Repository
```bash
git clone https://github.com/joynalbokhsho/GitHub-Insights-Dashboard.git
cd GitHub-Insights-Dashboard
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Firebase

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Configure Firestore security rules for user data
4. Download your Firebase config

### 4. Configure Environment Variables

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

### 5. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy to Firebase Hosting

```bash
npm run build
firebase deploy
```

## 📁 Project Structure

```
GitHub-Insights-Dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── contributions/ # Contribution data endpoints
│   │   ├── dashboard/     # Dashboard data endpoints
│   │   ├── export/        # Export functionality
│   │   ├── issues/        # Issues data endpoints
│   │   ├── pull-requests/ # PR data endpoints
│   │   └── repositories/  # Repository data endpoints
│   ├── contributions/     # Contributions page
│   ├── dashboard/         # Dashboard pages
│   ├── export/            # Export page
│   ├── repositories/      # Repository pages
│   ├── settings/          # User settings page
│   ├── share/             # Share functionality
│   ├── globals.css        # Global styles with dark mode
│   ├── layout.tsx         # Root layout with theme provider
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── sidebar.tsx       # Navigation sidebar
│   └── theme-provider.tsx # Theme management
├── lib/                  # Utility libraries
│   ├── auth-context.tsx  # Authentication context
│   ├── firebase.ts       # Firebase client config
│   ├── firebase-admin.ts # Firebase admin config
│   ├── github-api.ts     # GitHub API utilities
│   ├── pdf-generator.ts  # PDF export functionality
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── package.json          # Dependencies
```

## 🎨 Key Features in Detail

### Dark Mode Support
- Seamless theme switching with persistent user preferences
- CSS variables for consistent theming across components
- Automatic theme detection and synchronization

### Advanced Animations
- **Entrance Animations**: Staggered card and chart animations
- **Interactive Hover Effects**: Scale, lift, and color transitions
- **Continuous Animations**: Floating cards, pulsing icons, and shimmer effects
- **Chart Animations**: Staggered data loading and interactive elements

### Enhanced Visualizations
- **Contribution Heatmap**: Interactive GitHub-style calendar with tooltips
- **Weekly Activity Trends**: Multi-line charts with animated data points
- **Activity Breakdown**: Animated pie charts and radial bars
- **Repository Statistics**: Bar charts with staggered animations
- **Achievement Tracking**: Pulsing circular progress indicators

### Data Export
- **JSON Format**: Comprehensive data export in structured JSON
- **Multiple Export Types**: Dashboard, repository, and contribution data
- **User Settings Integration**: Export functionality in settings page
- **Real-time Data**: Export current session data

## 🔧 Configuration

### Firebase Setup

1. **Authentication**: Enable email/password authentication
2. **Firestore**: Create database with user profile collections
3. **Service Account**: Download and configure admin SDK
4. **Security Rules**: Configure Firestore security rules

### GitHub API Integration

The application uses GitHub's REST API for:
- Repository data and statistics
- User profile information
- Contribution history and heatmap data
- Issues and pull requests
- Recent commits and activity

### Rate Limiting

GitHub API has rate limits:
- Authenticated requests: 5,000 requests/hour
- Unauthenticated requests: 60 requests/hour

The application includes rate limit handling and user notifications.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details.

## 🙏 Acknowledgments

- [GitHub API](https://docs.github.com/en/rest) for providing comprehensive data
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Recharts](https://recharts.org/) for interactive charts
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/joynalbokhsho/GitHub-Insights-Dashboard/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Experience your GitHub data like never before with stunning visualizations, smooth animations, and comprehensive analytics!** 🚀

Made with ❤️ by Joynal Bokhsho
