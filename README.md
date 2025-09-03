# 🍵 MatchaCode - Daily LeetCode Challenge Tracker

A fun and motivating static website to track daily LeetCode challenges between friends, with a matcha-themed accountability system!

## 🌟 Features

- **Daily Challenge Tracking** - Mark your LeetCode problems as complete
- **Streak Counter** - Track your consecutive days of coding
- **Matcha Tracker** - Keep count of matcha owed when challenges are missed
- **Activity History** - See your recent progress
- **Simple Authentication** - Password-protected for just you and your friend
- **Responsive Design** - Works great on desktop and mobile
- **Local Storage** - Data persists between sessions

## 🚀 Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Enter the password**: `matcha2024`
4. **Start tracking** your daily LeetCode challenges!

## 🔐 Authentication

The app uses a simple password system. The default password is `matcha2024` (hint: it's the drink that motivates us to code! 🍵).

To change the password, edit the `accessPassword` variable in `script.js`:

```javascript
this.accessPassword = 'your-new-password';
```

## 📱 How to Use

1. **Login** with the shared password
2. **Mark Complete** when you finish today's LeetCode challenge
3. **Add Matcha Owed** if you miss a day (resets your streak)
4. **Track Progress** with the stats dashboard
5. **View History** of your challenges and matcha owed

## 🎨 Customization

### Changing the Theme
Edit the CSS variables in `styles.css` to customize colors:

```css
/* Main gradient background */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Matcha green accent */
color: #4CAF50;
```

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

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **Storage**: Browser localStorage
- **Authentication**: Simple password-based
- **Responsive**: Mobile-first design
- **Performance**: Optimized for fast loading

## 📊 Data Storage

All data is stored locally in your browser using localStorage:
- Daily challenge completions
- Streak counters
- Matcha history
- Activity log

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

MatchaCode was created to make daily coding practice more fun and accountable. The matcha theme adds a playful element to the serious business of becoming a better programmer!

**Remember**: The best way to get better at coding is consistent practice. Even if you miss a day, don't give up - tomorrow is a new opportunity to get back on track! 💪

---

*Happy coding! 🚀*