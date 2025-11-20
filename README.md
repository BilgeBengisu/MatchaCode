# MatchaCode - Daily LeetCode Challenge Tracker

A fun and motivating way for Bilge and Domenica to track their daily LeetCode challenges together!

## 🍵 Features

- **Daily Challenge Tracking**: Mark challenges as complete with authentication
- **Streak Management**: Track individual and combined streaks
- **Matcha Challenge**: Miss a day = owe a matcha! 🍵
- **Activity History**: See recent progress and achievements
- **Responsive Design**: Works on desktop and mobile devices

## 🏗️ Project Structure

```
MatchaCode/
├── src/
│   ├── config.js              # App configuration and constants
│   ├── main.js                # Main application entry point
│   ├── controllers/
│   │   ├── globalController.js    # Global app operations
│   │   └── userController.js      # User-specific operations
│   ├── models/
│   │   ├── globalModel.js         # Global data model
│   │   └── userModel.js           # User data model
│   ├── services/
│   │   └── supabase-client.js     # Database operations
│   ├── utils/
│   │   ├── dateUtils.js           # Date utility functions
│   │   └── formatUtils.js         # Formatting utilities
│   └── views/
│       └── ui.js                  # UI manipulation and updates
├── index.html                 # Main HTML file
├── styles.css                 # CSS styles
├── package.json               # Dependencies and scripts
└── vercel.json               # Vercel deployment config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- Modern web browser with ES6 module support
- Supabase account and project

### Environment Setup

1. **Create environment file**:
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit with your values
   nano .env.local
   ```

2. **Set environment variables**:
   ```bash
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # App Configuration
   VITE_APP_PASSWORD=your_secure_password
   ```

### Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   # or
   npm start
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000`

### Production

The app is designed to be deployed on Vercel as a static site.

## 🏛️ Architecture

### Modular Design

The application follows a modular architecture with clear separation of concerns:

- **Models**: Handle data structure and business logic
- **Controllers**: Manage operations and coordinate between models and views
- **Views**: Handle DOM manipulation and UI updates
- **Services**: Manage external API calls and data persistence
- **Utils**: Provide utility functions for common operations

### Data Flow

1. **Initialization**: App loads data from Supabase or localStorage
2. **User Actions**: Controllers handle user interactions
3. **Data Updates**: Models update application state
4. **UI Updates**: Views reflect changes in the DOM
5. **Persistence**: Services save data to Supabase and localStorage

## 🔧 Configuration

### Environment Variables

The app uses Supabase for data persistence. Configuration is in `src/config.js`:

- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `ACCESS_PASSWORD`: Authentication password (default: 'matcha')

### Feature Flags

Enable/disable features in `src/config.js`:

```javascript
FEATURES: {
    ENABLE_NOTIFICATIONS: true,
    ENABLE_SOUND_EFFECTS: false,
    ENABLE_ANIMATIONS: true,
    ENABLE_OFFLINE_MODE: true
}
```

## 📱 Usage

1. **Check In**: Click "Mark Complete" for your daily challenge
2. **Authenticate**: Enter the password to confirm completion
3. **Track Progress**: View your streak and total problems solved
4. **Stay Motivated**: See combined progress with your coding partner!

## 🛠️ Development

### Adding New Features

1. **Models**: Add data structures and business logic
2. **Controllers**: Add operations and API calls
3. **Views**: Add UI components and interactions
4. **Services**: Add external integrations

### Code Style

- Use ES6+ features
- Follow modular architecture
- Add JSDoc comments for functions
- Use meaningful variable names
- Handle errors gracefully

## 🚀 Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure build settings (static site)
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the project (if needed)
2. Upload files to your hosting provider
3. Configure server for SPA routing (if needed)

## 📄 License

MIT License - see LICENSE file for details

## 👥 Contributors

- **Bilge Akyol** - Creator and developer
- **Domenica** - Coding partner and motivator

---

*Powered by matcha and motivation © 2025 Bilge Akyol* 🍵
*Keep coding and stay motivated together! 💪*
