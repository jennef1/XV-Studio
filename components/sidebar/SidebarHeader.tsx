"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabaseBrowserClient } from "@/lib/supabaseClient";

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
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <div className="relative w-24 h-8">
          <Image
            src="/images/XV Logo.png"
            alt="XV Studio Logo"
            fill
            className="object-contain object-left"
            priority
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
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

