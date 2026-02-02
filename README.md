# Whatsbott

A WhatsApp Business automation platform built with React and Supabase.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase (Auth, Database, Edge Functions)
- TanStack React Query

## Prerequisites

- Node.js 18+ (install via [nvm](https://github.com/nvm-sh/nvm))
- npm or yarn

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd whatsbott
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── components/     # Reusable UI components
├── contexts/       # React context providers
├── hooks/          # Custom React hooks
├── integrations/   # Third-party integrations (Supabase)
├── lib/            # Utility functions
├── pages/          # Page components
│   ├── auth/       # Authentication pages
│   └── dashboard/  # Dashboard pages
└── types/          # TypeScript type definitions
```

## Using VS Code

1. Open the project folder in VS Code
2. Install recommended extensions (ESLint, Tailwind CSS IntelliSense)
3. Open the integrated terminal (`Ctrl+`` ` or `Cmd+`` `)
4. Run `npm install` then `npm run dev`
5. Open `http://localhost:8080` in your browser

## Building for Production

```bash
npm run build
```

The build output will be in the `dist/` folder.

## License

MIT
