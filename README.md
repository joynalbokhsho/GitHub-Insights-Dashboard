# GitHub Insights Dashboard

A comprehensive full-stack web application that provides detailed analytics and insights about your GitHub repositories and activity. Built with Next.js, TypeScript, Tailwind CSS, and Firebase.

## 🚀 Features

### Authentication
- **GitHub OAuth Integration**: Seamless sign-in with your GitHub account
- **Firebase Authentication**: Secure user management and session handling
- **User Profile Management**: Store and sync user data with Firestore

### Dashboard Analytics
- **Overview Cards**: Total repositories, stars, forks, and open issues
- **Interactive Charts**: Star growth trends and language distribution
- **Real-time Data**: Live GitHub API integration with caching

### Repository Insights
- **Repository Grid**: Browse all your repositories with detailed stats
- **Advanced Filtering**: Filter by language, sort by stars/forks/updates
- **Search Functionality**: Find repositories by name or description
- **Repository Stats**: Stars, forks, issues, and last commit information

### Contribution Tracking
- **GitHub-style Heatmap**: Visual contribution calendar
- **Activity Trends**: Track your GitHub activity over time
- **Pull Request History**: View your recent pull requests
- **Issue Tracking**: Monitor your issue contributions

### Export & Share
- **PDF Export**: Export insights as downloadable PDF reports
- **Public Sharing**: Share read-only dashboard links
- **Data Export**: Export repository data in various formats

## 🛠 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Beautiful, accessible UI components
- **Recharts**: Interactive charts and visualizations
- **Framer Motion**: Smooth animations and transitions

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Firebase Authentication**: User authentication and management
- **Firestore**: NoSQL database for user data and caching
- **GitHub API**: REST and GraphQL integration

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
git clone https://github.com/yourusername/github-insights-dashboard.git
cd github-insights-dashboard
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
3. Add GitHub OAuth provider in Authentication > Sign-in method
4. Download your Firebase config and service account key

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

### 5. Set Up GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to: `https://your-domain.com/auth/callback`
4. Add the client ID and secret to your environment variables

### 6. Run the Development Server
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
github-insights-dashboard/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   └── sidebar.tsx       # Navigation sidebar
├── lib/                  # Utility libraries
│   ├── auth-context.tsx  # Authentication context
│   ├── firebase.ts       # Firebase client config
│   ├── firebase-admin.ts # Firebase admin config
│   ├── github-api.ts     # GitHub API utilities
│   └── utils.ts          # Helper functions
├── public/               # Static assets
└── package.json          # Dependencies
```

## 🔧 Configuration

### Firebase Setup

1. **Authentication**: Enable GitHub OAuth provider
2. **Firestore**: Create database with security rules
3. **Service Account**: Download and configure admin SDK

### GitHub API

The application uses GitHub's REST API and GraphQL API for:
- Repository data
- User statistics
- Contribution history
- Issues and pull requests

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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [GitHub API](https://docs.github.com/en/rest) for providing comprehensive data
- [Shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Recharts](https://recharts.org/) for interactive charts
- [Framer Motion](https://www.framer.com/motion/) for animations

## 📞 Support

If you have any questions or need help, please:
1. Check the [Issues](https://github.com/yourusername/github-insights-dashboard/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

Made with ❤️ by [Your Name]
