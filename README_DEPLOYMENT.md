# ThinkCode App - Vercel Deployment Guide

## Prerequisites
1. Vercel account (free at vercel.com)
2. MongoDB Atlas account (free at mongodb.com/atlas)
3. Git repository (GitHub recommended)

## Step 1: Prepare Your Environment Variables

Create a `.env.local` file in your project root with:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/thinkcode
JWT_SECRET=your_super_secret_jwt_key_here
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

### Option B: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your Git repository
4. Vercel will auto-detect it's a React app
5. Add environment variables in project settings

## Step 3: Configure Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Click "Settings" → "Environment Variables"
3. Add:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A random secret string for JWT tokens

## Step 4: Update Frontend API URLs

After deployment, update your frontend to use the Vercel API URLs:

1. Find your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
2. Update API calls in your React components to use:
   ```javascript
   const API_BASE = process.env.NODE_ENV === 'production' 
     ? 'https://your-app.vercel.app/api' 
     : 'http://localhost:5000/api';
   ```

## Step 5: Test Your Deployment

1. Visit your Vercel URL
2. Test registration and login
3. Check admin dashboard
4. Verify MongoDB data is being saved

## File Structure for Vercel
```
thinkcode-app/
├── api/
│   └── index.js          # Vercel serverless function
├── backend/
│   ├── models/           # MongoDB models
│   └── index.js          # Original backend (for local dev)
├── src/                  # React frontend
├── vercel.json           # Vercel configuration
└── package.json          # Frontend dependencies
```

## Troubleshooting

### Common Issues:
1. **CORS errors**: Make sure your API routes are properly configured
2. **MongoDB connection**: Verify your connection string and network access
3. **Build failures**: Check that all dependencies are in package.json

### Environment Variables Not Working:
- Make sure they're set in Vercel dashboard
- Redeploy after adding new variables
- Check variable names match exactly

## Production Checklist
- [ ] Environment variables configured
- [ ] MongoDB Atlas cluster accessible
- [ ] API endpoints working
- [ ] Frontend builds successfully
- [ ] Admin and student flows tested
- [ ] CORS properly configured

Your app will be available at: `https://your-app-name.vercel.app`
