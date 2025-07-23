# Felearn - AI Storytelling Platform

An AI-powered storytelling platform that helps users create engaging stories using Google's Gemini AI.

## Setup Instructions

1. Create a `.env` file based on `.env.example`:
   ```
   VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your_project_id
   VITE_APPWRITE_DATABASE_ID=687a8ae6003b5969331a
   APPWRITE_API_KEY=your_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Features

- AI-powered story generation using Google Gemini
- User authentication and story management
- Story export functionality
- Responsive design with dark mode support
- Admin dashboard for user management

## Required Collections

The following Appwrite collections are required:
- `users`: Stores user profiles and preferences
- `stories`: Stores generated stories
- `user_settings`: Stores user configuration

## Common Issues

- **404 Not Found**: Collections don't exist - create them in your Appwrite console
- **401 Unauthorized**: Check your API keys in the environment variables