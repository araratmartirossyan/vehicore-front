# Vehicore Dashboard

A React + TypeScript dashboard application with authentication flow, built with modern tools and best practices.

## Tech Stack

- **React 18** + **TypeScript** - UI library with type safety
- **Vite** - Fast build tool
- **React Router 6** - Client-side routing
- **Effector** - State management
- **Axios** - HTTP client
- **react-hook-form** + **Zod** - Form handling and validation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **ESLint** + **Prettier** - Code quality

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the Vite dev server (usually at http://localhost:5173)

### Build

```bash
npm run build
```

Creates a production build in the `dist/` directory

### Lint

```bash
npm run lint
```

Runs ESLint to check for code issues

### Format

```bash
npm run format
```

Runs Prettier to format code

## Project Structure

See `agents.md` for detailed documentation on:
- Project structure
- API layer organization
- Auth state management
- How to add new pages/endpoints

## Features

- ✅ Complete authentication flow (Login, Sign Up, Forgot Password, Reset Password)
- ✅ Protected routes with auth guard
- ✅ Dashboard, Settings, Billing, API Keys, Usage pages
- ✅ Repository pattern for API access
- ✅ Service layer for business logic
- ✅ Effector state management
- ✅ Form validation with Zod
- ✅ Responsive UI with shadcn/ui

## Environment Variables

Create a `.env` file for local development:

```
VITE_API_BASE_URL=https://vehicore.dev-stage.fyi/api-gateway
```

## License

Private
