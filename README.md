# 🚀 Deal Ivica AI

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/username/DISource)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-61DAFB)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)

**Deal Ivica AI** is a modern, AI-powered presentation creation platform with advanced gated access controls. Create stunning, professional presentations using AI technology and manage viewer access with customizable gates.

## ✨ Features

### 🎨 **AI-Powered Presentation Generation**
- Generate professional presentations from simple text prompts
- Fallback to mock data for seamless development
- Integration with Presenton API for AI content generation

### 🔒 **Advanced Gate System**
- **Contact Info Gate**: Collect viewer information
- **Signature Gate**: Require digital signatures
- **Payment Gate**: Monetize your content
- **OTP Gate**: Email/SMS verification

### 🛡️ **Secure Authentication**
- Supabase Auth integration with OAuth support
- Row Level Security (RLS) for data protection
- Protected routes with session management
- Google OAuth ready to enable

### 🎯 **Modern Architecture**
- React 19 with TypeScript strict mode
- Vite for lightning-fast development
- Tailwind CSS with custom design system
- Framer Motion animations
- Zustand for state management

### 📊 **Analytics & Insights**
- Track presentation views and engagement
- Detailed access logs and viewer analytics
- Dashboard with comprehensive metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### 1. Clone & Install
```bash
git clone https://github.com/username/DISource.git
cd DISource
npm install
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Update .env with your credentials
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
1. Create a new Supabase project
2. Run the SQL schema from `database_schema.sql` in Supabase SQL Editor
3. Update your `.env` file with the credentials

### 4. Development Server
```bash
npm run dev
```

Visit `http://localhost:5173` to see your application running! 🎉

## 📚 Documentation

- [Database Setup Guide](DATABASE_SETUP.md)
- [Presenton API Integration](PRESENTON_API_SETUP.md)

## 🛠️ Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # ESLint checking
npm run format       # Prettier formatting
npm run type-check   # TypeScript checking

# Testing
npm run test         # Run unit tests
npm run test:run     # Run tests once
npm run test:e2e     # End-to-end tests
```

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <strong>Built with ❤️ for content creators worldwide</strong>
</div>
