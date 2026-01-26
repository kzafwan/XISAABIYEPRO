
# XisaabiyePro Deployment Guide

This app is ready to be hosted for free on **Vercel** or **Netlify**.

## Hosting on Vercel (Recommended)
1. **Push to GitHub**: Upload your project files to a GitHub repository.
2. **Import to Vercel**: 
   - Go to [vercel.com](https://vercel.com) and sign in.
   - Click "Add New" -> "Project".
   - Select your GitHub repository.
3. **Configure Environment Variables**:
   - In the "Environment Variables" section during setup, add:
     - **Key**: `API_KEY`
     - **Value**: `your_gemini_api_key_here`
4. **Deploy**: Click "Deploy". Your app will be live at a `*.vercel.app` URL.

## Security Note
Your `API_KEY` is handled on the server-side during the build process or via environment injection. **Never** hardcode your API key directly into `geminiService.ts`.

## Local Development
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`
