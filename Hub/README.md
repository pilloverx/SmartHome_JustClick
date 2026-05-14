# SmartHome_JustClick Website

The interactive frontend for SmartHome_JustClick - a local-first smart home automation platform.

## 🎨 Design Philosophy

This website features a **Home Assistant & ESPHome-inspired theme** combining:
- HA Blue (#03A9F4) as primary color
- ESP Orange (#E8691D) as accent
- Clean, modern glassmorphism components
- Dark mode support with system preference detection
- Mobile-first responsive design

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# → http://localhost:3000
```

## 🚢 Deployment (Phase A Complete)

### Vercel (Recommended)
```bash
# Login to Vercel (first time only)
npm install -g vercel
vercel login

# Deploy (from website/ directory)
vercel
```

**Auto-deploy on push**: Connect your GitHub repo to Vercel dashboard for auto-deploy on every push to `main`.

### Environment Variables
Create `.env.local` (local development only):
```env
# Optional: Vercel AI SDK for chat features (Phase B)
NEXT_PUBLIC_OPENAI_API_KEY=your_key_here
```

### Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## 📋 Phase A Status (✅ Complete)

**Completed:**
- ✅ Next.js 15+ scaffolding with TypeScript strict mode
- ✅ Tailwind CSS with Home Assistant & ESPHome color theme (#03A9F4, #E8691D)
- ✅ Responsive homepage with hero, features, gallery placeholders
- ✅ Dark mode toggle (system preference + localStorage)
- ✅ Navigation + footer with GitHub links
- ✅ Mobile-first design (tested on mobile breakpoints)
- ✅ Utility libraries (sensors.ts, templates.ts, utils.ts)
- ✅ gitignore, tsconfig, all build configs

**Ready for Deployment:** Push `website/` folder to `main` branch → Vercel auto-deploy

## 📁 Project Structure

```
website/
├── app/
│   ├── layout.tsx           # Root layout with nav + footer
│   ├── page.tsx             # Home page with hero + sections
│   ├── api/                 # API routes (future)
│   │   ├── chat.ts          # Vercel AI SDK chat endpoint
│   │   └── github-stats.ts  # GitHub metrics fetcher
│   └── components/          # Reusable React components
│       ├── Hero.tsx         # Hero section (placeholder)
│       ├── YamlBuilder.tsx  # YAML builder interface
│       ├── Gallery.tsx      # Prototypes gallery
│       ├── SkillGenerator.tsx # OpenClaw skill generator
│       ├── Wizard.tsx       # Setup wizard
│       ├── ThemeToggle.tsx  # Dark mode toggle
│       └── EasterEggs.tsx   # Mini tools & fun features
├── lib/
│   ├── templates.ts         # YAML & skill templates
│   ├── sensors.ts           # ESPHome sensor library
│   └── utils.ts             # Helper functions
├── styles/
│   └── globals.css          # Global styles & HA theme
├── public/                  # Static assets
│   └── prototype-gifs/      # Gallery animations
├── tailwind.config.ts       # Tailwind theme config
├── tsconfig.json            # TypeScript config
├── next.config.js           # Next.js config
├── package.json             # Dependencies
└── README.md                # This file
```

## 🎯 Features (Roadmap)

### MVP (Phase A-C, ~2 weeks)
- [x] Base layout with nav + footer
- [x] Hero section with CTA
- [x] Quick start section
- [x] Features showcase with placeholders
- [x] Dark mode toggle
- [ ] YAML Builder interactive component
- [ ] Prototypes Gallery populated
- [ ] "Open in Codespaces" button working

### Phase 1 (~2-3 weeks after MVP)
- [ ] Hero chat simulator (Framer Motion)
- [ ] OpenClaw Skill Generator
- [ ] Setup Wizard with simulations
- [ ] Real-time GitHub stats
- [ ] Newsletter signup

### Phase 2+ (Extended)
- [ ] "Ask the Lobster" AI chatbot
- [ ] Live HA dashboard preview
- [ ] Community skill gallery
- [ ] Blog/tutorials section
- [ ] Video demos

## 🛠️ Technology Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **Components**: Shadcn/ui (copy-paste)
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Code Highlighting**: React Syntax Highlighter
- **AI**: Vercel AI SDK (for chat features)

## 🌑 Theme Colors

### Light Mode

| Color | Usage | Hex |
|-------|-------|-----|
| HA Blue | Primary buttons, links | `#03A9F4` |
| HA Dark Blue | Hover states | `#0288D1` |
| ESP Orange | Accents, featured content | `#E8691D` |
| Light Gray | Background surfaces | `#FAFAFA` |
| Border Gray | Dividers | `#E0E0E0` |

### Dark Mode

| Color | Usage | Hex |
|-------|-------|-----|
| HA Blue | Primary buttons, links | `#03A9F4` (same) |
| Dark Surface | Main background | `#121212` |
| Dark Surface Alt | Cards | `#1E1E1E` |
| Border Gray | Dividers | `#2C2C2C` |

## 🎨 Component Examples

### Button Variants

```tsx
// Primary (HA Blue)
<button className="btn-ha">Click me</button>

// Outline
<button className="btn-ha-outline">Click me</button>

// ESP Orange
<button className="btn-esp">Click me</button>

// Card
<div className="card-ha">Content</div>
```

### Utility Classes

```css
.card-ha       /* HA-styled card with shadow */
.badge-online  /* Green online status badge */
.badge-offline /* Red offline status badge */
.code-block    /* Styled code blocks */
.glass         /* Glassmorphism effect */
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Go to `vercel.com`
3. Create new project → Connect repo
4. Set root directory: `website/`
5. Deploy! (auto-deploys on push to main)

### GitHub Pages

Build static export:

```bash
# In next.config.js
output: 'export'

# Build
npm run build

# Push build/ to gh-pages branch
```

## 📝 Environment Variables

Create `.env.local`:

```env
# Future: API endpoints
# NEXT_PUBLIC_API_URL=
# NEXT_PUBLIC_GITHUB_TOKEN=
```

## 🔗 Links

- **GitHub Repo**: https://github.com/pilloverx/SmartHome_JustClick
- **Live Site**: https://smart-home-justclick.vercel.app (when deployed)
- **Home Assistant**: https://www.home-assistant.io
- **ESPHome**: https://esphome.io
- **Vercel Docs**: https://vercel.com/docs

## 📖 Component Development Guide

### Creating a New Component

```tsx
// components/MyComponent.tsx
'use client'

import { useState } from 'react'

export default function MyComponent() {
  const [state, setState] = useState(false)

  return (
    <div className="card-ha p-6">
      {/* Your component */}
    </div>
  )
}
```

### Using HA Theme Colors

```tsx
<div className="bg-ha-primary text-white dark:bg-ha-surface-dark p-4">
  Styled with HA colors!
</div>
```

## 🐛 Troubleshooting

### Dark mode not working
- Check localStorage for 'theme' key
- Inspect `document.documentElement.classList`
- Ensure `dark:` classes in Tailwind config

### Styles not applying
- Run `npm install` to update Tailwind
- Clear `.next/` folder: `rm -rf .next`
- Rebuild: `npm run dev`

### Build errors
- Check TypeScript: `npx tsc --noEmit`
- Clear cache: `npm run build --reset`

## 📞 Support

- **GitHub Issues**: Report bugs
- **GitHub Discussions**: Ask questions
- **Email**: Contact through repo

## 📄 License

MIT License (same as parent project)

---

**Status**: 🚀 Alpha Phase  
**Last Updated**: March 2026  
**Current Phase**: MVP Layout Complete - Ready for Component Development
