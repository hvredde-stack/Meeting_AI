# Deployment & Hosting Guide - HVR Photography Website

## 🚀 Complete Deployment Guide

This guide covers everything you need to deploy your website to production and push it to GitHub.

---

## Part 1: Push to GitHub Repository

### Step 1: Create .gitignore File

First, create a `.gitignore` file to exclude sensitive data:

```bash
# Create .gitignore in project root
```

**Contents of `.gitignore`:**
```
# Firebase config with sensitive keys (DO NOT COMMIT)
firebase-config.js

# Node modules
node_modules/
.npm/

# Environment variables
.env
.env.local
.env.production

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Build outputs
dist/
build/

# Temporary files
*.tmp
.cache/
```

### Step 2: Create Firebase Config Template

Create `firebase-config.template.js` (this WILL be committed):

```javascript
// Firebase Configuration Template
// Copy this file to firebase-config.js and fill in your actual values

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
let app, auth, db, storage;

function initializeFirebase() {
  try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
}

function onAuthStateChanged(callback) {
  auth.onAuthStateChanged(callback);
}

async function isAdmin(user) {
  if (!user) return false;
  
  try {
    const adminDoc = await db.collection('admins').doc(user.uid).get();
    return adminDoc.exists;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    firebaseConfig,
    initializeFirebase,
    onAuthStateChanged,
    isAdmin
  };
}
```

### Step 3: Initialize Git Repository

```bash
# Navigate to your project
cd C:\Projects\hvr_photography_website

# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: HVR Photography website with Firebase backend"
```

### Step 4: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click the **+** icon → **New repository**
3. Repository name: `hvr-photography-website`
4. Description: "Professional photography website with Firebase backend, CRM, and AI chatbot"
5. Choose **Private** (recommended for business)
6. **DO NOT** initialize with README (you already have files)
7. Click **Create repository**

### Step 5: Push to GitHub

```bash
# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/hvr-photography-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 6: Add README to GitHub

Create `README.md` in your project:

```markdown
# HVR Photography Studio Website

Professional photography website with Firebase backend, customer management, and AI chatbot.

## Features

- 🎨 Modern, responsive design with brand colors
- 🤖 AI-powered chatbot for customer engagement
- 👥 Customer Relationship Management (CRM)
- 📊 Project tracking and management
- 📧 Email marketing automation
- 💰 Quote calculator and booking system
- 📈 Analytics and reporting
- 🔐 Secure admin dashboard

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **Features:** AI Chatbot, CRM, Project Management
- **Hosting:** Firebase Hosting / Netlify / Vercel

## Setup

1. Clone repository
2. Copy `firebase-config.template.js` to `firebase-config.js`
3. Add your Firebase credentials
4. Follow `FIREBASE_SETUP.md` for complete setup
5. Deploy using Firebase Hosting or Netlify

## Documentation

- `FIREBASE_SETUP.md` - Firebase configuration guide
- `QUICK_START.md` - Quick start guide
- `backend-implementation-plan.md` - Full feature documentation

## License

Private - All rights reserved
```

```bash
# Add README
git add README.md
git commit -m "Add README documentation"
git push
```

---

## Part 2: Deployment Options

### Option A: Firebase Hosting (Recommended) ⭐

**Pros:**
- ✅ Free tier available
- ✅ Automatic SSL/HTTPS
- ✅ Global CDN
- ✅ Integrated with Firebase backend
- ✅ Custom domain support
- ✅ Automatic deployments

**Setup:**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase Hosting
firebase init hosting

# Select options:
# - Use existing project (select your Firebase project)
# - Public directory: . (current directory)
# - Single-page app: No
# - Automatic builds with GitHub: Yes (optional)
# - Overwrite index.html: No

# Deploy
firebase deploy --only hosting
```

**Your site will be live at:**
`https://YOUR_PROJECT_ID.web.app`

**Add Custom Domain:**
```bash
firebase hosting:channel:deploy production
```

Then in Firebase Console:
1. Go to Hosting → Add custom domain
2. Enter your domain (e.g., `hvrphotography.com`)
3. Follow DNS setup instructions
4. SSL certificate auto-generated

---

### Option B: Netlify (Easy & Free)

**Pros:**
- ✅ Free tier generous
- ✅ Automatic deployments from GitHub
- ✅ Automatic SSL
- ✅ Form handling
- ✅ Easy custom domain

**Setup:**

