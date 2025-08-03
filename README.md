# 🐱 Felearn AI - Learn with Cute Cat Stories

<div align="center">
  <img src="public/assets/felearn-logo.png" alt="Felearn AI Logo" width="120" height="120">
  
  **Transform complex concepts into engaging visual stories featuring adorable cats**
  
  [![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://felearn.vercel.app)
  [![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
</div>

## 🌟 Features

### 🎨 **AI-Powered Visual Storytelling**
- Generate engaging stories with cute cat illustrations using Google Gemini AI
- Real-time image generation with contextual captions
- Interactive story slides with smooth animations

### 👤 **User Management**
- Secure authentication with email verification
- OAuth login (Google, GitHub)
- Password reset functionality
- User profile management

### 📚 **Story Library**
- Save and organize your generated stories
- Pin favorite stories
- Search and filter functionality
- Story management (rename, delete, export)

### 📄 **Export & Sharing**
- Export stories to PDF format
- High-quality image preservation
- Responsive design for all devices

### 🎨 **Modern UI/UX**
- Clean, intuitive interface
- Dark/Light theme support
- Responsive design
- Smooth animations and transitions

## 🚀 Live Demo

Visit [felearn.vercel.app](https://felearn.vercel.app) to try Felearn AI!

## 🛠️ Tech Stack

### **Frontend**
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server

### **Backend & Services**
- **Appwrite** - Backend-as-a-Service
  - Database (NoSQL)
  - Authentication
  - File Storage
  - Real-time subscriptions
- **Google Gemini AI** - Story and image generation
- **Vercel** - Deployment and hosting

### **Development Tools**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Appwrite account ([Get started](https://appwrite.io))
- Google Gemini API key ([Get API key](https://makersuite.google.com/app/apikey))

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/felearn-ai.git
cd felearn-ai
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
```bash
cp .env.example .env
```

Configure your environment variables in `.env`:
```env
# Appwrite Configuration
VITE_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COLLECTION_STORIES_ID=your_stories_collection_id
VITE_APPWRITE_COLLECTION_USERS_ID=your_users_collection_id
VITE_APPWRITE_BUCKET_STORY_IMAGES_ID=your_bucket_id

# Optional: Analytics
VITE_VERCEL_ANALYTICS_ID=your_analytics_id
```

### 4. Appwrite Setup

#### Create Collections:

**Stories Collection:**
```json
{
  "userId": "string",
  "email": "string", 
  "name": "string",
  "lastLogin": "datetime",
  "title": "string",
  "content": "string",
  "images": "string[]",
  "slides": "object[]",
  "createdAt": "datetime",
  "isPinned": "boolean",
  "tags": "string[]"
}
```

**Users Collection:**
```json
{
  "email": "string",
  "name": "string",
  "geminiKey": "string",
  "lastLogin": "datetime",
  "isAdmin": "boolean",
  "createdAt": "datetime",
  "emailVerification": "boolean",
  "disabled": "boolean",
  "onboardingcompleted": "boolean"
}
```

#### Create Storage Bucket:
- Name: `story-images`
- File size limit: 10MB
- Allowed file extensions: `jpg,jpeg,png,gif,webp`

### 5. Start Development Server
```bash
npm run dev
# or
yarn dev
```

Visit `http://localhost:5173` to see your app!

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Connect to Vercel:**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables:**
   - Go to your Vercel dashboard
   - Navigate to Settings → Environment Variables
   - Add all your environment variables

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Alternative Deployment Options

#### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📁 Project Structure

```
felearn-ai/
├── public/                 # Static assets
│   ├── assets/            # Images, icons, fonts
│   └── js/               # Static JavaScript files
├── src/
│   ├── components/        # React components
│   │   ├── auth/         # Authentication components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── story/        # Story-related components
│   │   └── ui/           # Reusable UI components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── styles/           # Global styles
├── .env.example          # Environment variables template
├── index.html            # Main HTML file
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 🎯 Usage Guide

### 1. **Getting Started**
- Sign up with email or use OAuth (Google/GitHub)
- Verify your email address
- Complete onboarding by adding your Gemini API key

### 2. **Creating Stories**
- Enter a concept you want explained (e.g., "How do neural networks work?")
- Watch as AI generates a story with cute cat illustrations
- Stories are automatically saved to your library

### 3. **Managing Stories**
- View all your stories in the Library
- Pin important stories
- Search and filter by title or content
- Rename, delete, or export stories

### 4. **Exporting Stories**
- Click the export button on any story
- Choose PDF format
- Download your story with high-quality images

## 🔧 Configuration

### Customizing Themes
Edit `tailwind.config.js` to customize colors and themes:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

### Adding New AI Models
Extend the AI service in `src/services/gemini.ts`:
```typescript
export class GeminiService {
  async generateWithModel(model: string, prompt: string) {
    // Implementation
  }
}
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 1. Fork & Clone
```bash
git clone https://github.com/yourusername/felearn-ai.git
cd felearn-ai
```

### 2. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes
- Follow the existing code style
- Add tests for new features
- Update documentation

### 4. Commit & Push
```bash
git commit -m 'Add amazing feature'
git push origin feature/amazing-feature
```

### 5. Create Pull Request
- Describe your changes
- Include screenshots if applicable
- Reference any related issues

### Development Guidelines
- Use TypeScript for type safety
- Follow React best practices
- Write meaningful commit messages
- Add JSDoc comments for functions
- Test your changes thoroughly

## 📊 Performance

- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Bundle Size**: < 500KB gzipped
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s

## 🔒 Security

- Secure authentication with Appwrite
- API keys encrypted and stored securely
- Input validation and sanitization
- HTTPS enforced in production
- Regular security updates

## 📈 Analytics

Track user engagement with Vercel Analytics:
```typescript
import { track } from '@vercel/analytics';

track('story_generated', {
  concept: 'neural networks',
  user_id: user.id
});
```

## 🐛 Troubleshooting

### Common Issues

**1. Gemini API Errors**
```bash
Error: API key not valid
```
- Verify your API key in settings
- Check API key permissions
- Ensure billing is enabled

**2. Appwrite Connection Issues**
```bash
Error: Failed to connect to Appwrite
```
- Check your endpoint URL
- Verify project ID
- Check network connectivity

**3. Build Errors**
```bash
Error: Cannot resolve module
```
- Clear node_modules: `rm -rf node_modules && npm install`
- Check import paths
- Verify dependencies

### Getting Help
- 📧 Email: support@felearn.ai
- 💬 Discord: [Join our community](https://discord.gg/felearn)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/felearn-ai/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful AI capabilities
- **Appwrite** - For excellent backend services
- **Vercel** - For seamless deployment
- **React Team** - For the amazing framework
- **Tailwind CSS** - For beautiful styling utilities

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/felearn-ai&type=Date)](https://star-history.com/#yourusername/felearn-ai&Date)

---

<div align="center">
  <p>Made with ❤️ and 🐱 by the Felearn AI team</p>
  <p>
    <a href="https://felearn.vercel.app">Website</a> •
    <a href="https://github.com/yourusername/felearn-ai">GitHub</a> •
    <a href="https://twitter.com/FeLearnAI">Twitter</a>
  </p>
</div>