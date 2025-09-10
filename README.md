# KidPoint Tracker - Firebase Studio

A NextJS application for tracking student points, attendance, and helper activities in educational environments. Built with Firebase Firestore for real-time data synchronization.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([Download here](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Firebase Account** ([Sign up here](https://firebase.google.com/))

### 1. Firebase Setup

#### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "kidpoint-tracker")
4. Follow the setup wizard

#### Step 2: Enable Firestore Database
1. In Firebase Console, navigate to **Firestore Database**
2. Click "Create database"
3. **IMPORTANT**: Start in **Test mode** for initial setup
4. Choose a location close to your users
5. Click "Done"

#### Step 3: Configure Authentication (Optional)
1. Go to **Authentication** → **Sign-in method**
2. Enable desired providers (Google, Email/Password, etc.)

#### Step 4: Get Firebase Configuration
1. Go to **Project settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Web app" icon (`</>`)
4. Register your app with a nickname
5. Copy the `firebaseConfig` object

### 2. Local Setup

#### Step 1: Clone and Install
```bash
git clone <your-repo-url>
cd studio
npm install
```

#### Step 2: Configure Firebase
Update `/src/lib/firestore.ts` with your Firebase configuration:

```javascript
const firebaseConfig = {
  projectId: 'your-project-id',
  appId: 'your-app-id',
  storageBucket: 'your-project-id.appspot.com',
  apiKey: 'your-api-key',
  authDomain: 'your-project-id.firebaseapp.com',
  messagingSenderId: 'your-sender-id',
};
```

#### Step 3: Run the Application
```bash
npm run dev
```

Visit `http://localhost:9002` to access the application.

## 📊 Application Features

- **Student Management**: Add, edit, and manage student profiles
- **Point System**: Award/deduct points for various activities
- **Attendance Tracking**: Mark monthly attendance (10 points per attendance)
- **Referral Rewards**: Track friend referrals (30 points per referral)
- **CSV Import**: Bulk import students from CSV files
- **Real-time Sync**: All changes sync instantly across devices

## 🔧 Troubleshooting

### Database Connection Issues

#### "Database Connection Failed" Error
**Causes:**
- Firestore database not created
- Wrong project configuration
- Network connectivity issues
- Browser compatibility problems

**Solutions:**
1. **Check Firestore Setup**:
   - Ensure Firestore database is created in Firebase Console
   - Verify database is in **Test mode** initially
   - Check if location is selected

2. **Verify Configuration**:
   - Double-check `firebaseConfig` in `/src/lib/firestore.ts`
   - Ensure `projectId` matches your Firebase project
   - Confirm all config values are correct

3. **Network & Browser**:
   - Check internet connection
   - Disable browser extensions temporarily
   - Try incognito/private browsing mode
   - Clear browser cache and cookies

#### "Permission Denied" Errors
**Causes:**
- Firestore security rules too restrictive
- Authentication required but user not signed in

**Solutions:**
1. **For Development** (Test Mode):
   ```javascript
   // Firestore Rules (Firebase Console → Firestore → Rules)
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true; // TEST MODE ONLY
       }
     }
   }
   ```

2. **For Production**:
   - Implement proper authentication
   - Set up secure Firestore rules
   - Validate user permissions

#### Data Not Saving
**Common Issues:**
1. **Network Problems**: Check console for network errors
2. **Quota Exceeded**: Check Firebase usage in console
3. **Invalid Data**: Ensure data matches Firestore data types
4. **Rules Issues**: Verify write permissions in Firestore rules

### Performance Issues

#### Slow Loading
- Check network connection
- Monitor Firestore usage in Firebase Console
- Consider implementing data pagination for large datasets

#### Memory Issues
- Clear browser cache
- Restart the application
- Check for memory leaks in browser dev tools

### Development Issues

#### Build Errors
```bash
# Check for TypeScript errors
npm run typecheck

# Fix linting issues
npm run lint

# Clean install dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Port Already in Use
```bash
# Kill process on port 9002
npx kill-port 9002

# Or use different port
npm run dev -- -p 3000
```

## 📝 Getting Started Guide

### For New Users

1. **First Time Setup**:
   - Follow Firebase setup instructions above
   - Run the application locally
   - Navigate to the dashboard

2. **Adding Students**:
   - Click "Add Student" button
   - Fill in student information
   - Or use CSV import for bulk addition

3. **Managing Points**:
   - Click on student cards to award/deduct points
   - Use quick action buttons for common point values
   - Track attendance to automatically award points

4. **Understanding the Interface**:
   - **Dashboard**: Overview of all students and their points
   - **Search**: Find specific students quickly
   - **Import**: Add multiple students from CSV
   - **Helper Tracking**: Track helper/volunteer attendance

### CSV Import Format
Create a CSV file with these columns:
```
name,points,birthday
John Doe,50,2010-05-15
Jane Smith,75,2009-12-03
```

Required: `name`
Optional: `points`, `birthday`

## 🛡️ Security Best Practices

### For Production Deployment

1. **Firestore Rules**: Replace test mode with proper security rules
2. **Environment Variables**: Store sensitive config in environment variables
3. **Authentication**: Implement user authentication
4. **HTTPS**: Ensure app is served over HTTPS
5. **Regular Updates**: Keep dependencies updated

### Recommended Firestore Rules for Production
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /students/{document} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    match /helpers/{document} {
      allow read, write: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
  }
}
```

## 📞 Support

If you continue to experience issues:

1. Check the browser console for error messages
2. Verify Firebase project status in Firebase Console
3. Review [Firebase Documentation](https://firebase.google.com/docs)
4. Check [Next.js Documentation](https://nextjs.org/docs) for framework-specific issues

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
