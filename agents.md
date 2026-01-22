# Vehicore Dashboard - Project Documentation

## Project Structure

```
vehicore-dashboard/
├── public/                    # Static assets
├── src/
│   ├── api/
│   │   ├── repositories/      # API endpoint repositories (direct axios calls)
│   │   │   ├── auth.repo.ts
│   │   │   ├── billing.repo.ts
│   │   │   ├── apiKeys.repo.ts
│   │   │   └── usage.repo.ts
│   │   ├── services/          # Business logic layer
│   │   │   └── auth.service.ts
│   │   ├── types/             # API-related TypeScript types
│   │   │   └── api.d.ts
│   │   └── client.ts          # Axios instance with interceptors
│   ├── stores/                # Effector state management
│   │   └── auth.store.ts      # Auth state, events, and effects
│   ├── hooks/                 # Custom React hooks
│   │   ├── useAuth.ts         # Auth state and actions hook
│   │   └── useProtectedRoute.ts
│   ├── pages/                 # Page components
│   │   ├── Login/
│   │   ├── SignUp/
│   │   ├── ForgotPassword/
│   │   ├── ResetPassword/
│   │   ├── Dashboard/
│   │   ├── Settings/
│   │   ├── Billing/
│   │   ├── APIKeys/
│   │   └── Usage/
│   ├── components/
│   │   ├── layout/            # Layout components
│   │   │   ├── AuthLayout.tsx
│   │   │   └── DashboardLayout.tsx
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   └── label.tsx
│   │   ├── common/            # Shared components
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   └── ProtectedRoute.tsx # Auth guard component
│   ├── utils/
│   │   ├── constants.ts       # App constants (API URLs, endpoints, etc.)
│   │   ├── helpers.ts         # Utility functions
│   │   └── validators.ts      # Zod validation schemas
│   ├── App.tsx                # Main app component with routing
│   ├── main.tsx               # App entry point
│   └── index.css              # Global styles and Tailwind directives
├── agents.md                  # This file
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.cjs
└── .prettierrc
```

## How to Run, Lint, and Build

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

### Preview
```bash
npm run preview
```
Previews the production build locally

## API Layer Organization

### Repositories (`src/api/repositories/`)
Repositories are the lowest level of the API layer. They contain direct axios calls to specific endpoints.

**Pattern:**
- Each repository file handles one domain (e.g., `auth.repo.ts`, `billing.repo.ts`)
- Functions are named after the action (e.g., `login`, `signUp`, `getBillingInfo`)
- Functions accept typed request data and return typed responses
- No business logic, only API calls

**Example:**
```typescript
// auth.repo.ts
export const authRepository = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data)
    return response.data
  }
}
```

### Services (`src/api/services/`)
Services contain business logic and orchestrate repository calls. They handle side effects like token storage.

**Pattern:**
- Services call repositories
- Handle token storage/retrieval
- Transform data if needed
- Handle error scenarios

**Example:**
```typescript
// auth.service.ts
export const authService = {
  login: async (credentials: LoginRequest) => {
    const response = await authRepo.login(credentials)
    // Store tokens
    if (response.accessToken) {
      setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken)
    }
    return response
  }
}
```

### API Client (`src/api/client.ts`)
The axios instance with interceptors configured:
- Request interceptor: Adds auth token from localStorage
- Response interceptor: Handles 401 errors (token expired), clears tokens, redirects to login

### Types (`src/api/types/api.d.ts`)
All API-related TypeScript types:
- Request/Response types for each endpoint
- User, Billing, API Keys, Usage types
- Error types

## Auth State Management (Effector)

### Stores (`src/stores/auth.store.ts`)

**Stores:**
- `$user` - Current authenticated user
- `$isAuthenticated` - Boolean indicating auth status
- `$authLoading` - Loading state for auth operations
- `$authError` - Error message from auth operations

**Effects:**
- `loginFx` - Login effect (calls auth service)
- `signUpFx` - Signup effect
- `logoutFx` - Logout effect
- `forgotPasswordFx` - Forgot password effect
- `resetPasswordFx` - Reset password effect
- `checkAuthFx` - Check if user is authenticated on app start

