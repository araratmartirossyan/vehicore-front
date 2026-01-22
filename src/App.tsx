import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { LoginPage } from './pages/Login/LoginPage'
import { SignUpPage } from './pages/SignUp/SignUpPage'
import { ForgotPasswordPage } from './pages/ForgotPassword/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/ResetPassword/ResetPasswordPage'
import { ResetPasswordRedirect } from './pages/ResetPassword/ResetPasswordRedirect'
import { ConfirmEmailPage } from './pages/ConfirmEmail/ConfirmEmailPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { SettingsPage } from './pages/Settings/SettingsPage'
import { BillingPage } from './pages/Billing/BillingPage'
import { APIKeysPage } from './pages/APIKeys/APIKeysPage'
import { UsagePage } from './pages/Usage/UsagePage'

function App() {
  return (
    <BrowserRouter>
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

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