1. Go to [Netlify.com](https://netlify.com)
2. Sign up with GitHub
3. Click **New site from Git**
4. Choose **GitHub** → Select your repository
5. Build settings:
   - Build command: (leave empty)
   - Publish directory: `.`
6. Click **Deploy site**

**Your site will be live at:**
`https://random-name-12345.netlify.app`

**Custom Domain:**
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS instructions

**Environment Variables:**
1. Site settings → Build & deploy → Environment
2. Add Firebase config as environment variables
3. Update `firebase-config.js` to use env vars

---

### Option C: Vercel (Fast & Modern)

**Pros:**
- ✅ Extremely fast
- ✅ Free for personal projects
- ✅ GitHub integration
- ✅ Automatic SSL
- ✅ Edge network

**Setup:**

1. Go to [Vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **New Project**
4. Import your GitHub repository
5. Configure:
   - Framework: Other
   - Build command: (leave empty)
   - Output directory: `.`
6. Click **Deploy**

**Your site will be live at:**
`https://hvr-photography-website.vercel.app`

---

### Option D: Traditional Web Hosting

**For cPanel/FTP hosting:**

1. **Export your files:**
   - Zip your entire project folder
   - Exclude `node_modules`, `.git`

2. **Upload via FTP:**
   - Use FileZilla or similar
   - Upload to `public_html` or `www` folder
   - Ensure `index.html` is in root

3. **Configure:**
   - Add Firebase config
   - Set up SSL certificate
   - Configure domain

---

## Part 3: Environment Variables (Production)

### For Security, Use Environment Variables

**Create `.env` file (DO NOT COMMIT):**
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123:web:abc123
FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Update `firebase-config.js` for production:**
```javascript
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:123:web:abc",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};
```

---

## Part 4: Continuous Deployment

### GitHub Actions (Automatic Deployment)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

**Setup:**
1. Generate Firebase service account key
2. Add to GitHub Secrets
3. Push to main branch → auto-deploy!

---

## Part 5: Domain Setup

### Custom Domain Configuration

**1. Purchase Domain:**
- GoDaddy, Namecheap, Google Domains
- Recommended: `hvrphotography.com`

**2. Configure DNS:**

For Firebase Hosting:
```
A Record:    @    →  151.101.1.195
A Record:    @    →  151.101.65.195
TXT Record:  @    →  (verification code from Firebase)
```

For Netlify:
```
A Record:    @    →  75.2.60.5
CNAME:       www  →  your-site.netlify.app
```

**3. SSL Certificate:**
- Automatic with Firebase/Netlify/Vercel
- Free Let's Encrypt certificate
- Auto-renewal

---

## Part 6: Post-Deployment Checklist

### ✅ Before Going Live:

**Security:**
- [ ] Firebase config not in public repo
- [ ] Admin credentials secure
- [ ] Firebase security rules set
- [ ] HTTPS enabled
- [ ] Environment variables configured

**Testing:**
- [ ] Test all forms
- [ ] Verify chatbot works
- [ ] Check admin login
- [ ] Test on mobile devices
- [ ] Verify all links work
- [ ] Check image loading

**SEO:**
- [ ] Add Google Analytics
- [ ] Submit sitemap to Google
- [ ] Add meta descriptions
- [ ] Verify Open Graph tags
- [ ] Test page speed

**Functionality:**
- [ ] Contact form sends emails
- [ ] Booking system works
- [ ] Quote calculator accurate
- [ ] Admin dashboard accessible
- [ ] Database saving data

---

## Part 7: Ongoing Management

### Regular Maintenance:

**Weekly:**
- Check new inquiries
- Respond to bookings
- Review analytics
- Backup database

**Monthly:**
- Update content
- Review security
- Check performance
- Update dependencies

**Quarterly:**
- Review Firebase usage
- Optimize costs
- Update features
- Security audit

---

## Part 8: Monitoring & Analytics

### Set Up Monitoring:

**1. Google Analytics:**
```html
<!-- Add to all pages -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

**2. Firebase Performance:**
```javascript
// Add to firebase-config.js
const perf = firebase.performance();
```

**3. Error Tracking:**
- Sentry.io (free tier)
- LogRocket
- Firebase Crashlytics

---

## Part 9: Backup Strategy

### Automated Backups:

**1. Firestore Backup:**
```bash
# Schedule daily backups
gcloud firestore export gs://your-bucket/backups/$(date +%Y%m%d)
```

**2. Code Backup:**
- GitHub (automatic)
- Local backup weekly
- Cloud storage backup

**3. Database Export:**
```javascript
// Export customers monthly
async function exportCustomers() {
  const customers = await getAllCustomers();
  const csv = convertToCSV(customers);
  downloadCSV(csv, 'customers-backup.csv');
}
```

---

## Part 10: Cost Management

### Firebase Costs:

**Free Tier (Spark Plan):**
- 50K reads/day
- 20K writes/day
- 1GB storage
- Perfect for starting!

**Paid Tier (Blaze Plan):**
- Pay as you go
- ~$25-50/month for small business
- Set budget alerts

**Cost Optimization:**
- Cache frequently accessed data
- Use indexes efficiently
- Optimize queries
- Monitor usage dashboard

---

## Quick Commands Reference

```bash
# Git Commands
git status                          # Check status
git add .                          # Stage all changes
git commit -m "message"            # Commit changes
git push                           # Push to GitHub
git pull                           # Pull latest changes

# Firebase Commands
firebase login                     # Login to Firebase
firebase init                      # Initialize project
firebase deploy                    # Deploy everything
firebase deploy --only hosting     # Deploy hosting only
firebase serve                     # Test locally

# NPM Commands
npm install                        # Install dependencies
npm run build                      # Build for production
npm run dev                        # Run development server
```

---

## Troubleshooting

### Common Issues:

**"Firebase not defined"**
- Check Firebase scripts loaded
- Verify config is correct
- Check browser console

**"Permission denied"**
- Review Firebase security rules
- Check user authentication
- Verify admin status

**"Site not loading"**
- Check DNS propagation (24-48 hours)
- Verify SSL certificate
- Check hosting configuration

**"Forms not working"**
- Verify Firebase config
- Check email service setup
- Review browser console errors

---

## Support Resources

- **Firebase Docs:** https://firebase.google.com/docs
- **GitHub Docs:** https://docs.github.com
- **Netlify Docs:** https://docs.netlify.com
- **Vercel Docs:** https://vercel.com/docs

---

## Next Steps

1. ✅ Push code to GitHub
2. ✅ Choose hosting platform
3. ✅ Deploy website
4. ✅ Configure custom domain
5. ✅ Set up monitoring
6. ✅ Test everything
7. ✅ Go live!

**Your website will be live and professional!** 🚀
