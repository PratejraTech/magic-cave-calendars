import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryProvider } from './app/providers/QueryProvider';
import { SupabaseProvider } from './app/providers/SupabaseProvider';
import { RootLayout } from './app/layout/RootLayout';
import { AuthRoute } from './app/routes/AuthRoute';
import { ParentDashboardRoute } from './app/routes/ParentDashboardRoute';
import { CalendarBuilderRoute } from './app/routes/CalendarBuilderRoute';
import { ChildCalendarRoute } from './app/routes/ChildCalendarRoute';

function App() {
  return (
    <SupabaseProvider>
      <QueryProvider>
        <BrowserRouter>
          <RootLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<AuthRoute />} />
              <Route path="/parent" element={<ParentDashboardRoute />} />
              <Route path="/builder" element={<CalendarBuilderRoute />} />
              <Route path="/calendar/:shareUuid" element={<ChildCalendarRoute />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </Routes>
          </RootLayout>
        </BrowserRouter>
      </QueryProvider>
    </SupabaseProvider>
  );
}

export default App;
