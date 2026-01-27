import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SmartRedirect } from './components/SmartRedirect'
import { LoginPage } from './pages/Login/LoginPage'
import { SignUpPage } from './pages/SignUp/SignUpPage'
import { ForgotPasswordPage } from './pages/ForgotPassword/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPassword/ResetPasswordPage'
import { ResetPasswordRedirect } from './pages/ResetPassword/ResetPasswordRedirect'
import { ConfirmEmailPage } from './pages/ConfirmEmail/ConfirmEmailPage'
import { CheckoutSuccessPage } from './pages/Checkout/CheckoutSuccessPage'
import { CheckoutCancelPage } from './pages/Checkout/CheckoutCancelPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { SettingsPage } from './pages/Settings/SettingsPage'
import { BillingPage } from './pages/Billing/BillingPage'
import { APIKeysPage } from './pages/APIKeys/APIKeysPage'
import { UsagePage } from './pages/Usage/UsagePage'

function App() {
  return (
    <BrowserRouter
      future={{
        v7_relativeSplatPath: true,
        v7_startTransition: true,
      }}
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
    </BrowserRouter>
  )
}

export default App
