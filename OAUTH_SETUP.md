# OAuth Setup Guide (Google & Facebook)

This guide will help you set up Google and Facebook OAuth for your CompanyLens application.

## Google OAuth Setup

### 1. Create a Google OAuth Application
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a new project
- Go to "APIs & Services" > "Credentials"
- Create an OAuth 2.0 Client ID (Web application)
- Add authorized redirect URIs:
  - `http://localhost:3000/api/auth/callback/google` (development)
  - `http://localhost:8000/api/auth/callback/google` (backend)
  - Add your production URLs

### 2. Add to Backend `.env`
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

### 3. Add to Frontend `.env.local`
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

## Facebook OAuth Setup

### 1. Create a Facebook App
- Go to [Facebook Developers](https://developers.facebook.com/)
- Create a new app or use existing
- Set App Domains: `localhost:3000` (development)
- Go to Settings > Basic to get App ID and App Secret

### 2. Configure Login Product
- Add "Facebook Login" product
- In Settings, add:
  - Valid OAuth Redirect URIs: `http://localhost:3000/api/auth/callback/facebook`

### 3. Add to Backend `.env`
```env
FACEBOOK_CLIENT_ID=your_facebook_app_id
FACEBOOK_CLIENT_SECRET=your_facebook_app_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/callback/facebook
```

### 4. Add to Frontend `.env.local`
```env
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

## How It Works

1. **Frontend**: User clicks "Sign in with Google" or "Sign in with Facebook"
2. **OAuth Provider**: Redirects to provider login
3. **Frontend**: Receives access token
4. **Frontend → Backend**: Sends token to `/api/auth/social/{provider}`
5. **Backend**: Verifies token with provider, creates/updates user
6. **Backend → Frontend**: Returns auth token
7. **Frontend**: Stores token and redirects to dashboard

## API Endpoints

- **POST** `/api/auth/social/google` - Sign in/up with Google
- **POST** `/api/auth/social/facebook` - Sign in/up with Facebook

Both endpoints require:
```json
{
  "token": "access_token_from_provider"
}
```

Response:
```json
{
  "user": {
    "id": "...",
    "email": "...",
    "name": "..."
  },
  "token": "sanctum_api_token",
  "token_type": "Bearer"
}
```

## Running the Application

Make sure to:
1. Set up environment variables in both backend and frontend
2. Run migrations: `php artisan migrate`
3. Start the backend: `php artisan serve`
4. Start the frontend: `npm run dev`

