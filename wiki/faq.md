# Frequently Asked Questions (FAQ)

This page answers the most common questions about the GitHub Insights Dashboard. If you don't find your answer here, please check the [Troubleshooting Guide](troubleshooting.md) or open a GitHub issue.

## 🔐 Authentication & Account

### Q: How do I create an account?
**A**: You can sign up using your email address and password. The application uses Firebase Authentication for secure user management.

### Q: Can I use my GitHub account to sign in?
**A**: Currently, the application uses email/password authentication. You connect your GitHub username in the settings to fetch your data.

### Q: How do I change my GitHub username?
**A**: Go to Settings → Profile and update your GitHub username. The dashboard will automatically fetch data for the new username.

### Q: Is my data secure?
**A**: Yes! Your authentication data is handled securely by Firebase, and your GitHub username is stored in your user profile. We never store your GitHub password.

## 📊 Data & Analytics

### Q: How often is the data updated?
**A**: Data is fetched in real-time when you visit the dashboard or manually refresh. The application respects GitHub's API rate limits.

### Q: Why isn't my data showing up?
**A**: Make sure you've entered your GitHub username in Settings. Also check that:
- Your GitHub account is public
- You have repositories with activity
- The username is spelled correctly

### Q: Can I see private repository data?
**A**: No, the application only fetches data from public repositories due to GitHub API limitations.

### Q: How far back does the data go?
**A**: The application fetches your current repository data and recent activity. Historical data depends on what's available through the GitHub API.

### Q: Why are some charts empty?
**A**: Charts may be empty if:
- You don't have data in that category
- The GitHub API doesn't return data for that metric
- There's a temporary API issue

## 🎨 Features & Customization

### Q: How do I enable dark mode?
**A**: Go to Settings → Preferences and toggle the dark mode switch. The setting will be saved and remembered.

### Q: Can I customize the dashboard layout?
**A**: The current version has a fixed layout optimized for the best user experience. Future versions may include customizable layouts.

### Q: How do I export my data?
**A**: Go to Settings → Export or use the dedicated Export page. You can export data in JSON format for different categories.

### Q: Can I share my dashboard with others?
**A**: Currently, the dashboard is personal to your account. Sharing features may be added in future versions.

## 🚀 Performance & Technical

### Q: Why is the dashboard loading slowly?
**A**: The dashboard fetches data from GitHub's API, which can take time depending on:
- Number of repositories
- GitHub API response time
- Your internet connection
- API rate limits

### Q: What browsers are supported?
**A**: The dashboard works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Q: Is the dashboard mobile-friendly?
**A**: Yes! The dashboard is fully responsive and optimized for mobile devices, tablets, and desktops.

### Q: Can I use the dashboard offline?
**A**: No, the dashboard requires an internet connection to fetch data from GitHub's API.

## 🔧 Troubleshooting

### Q: I'm getting an error message. What should I do?
**A**: 
1. Check the [Troubleshooting Guide](troubleshooting.md)
2. Verify your GitHub username is correct
3. Ensure your GitHub account is public
4. Try refreshing the page
5. If the issue persists, open a GitHub issue

### Q: The charts aren't animating properly
**A**: 
- Make sure JavaScript is enabled
- Try refreshing the page
- Check if your browser supports the required features
- Disable any browser extensions that might interfere

### Q: Dark mode isn't working
**A**: 
- Check if your browser supports CSS custom properties
- Try manually toggling the theme in settings
- Clear your browser cache
- Check if any browser extensions are interfering

### Q: Data isn't updating after changing my GitHub username
**A**: 
- Wait a few moments for the data to refresh
- Try manually refreshing the page
- Check if the new username has public repositories
- Verify the username spelling

## 📱 Mobile & Accessibility

### Q: How do I use the dashboard on mobile?
**A**: The dashboard automatically adapts to mobile screens. Simply visit the website on your mobile browser - no app installation required.

### Q: Is the dashboard accessible?
**A**: Yes, the dashboard includes accessibility features:
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Semantic HTML structure

### Q: Can I use the dashboard with a screen reader?
**A**: Yes, the dashboard is designed to work with screen readers and includes proper ARIA labels and semantic markup.

## 🔄 Updates & Maintenance

### Q: How often is the dashboard updated?
**A**: The dashboard is actively maintained with regular updates for:
- Bug fixes
- New features
- Performance improvements
- Security updates

### Q: How do I know when there's an update?
**A**: Check the [Changelog](changelog.md) for the latest updates and new features.

### Q: Will my data be lost during updates?
**A**: No, your user data is stored securely and won't be affected by dashboard updates.

## 🎯 Usage Tips

### Q: What's the best way to use the dashboard?
**A**: 
1. Set up your GitHub username in settings
2. Explore the different sections (Dashboard, Contributions, Repositories)
3. Use the refresh button to get the latest data
4. Try both light and dark modes
5. Export data when needed

### Q: How can I get the most accurate data?
**A**: 
- Ensure your GitHub username is correct
- Keep your repositories public
- Regularly refresh the data
- Check that your repositories have activity

### Q: What do the different chart types show?
**A**: 
- **Radial Bar Charts**: Distribution of data categories
- **Area Charts**: Trends over time
- **Pie Charts**: Proportions of different categories
- **Bar Charts**: Comparison between different items
- **Scatter Plots**: Correlation between two variables

## 🆘 Getting Help

### Q: Where can I get more help?
**A**: 
1. Check this FAQ first
2. Review the [Troubleshooting Guide](troubleshooting.md)
3. Read the [Installation Guide](installation.md)
4. Open a GitHub issue for specific problems
5. Check the [Contributing Guidelines](contributing.md) if you want to help

### Q: How do I report a bug?
**A**: 
1. Check if the issue is already reported
2. Open a new GitHub issue
3. Include detailed information:
   - What you were doing
   - What happened
   - What you expected
   - Browser and OS information
   - Screenshots if helpful

### Q: Can I suggest new features?
**A**: Yes! We welcome feature suggestions. Open a GitHub issue with:
- Description of the feature
- Why it would be useful
- Any examples or mockups

### Q: How can I contribute to the project?
**A**: 
1. Read the [Contributing Guidelines](contributing.md)
2. Check the [Code Style Guide](code-style.md)
3. Look for issues labeled "good first issue"
4. Submit a pull request with your changes

---

**Still have questions?** Check the [Troubleshooting Guide](troubleshooting.md) or [open a GitHub issue](https://github.com/joynalbokhsho/GitHub-Insights-Dashboard/issues) for support! 🚀