**How it works:**
1. Effects call services (which call repositories)
2. On success, stores are updated via `sample` operators
3. Components subscribe to stores via `useUnit` hook from `effector-react`

### Token Persistence
- Tokens are stored in `localStorage`:
  - `access_token` - JWT access token
  - `refresh_token` - JWT refresh token (if supported)
- Tokens are set/cleared in the auth service layer
- On app start, `checkAuthFx` verifies token existence

### Using Auth State in Components
```typescript
import { useAuth } from '../hooks/useAuth'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  
  // Use auth state and actions
}
```

## How to Add a New Page

1. **Create page component** in `src/pages/YourPage/YourPage.tsx`:
```typescript
export function YourPage() {
  return <div>Your page content</div>
}
```

2. **Add route** in `src/App.tsx`:
```typescript
import { YourPage } from './pages/YourPage/YourPage'

<Route
  path="/your-page"
  element={
    <ProtectedRoute>
      <DashboardLayout>
        <YourPage />
      </DashboardLayout>
    </ProtectedRoute>
  }
/>
```

3. **Add navigation link** in `src/components/common/Sidebar.tsx`:
```typescript
const navigation = [
  // ... existing items
  { name: 'Your Page', href: '/your-page', icon: YourIcon },
]
```

## How to Add a New API Endpoint

### Step 1: Define Types
Add request/response types in `src/api/types/api.d.ts`:
```typescript
export interface YourRequest {
  field1: string
  field2: number
}

export interface YourResponse {
  data: string
}
```

### Step 2: Create Repository Function
Add function to appropriate repository in `src/api/repositories/`:
```typescript
// yourDomain.repo.ts
export const yourDomainRepository = {
  getData: async (data: YourRequest): Promise<YourResponse> => {
    const response = await apiClient.post<YourResponse>('/your-endpoint', data)
    return response.data
  }
}
```

### Step 3: Create Service Function (if needed)
Add business logic in `src/api/services/yourDomain.service.ts`:
```typescript
import * as yourRepo from '../repositories/yourDomain.repo'

export const yourDomainService = {
  getData: async (data: YourRequest) => {
    // Add business logic here
    return await yourRepo.getData(data)
  }
}
```

### Step 4: Create Effector Effect (if state management needed)
Add effect in `src/stores/yourDomain.store.ts`:
```typescript
import { createEffect, createStore } from 'effector'
import { yourDomainService } from '../api/services/yourDomain.service'

export const getDataFx = createEffect((data: YourRequest) =>
  yourDomainService.getData(data)
)

export const $yourData = createStore<YourResponse | null>(null)

sample({
  clock: getDataFx.doneData,
  target: $yourData
})
```

### Step 5: Use in Component
```typescript
import { useUnit } from 'effector-react'
import { $yourData, getDataFx } from '../stores/yourDomain.store'

function YourComponent() {
  const yourData = useUnit($yourData)
  // Use yourData and getDataFx
}
```

## Architecture Rules

1. **Repository Pattern**: All API calls go through repositories
2. **Service Layer**: Business logic lives in services, not repositories
3. **No Direct Axios in Components**: Components use hooks/services, never axios directly
4. **State Management**: Use Effector for global state; local state for UI-only concerns
5. **Type Safety**: All types must be explicitly declared; avoid `any`
6. **Code Splitting**: Keep files under ~300 lines; split if larger
7. **Separation of Concerns**: UI components are presentational; logic lives in hooks/services

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Router 6** - Client-side routing
- **Effector** - State management
- **Axios** - HTTP client
- **react-hook-form** - Form handling
- **Zod** - Schema validation
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **ESLint** - Linting
- **Prettier** - Code formatting

## Environment Variables

Create a `.env` file for local development:
```
VITE_API_BASE_URL=https://vehicore.dev-stage.fyi/api-gateway
```

## Code Style

- **Semicolons**: No semicolons (Prettier config)
- **Quotes**: Single quotes
- **Indentation**: 2 spaces
- **Line Length**: 100 characters
- **Type Safety**: Strict TypeScript, no `any` allowed

## Version Management

Bump package version in `package.json` after each feature or significant change:
```bash
npm version patch  # for bug fixes
npm version minor  # for new features
npm version major  # for breaking changes
```
