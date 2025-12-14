'use client';

import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Define the type for the props we expect
interface AuthRefresherProps {
  userId: number | undefined;
}

const AuthRefresher = ({ userId }: AuthRefresherProps) => {
  useEffect(() => {
    // Only run if we have a valid user ID
    if (!userId) {
      return;
    }

    // These should be publicly available environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Supabase URL or Anon Key is not defined for real-time listener.");
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const channel = supabase
      .channel(`account-changes-for-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Accounts',
          filter: `ID=eq.${userId}`,
        },
        (payload) => {
          console.log('Detected a change in your account details. Refreshing session.', payload);
          // A change was detected in the user's own account row.
          // This could be a role change, username change, etc.
          // The safest and most robust action is to force a full page reload.
          // This will trigger all server-side session checks from scratch.
          window.location.reload();
        }
      )
      .subscribe();

    // Cleanup function to remove the channel subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]); // Re-run the effect if the userId changes

  return null; // This component does not render anything
};

export default AuthRefresher;
