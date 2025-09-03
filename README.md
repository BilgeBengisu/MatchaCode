# 🍵 MatchaCode - Daily LeetCode Challenge Tracker

A fun and motivating static website to track daily LeetCode challenges between friends, with a matcha-themed accountability system! Built for Bilge and Domenica to stay motivated and accountable in their coding journey.

## 🌟 Features

- **Two-User System** - Separate tracking for Bilge and Domenica
- **Daily Challenge Tracking** - Mark your LeetCode problems as complete with authentication
- **Smart Streak Counter** - Individual and combined streak tracking
- **Automatic Matcha Tracker** - Automatically counts missed days from September 3rd, 2025
- **Activity History** - See your recent progress and missed days
- **Secure Authentication** - Environment variable-based password protection
- **Responsive Design** - Works great on desktop and mobile with dark techy theme
- **Local Storage** - Data persists between sessions
- **Profile Pictures** - Personal touch with user avatars
- **Clean UI** - Modern glassmorphism design with beige cards

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Enter the password**: `matcha2024` (or your custom password)
4. **Mark Complete** when you finish today's LeetCode challenge
5. **Track your progress** with streaks and matcha counts!

## 🎯 How It Works

### For Users (Bilge & Domenica)
1. **View the dashboard** - See your stats and today's challenge
2. **Mark Complete** - Click your "Mark Complete" button and enter the password
3. **Track streaks** - Individual streaks and combined streaks when both complete
4. **Monitor matcha owed** - Automatically tracks missed days from September 3rd, 2025

### Matcha Logic
- **Start Date**: September 3rd, 2025 (when the website was implemented)
- **Missing Days**: Any day from start date to yesterday without a completion
- **Automatic Tracking**: System automatically detects and counts missed days
- **Fair System**: Only counts days from when the website was actually being used

## 🔐 Environment Variables & Security

The app now uses environment variables to keep the password secure and out of source code.

### Local Development
1. Copy `env.example` to `.env` (optional for local dev)
2. Set your password: `MATCHACODE_PASSWORD=your-secure-password`
3. Run `npm run build:dev` to build with development settings

### Production Deployment
Set the environment variable `MATCHACODE_PASSWORD` in your deployment platform:

#### Netlify
1. Go to Site Settings → Environment Variables
2. Add `MATCHACODE_PASSWORD` with your secure password
3. Deploy - the build process will automatically use your environment variable

#### Vercel
1. Go to Project Settings → Environment Variables
2. Add `MATCHACODE_PASSWORD` with your secure password
3. Deploy - the build process will automatically use your environment variable

#### GitHub Pages
GitHub Pages doesn't support environment variables. For GitHub Pages:
1. Run `npm run build` locally with your password set
2. Commit the generated `config.js` file
3. Deploy to GitHub Pages

## 🛠️ Development & Debugging

### Console Functions
Open browser console (F12) for debugging and management:

```javascript
// Reset and clean functions
resetAllMatchaCounts()     // Reset matcha owed counts to 0
cleanActivityList()        // Clear all activity history
resetAllData()            // Reset everything (completions, streaks, matcha, activity)

// Data inspection
inspectData()             // View current data structure
checkMissedDays()         // Manually trigger missed day check

// Manual operations
markYesterdayMissed('bilge')     // Mark Bilge as missed yesterday
markYesterdayMissed('domenica')  // Mark Domenica as missed yesterday
resetMatchaOwed('bilge')         // Reset Bilge's matcha count
resetMatchaOwed('domenica')      // Reset Domenica's matcha count
```

### Adding Past Completions
```javascript
// Add completions for past days
addPastCompletions()  // Adds completions for the last 2 days

// Add specific completions
addSpecificCompletions([
    { user: 'bilge', date: '2025-09-01' },
    { user: 'domenica', date: '2025-09-02' }
])
```

## 🎨 Current Design

### Techy Coding Theme
The website features a modern dark theme perfect for coding:

```css
/* Dark brown gradient background */
background: linear-gradient(135deg, #2c1810 0%, #1a0f0a 100%);

/* Matcha green accents */
color: #4CAF50;

/* LeetCode orange highlights */
background: linear-gradient(135deg, #FF8C00, #FF6B35);

/* Beige user cards for contrast */
background: #F5F5DC;
```

### UI Components
- **Glassmorphism cards** with backdrop blur effects
- **Floating matcha emoji** in the header with animation
- **Profile pictures** for personal touch
- **Responsive sidebar** with stats and activity
- **Interactive modals** for authentication and info

### Adding More Features
The app is built with vanilla JavaScript, making it easy to extend:

- Add difficulty levels for challenges
- Implement a points system
- Add more statistics
- Create weekly/monthly views

## 🚀 Deployment

### Netlify (Recommended)
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Deploy with zero configuration!

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts

### GitHub Pages
1. Push to a GitHub repository
2. Go to Settings > Pages
3. Select source branch and deploy

## 🛠️ Technical Details

- **Frontend**: Vanilla HTML, CSS, JavaScript (no frameworks needed!)
- **Storage**: Browser localStorage with data migration support
- **Authentication**: Environment variable-based password protection
- **Responsive**: Mobile-first design with sidebar layout
- **Performance**: Optimized for fast loading with glassmorphism effects
- **Date Handling**: Local timezone support with proper date key migration
- **Build System**: Node.js build script for environment variable injection

## 📊 Data Storage

All data is stored locally in your browser using localStorage:
- **User Data**: Individual completions, streaks, and matcha owed counts
- **Daily Challenges**: Completion status with timestamps
- **Activity History**: Recent actions and missed day notifications
- **Streak Calculations**: Individual and combined streak tracking
- **Data Migration**: Automatic conversion of old date formats

**Data Structure**:
```javascript
{
  users: {
    bilge: {
      name: 'Bilge',
      currentStreak: 0,
      totalSolved: 0,
      totalMatchaOwed: 0,
      dailyChallenges: {},
      activityHistory: []
    },
    domenica: { /* same structure */ }
  }
}
```

**Note**: Data is tied to the specific browser/device. If you want to share data between devices, you'd need to implement a backend solution.

## 🔒 Security

This is a simple static website with basic password protection. For production use with sensitive data, consider:
- Implementing proper user authentication
- Using HTTPS
- Adding server-side validation
- Implementing proper session management

## 🤝 Contributing

Feel free to fork this project and add your own features! Some ideas:
- Dark mode toggle
- Challenge difficulty tracking
- Social features for multiple friends
- Integration with LeetCode API
- Mobile app version

## 📄 License

This project is open source and available under the MIT License.

## 🍵 About MatchaCode

MatchaCode was created to make daily coding practice more fun and accountable for Bilge and Domenica. The matcha theme adds a playful element to the serious business of becoming better programmers!

### Current Status
- **Start Date**: September 3rd, 2025
- **Users**: Bilge and Domenica
- **Goal**: Daily LeetCode challenges with matcha accountability
- **Theme**: Dark techy coding environment with matcha green accents

### Key Features Implemented
✅ **Two-user system** with separate tracking  
✅ **Smart matcha logic** - only counts missing days from implementation date  
✅ **Automatic streak calculation** - individual and combined streaks  
✅ **Secure authentication** with environment variables  
✅ **Modern UI** with glassmorphism and responsive design  
✅ **Profile pictures** and personal touches  
✅ **Activity tracking** with missed day notifications  

**Remember**: The best way to get better at coding is consistent practice. Even if you miss a day, don't give up - tomorrow is a new opportunity to get back on track! 💪

---

*Powered by matcha and motivation © 2025 Bilge Akyol* 🍵