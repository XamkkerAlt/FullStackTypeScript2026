import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch } from './store/hooks';
import { initializeAuth } from './features/auth/authSlice';
import { AppRouter } from './routes/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);
  return <>{children}</>;
}
export default function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary fallback={<div>Something went wrong.</div>}>
        <AuthInitializer>
          <AppRouter />
        </AuthInitializer>
      </ErrorBoundary>
    </Provider>
  );
}