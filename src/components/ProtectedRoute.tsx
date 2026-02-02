import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    // Re-validate session directly with Supabase on every protected route access
    // This prevents stale client state from allowing access
    const validateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error || !session) {
          // No valid session - force logout and clear everything
          console.log('Session validation failed - no valid session');
          await signOut();
          setIsValid(false);
        } else {
          // Double-check by verifying the user exists
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            console.log('User validation failed');
            await signOut();
            setIsValid(false);
          } else {
            setIsValid(true);
          }
        }
      } catch (err) {
        console.error('Session validation error:', err);
        await signOut();
        setIsValid(false);
      } finally {
        setIsValidating(false);
      }
    };

    // Only validate once initial auth loading is complete
    if (!loading) {
      validateSession();
    }
  }, [loading, signOut, location.pathname]);

  // Show loading while checking auth state or validating session
  if (loading || isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if no valid session
  if (!user || !isValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
