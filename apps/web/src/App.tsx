import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './app/providers/QueryProvider';
import { SupabaseProvider } from './app/providers/SupabaseProvider';
import { ThemeProvider } from './themes/ThemeProvider';
import { RootLayout } from './app/layout/RootLayout';
import { AuthGuard } from './app/components/AuthGuard';
import { AuthRoute } from './app/routes/AuthRoute';
import { ParentDashboardRoute } from './app/routes/ParentDashboardRoute';
import { CalendarBuilderRoute } from './app/routes/CalendarBuilderRoute';
import { ProductViewRoute } from './app/routes/ProductViewRoute';
import { CalendarRedirect } from './app/routes/CalendarRedirect';

function App() {
  return (
    <SupabaseProvider>
      <QueryProvider>
        <ThemeProvider>
          <BrowserRouter>
            <RootLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/auth" replace />} />
                <Route
                  path="/auth"
                  element={
                    <AuthGuard requireAuth={false}>
                      <AuthRoute />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/parent-portal"
                  element={
                    <AuthGuard requireAuth={true}>
                      <ParentDashboardRoute />
                    </AuthGuard>
                  }
                />
                <Route
                  path="/builder"
                  element={
                    <AuthGuard requireAuth={true}>
                      <CalendarBuilderRoute />
                    </AuthGuard>
                  }
                />
                {/* New generalized product route */}
                <Route path="/product/:shareUuid" element={<ProductViewRoute />} />
                {/* Backward compatibility: redirect calendar URLs to product URLs */}
                <Route path="/calendar/:shareUuid" element={<CalendarRedirect />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </Routes>
            </RootLayout>
          </BrowserRouter>
        </ThemeProvider>
      </QueryProvider>
    </SupabaseProvider>
  );
}

export default App;
