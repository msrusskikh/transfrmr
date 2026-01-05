# Ultra-Minimal Interactive Education Platform

An ultra-minimal, production-ready interactive education web app built with Next.js 14, featuring a clean, distraction-free interface inspired by OpenAI/ChatGPT design principles.

## 🚀 Features

- **4 Learning Modules** with structured content
- **Interactive Quizzes** (MCQ and reflection-based)
- **Progress Tracking** with visual indicators
- **Keyboard Shortcuts** for efficient navigation
- **Command Menu** for quick lesson search and navigation
- **Responsive Design** optimized for all devices
- **Dark/Light Mode** with system preference detection
- **Clean Typography** with excellent readability

## 🛠️ Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Radix UI** primitives
- **Zustand** for state management
- **Supabase** for authentication
- **Lucide React** for icons

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── learn/            # Learning routes
│   │   ├── [module]/     # Dynamic module routes
│   │   └── [section]/    # Dynamic lesson routes
│   └── page.tsx          # Landing page
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── lesson/           # Lesson-specific components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions
│   ├── content.ts        # Content management
│   ├── progress.ts       # Progress tracking
│   ├── keyboard.ts       # Keyboard shortcuts
│   └── types.ts          # TypeScript types
└── content/              # MDX content (future)
```

## 🎯 Content Model

Each lesson includes:
- **Frontmatter**: title, summary, duration, objectives, prerequisites
- **Quiz Support**: Multiple choice questions and reflection prompts
- **Progress Tracking**: Automatic completion detection

## ⌨️ Keyboard Shortcuts

- **K** / **⌘K** → Open command menu
- **J** → Previous lesson
- **L** → Next lesson
- **G** then **M** → Go to modules overview

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-kickstart
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## 📚 Adding Content

### Current State
The app currently uses hardcoded content in `src/lib/content.ts` with 4 modules:
1. **Introduction** (3 lessons)
2. **Core Concepts** (2 lessons)
3. **Practical Application** (2 lessons)
4. **Mastery & Beyond** (2 lessons)

### Future MDX Integration
To add your own MDX content:

1. Create MDX files in `src/content/modules/[module-id]/[lesson-id].mdx`
2. Use the frontmatter format:
```mdx
---
slug: lesson-slug
title: "Lesson Title"
summary: "Brief description"
duration: 10
objectives:
  - "Learning objective 1"
  - "Learning objective 2"
prerequisites: []
module: 1
section: 1
quiz:
  - type: mcq
    question: "Question text?"
    choices: ["A", "B", "C", "D"]
    answer: "A"
  - type: reflection
    prompt: "Reflection prompt"
---

# Lesson Content

Your lesson content here...
```

## 🎨 Design Principles

- **Minimal**: Clean, distraction-free interface
- **Readable**: Generous line-height and spacing
- **Accessible**: WCAG 2.1 AA compliant
- **Responsive**: Mobile-first design approach
- **Fast**: Optimized for performance

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
# Get these values from your Supabase project settings: https://app.supabase.com/project/_/settings/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI API (if using AI features)
OPENAI_API_KEY=your_openai_api_key
```

### Supabase Setup

1. Create a new project at [Supabase](https://app.supabase.com)
2. Go to Project Settings → API
3. Copy your Project URL and anon/public key
4. Add them to your `.env.local` file
5. Enable Email authentication in Authentication → Providers → Email

The authentication system will:
- Protect `/learn` routes (requires login)
- Allow public access to home page, login, and signup pages
- Provide user session management across the app

### Styling
The app uses Tailwind CSS with custom CSS variables for theming. Colors and spacing can be customized in `src/app/globals.css`.

## 🧪 Testing

The app includes:
- TypeScript type checking
- ESLint configuration
- Responsive design testing

## 📱 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues, please check the existing issues or create a new one.

---

**Built with ❤️ using Next.js 14 and modern web technologies**
