# AI Storytelling Platform

A modern, standalone AI-powered storytelling platform built with React, TypeScript, and Appwrite.

## Features

- 🤖 AI-powered story generation
- 🔐 Secure authentication with Appwrite
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS
- 📖 Story management and library
- 👤 User profiles and preferences
- 🔒 Security features and API key management

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Appwrite
- **Authentication**: Appwrite Auth with OAuth support
- **Database**: Appwrite Database
- **AI**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Appwrite account and project

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd <project-name>
```

2. Navigate to the project directory:
```bash
cd retrieved_best_project
```

3. Install dependencies:
```bash
npm install
```

4. Set up environment variables:
```bash
cp .env.example .env
```

5. Configure your Appwrite settings in `.env`

6. Start the development server:
```bash
npm run dev
```

## Project Structure

```
retrieved_best_project/
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript types
│   └── config/        # Configuration files
├── public/            # Static assets
└── ...config files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License.