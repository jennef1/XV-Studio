"use client";

import { useEffect, useState } from "react";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import Image from "next/image";

interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string | null;
}

export default function SidebarHeader() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabaseBrowserClient.auth.getUser();

      if (data?.user) {
        setUser({
          name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email || '',
          avatarUrl: data.user.user_metadata?.avatar_url || null,
        });
      }
    };

    fetchUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabaseBrowserClient.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatarUrl: session.user.user_metadata?.avatar_url || null,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="flex flex-col p-4">
      {/* Brand name */}
      <div className="h-8 flex items-center mb-8">
        <h1 className="text-2xl font-bold tracking-wider text-gray-900 dark:text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.1em' }}>
          XV STUDIO
        </h1>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium overflow-hidden">
          {user?.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user?.name || 'Loading...'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {user?.email || ''}
          </span>
        </div>
      </div>
      <div className="w-32 h-px bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
}

