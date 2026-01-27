import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SmartRedirect } from './components/SmartRedirect'

const LoginPage = lazy(() => import('./pages/Login/LoginPage').then((m) => ({ default: m.LoginPage })))
const SignUpPage = lazy(() => import('./pages/SignUp/SignUpPage').then((m) => ({ default: m.SignUpPage })))
const ForgotPasswordPage = lazy(() =>
  import('./pages/ForgotPassword/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage }))
)
const ResetPasswordPage = lazy(() =>
  import('./pages/ResetPassword/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage }))
)
const ResetPasswordRedirect = lazy(() =>
  import('./pages/ResetPassword/ResetPasswordRedirect').then((m) => ({ default: m.ResetPasswordRedirect }))
)
const ConfirmEmailPage = lazy(() =>
  import('./pages/ConfirmEmail/ConfirmEmailPage').then((m) => ({ default: m.ConfirmEmailPage }))
)
const CheckoutSuccessPage = lazy(() =>
  import('./pages/Checkout/CheckoutSuccessPage').then((m) => ({ default: m.CheckoutSuccessPage }))
)
const CheckoutCancelPage = lazy(() =>
  import('./pages/Checkout/CheckoutCancelPage').then((m) => ({ default: m.CheckoutCancelPage }))
)
const DashboardPage = lazy(() =>
  import('./pages/Dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage }))
)
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))
const BillingPage = lazy(() => import('./pages/Billing/BillingPage').then((m) => ({ default: m.BillingPage })))
const APIKeysPage = lazy(() => import('./pages/APIKeys/APIKeysPage').then((m) => ({ default: m.APIKeysPage })))
const UsagePage = lazy(() => import('./pages/Usage/UsagePage').then((m) => ({ default: m.UsagePage })))

function App() {
  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
    >
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        }
      >
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/confirm-email" element={<ConfirmEmailPage />} />
          {/* Redirect API-style reset links to the SPA reset page */}
          <Route path="/api/auth/forgot-password" element={<ResetPasswordRedirect />} />
          {/* Redirect API-style confirmation links to the SPA confirmation page */}
          <Route path="/api/auth/confirm-email" element={<ConfirmEmailPage />} />
          {/* Checkout pages - protected since they need auth to poll usage */}
          <Route
            path="/checkout/success"
            element={
              <ProtectedRoute>
                <CheckoutSuccessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/cancel"
            element={
              <ProtectedRoute>
                <CheckoutCancelPage />
              </ProtectedRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <BillingPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/api-keys"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <APIKeysPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/usage"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UsagePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect - smart routing based on token/key status */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SmartRedirect />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
