# Firebase Backend Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `hvr-photography`
4. Enable Google Analytics (recommended)
5. Click "Create Project"

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get Started**
2. Click **Sign-in method** tab
3. Enable **Email/Password** authentication
4. Click **Save**

## Step 3: Create Firestore Database

1. Go to **Firestore Database** → **Create database**
2. Choose **Start in production mode**
3. Select location: `us-central` (or closest to Toronto)
4. Click **Enable**

## Step 4: Set Up Security Rules

Go to **Firestore Database** → **Rules** and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin collection - only admins can read
    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
      allow write: if false; // Only create admins manually
    }
    
    // Customers - only admins can access
    match /customers/{customerId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Projects - only admins can access
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Inquiries - anyone can create, only admins can read
    match /inquiries/{inquiryId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Bookings - anyone can create, only admins can read
    match /bookings/{bookingId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Quotes - anyone can create, only admins can read
    match /quotes/{quoteId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Email campaigns - only admins
    match /emailCampaigns/{campaignId} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Coupons - admins write, anyone can read
    match /coupons/{couponCode} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Blog posts - admins write, anyone can read
    match /blogPosts/{postId} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Analytics - only admins
    match /analytics/{date} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Client portal - customers can read their own data
    match /clientPortal/{customerId} {
      allow read: if request.auth != null && request.auth.uid == customerId;
      allow write: if false;
    }
  }
}
```

## Step 5: Get Firebase Configuration

1. Go to **Project Settings** (gear icon) → **General**
2. Scroll to "Your apps" section
3. Click **Web** icon (</>) to add a web app
4. Register app name: `HVR Photography Website`
5. Copy the `firebaseConfig` object
6. Open `firebase-config.js` in your project
7. Replace the placeholder values with your actual config

Example:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "hvr-photography.firebaseapp.com",
  projectId: "hvr-photography",
  storageBucket: "hvr-photography.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-XXXXXXXXXX"
};
```

## Step 6: Create Admin User

1. Go to **Authentication** → **Users** tab
2. Click **Add user**
3. Enter your email and password
4. Click **Add user**
5. Copy the **User UID** (you'll need this)

## Step 7: Add Admin to Firestore

1. Go to **Firestore Database** → **Data** tab
2. Click **Start collection**
3. Collection ID: `admins`
4. Document ID: Paste the User UID from step 6
5. Add fields:
   - Field: `email`, Type: string, Value: your email
   - Field: `name`, Type: string, Value: your name
   - Field: `role`, Type: string, Value: `admin`
   - Field: `createdAt`, Type: timestamp, Value: (current time)
6. Click **Save**

## Step 8: Enable Storage (for photo uploads)

1. Go to **Storage** → **Get started**
2. Start in **production mode**
3. Choose same location as Firestore
4. Click **Done**

## Step 9: Set Storage Rules

Go to **Storage** → **Rules** and paste:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Project photos - only admins can upload
    match /projects/{projectId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Customer uploads - authenticated users only
    match /uploads/{customerId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Step 10: Test the Setup

1. Open your website
2. Navigate to `/admin/login.html`
3. Enter the email and password you created
4. You should be redirected to the dashboard

## Step 11: Set Up Email Service (EmailJS)

1. Go to [EmailJS](https://www.emailjs.com/)
2. Sign up for free account
3. Create email service:
   - Go to **Email Services**
   - Click **Add New Service**
   - Choose **Gmail** (or your email provider)
   - Connect your email account
4. Create email templates:
   - Go to **Email Templates**
   - Click **Create New Template**
   - Create templates for:
     - Booking confirmation
     - Quote sent
     - Project delivery
     - Birthday wishes
     - Festival greetings
5. Get your credentials:
   - Service ID
   - Template IDs
   - Public Key
6. Add to your website configuration

## Step 12: Google Calendar Integration (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Google Calendar API**
4. Create credentials (OAuth 2.0 Client ID)
5. Add authorized redirect URIs:
   - `http://localhost:8080`
   - Your production domain
6. Download credentials JSON
7. Implement in admin dashboard

## Step 13: AI Chatbot Setup

For the AI chatbot, you have two options:

### Option A: OpenAI GPT (Recommended)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create account and get API key
3. Add to your configuration
4. Cost: ~$0.002 per conversation

### Option B: Free Alternative (Hugging Face)
1. Use free models from Hugging Face
2. More setup required
3. Slower response times

## Troubleshooting

### Login not working?
- Check Firebase config is correct
- Verify admin user exists in Authentication
- Confirm admin document exists in Firestore
- Check browser console for errors

### Database access denied?
- Verify security rules are set correctly
- Check user is authenticated
- Confirm admin document exists

### Images not loading?
- Check Storage rules
- Verify file paths are correct
- Check CORS settings

## Next Steps

Once Firebase is set up:
1. Test admin login
2. Add sample customer data
3. Create test project
4. Test email sending
5. Configure AI chatbot
6. Deploy to production

## Production Deployment

When ready to deploy:
1. Update Firebase config with production domain
2. Add production domain to authorized domains in Firebase
3. Update security rules if needed
4. Set up custom domain
5. Enable SSL/HTTPS
6. Test all features in production

## Support

If you encounter issues:
- Check Firebase Console for errors
- Review browser console logs
- Verify all configuration values
- Check security rules

Need help? The Firebase documentation is excellent:
https://firebase.google.com/docs
