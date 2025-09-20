# Database Setup Instructions

This guide will help you set up the Supabase database for Deal Ivica AI.

## Prerequisites

1. A Supabase account at [supabase.com](https://supabase.com)
2. A new Supabase project created

## Step 1: Create a Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Fill in your project details:
   - **Name**: Deal Ivica AI
   - **Database Password**: Choose a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (usually takes 2-3 minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Project API keys** > **anon** **public** (starts with `eyJ...`)

## Step 3: Update Environment Variables

1. Open your `.env` file in the project root
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 4: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy the entire contents of `database_schema.sql`
4. Paste it into the SQL editor
5. Click **RUN** to execute the schema

This will create:
- `decks` table with proper structure
- `access_logs` table for analytics
- Proper indexes for performance
- Row Level Security (RLS) policies
- Necessary permissions

## Step 5: Verify the Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see two tables:
   - `decks`
   - `access_logs`
3. Click on the `decks` table to verify the structure

## Step 6: Test the Application

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Go to `http://localhost:5173`
3. Sign up for a new account
4. Try creating a new deck
5. Check your Supabase dashboard to verify the deck was created

## Authentication Setup

The application uses Supabase Auth which is automatically configured. However, if you want to enable additional providers:

### Enable Google OAuth (Optional)

1. In Supabase dashboard, go to **Authentication** > **Providers**
2. Click on **Google**
3. Enable the provider
4. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add your Supabase callback URL: `https://your-project-id.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret to Supabase

## Row Level Security (RLS)

The schema includes RLS policies that ensure:
- Users can only see and modify their own decks
- Shared decks can be accessed via unique URLs
- Access logs are properly isolated per user

## Troubleshooting

### Common Issues

1. **"Missing VITE_SUPABASE_URL environment variable"**
   - Make sure your `.env` file has the correct Supabase URL
   - Restart your development server after updating `.env`

2. **Authentication not working**
   - Verify your Supabase URL and anon key are correct
   - Check that email confirmation is enabled in Supabase Auth settings

3. **Database insert errors**
   - Verify the database schema was applied correctly
   - Check the browser console for detailed error messages
   - Ensure RLS policies are properly set

4. **Deck creation fails**
   - The app has fallback to mock data, so deck creation should work even without external API
   - Check the database logs in Supabase dashboard

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Look at the Supabase dashboard logs
3. Verify all environment variables are set correctly
4. Ensure the database schema was applied successfully

## Security Notes

- Never commit your `.env` file to version control
- Use environment-specific credentials for development vs production
- The RLS policies ensure data security, but always test them thoroughly
- Consider enabling additional Supabase security features for production

## Next Steps

Once the database is set up:
1. Test all authentication flows (signup, login, logout)
2. Test deck creation and retrieval
3. Verify the mock data fallback works
4. Set up the Presenton API integration (optional)
5. Deploy to production with proper environment variables