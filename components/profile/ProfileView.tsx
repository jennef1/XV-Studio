"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabaseBrowserClient } from "@/lib/supabaseClient";
import { signOut } from "@/lib/auth";
import { updateProfile } from "@/lib/profile/profileService";
import ThemeToggle from "./ThemeToggle";
import ProfileEditForm from "./ProfileEditForm";
import AccountSettings from "./AccountSettings";
import BillingSection from "./BillingSection";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

export default function ProfileView() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetchUser();

    // Subscribe to auth changes
    const { data: { subscription } } = supabaseBrowserClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      } else if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatarUrl: session.user.user_metadata?.avatar_url || null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabaseBrowserClient.auth.getUser();

      if (authError || !data?.user) {
        router.push('/');
        return;
      }

      setUser({
        id: data.user.id,
        name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
        email: data.user.email || '',
        avatarUrl: data.user.user_metadata?.avatar_url || null,
      });
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Fehler beim Laden des Benutzerprofils');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleSave = async (name: string, avatarUrl: string | null) => {
    setError(null);

    const result = await updateProfile(name, avatarUrl);

    if (result.success) {
      // Refresh user data
      await fetchUser();
      setIsEditing(false);
    } else {
      setError(result.error || 'Fehler beim Speichern des Profils');
      throw new Error(result.error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setError(null);

    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Logout error:', err);
      setError('Fehler beim Abmelden');
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-950 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-8" />
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
              <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
              <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-950 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Zurück
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Profil
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Profile Header Card */}
        {!isEditing && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-medium overflow-hidden">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name?.[0]?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  {user.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-3">{user.email}</p>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Profil bearbeiten
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <div className="mb-6">
            <ProfileEditForm
              initialName={user.name}
              initialAvatarUrl={user.avatarUrl}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Theme Toggle Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Design
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Wähle dein bevorzugtes Farbschema
          </p>
          <ThemeToggle />
        </div>

        {/* Account Settings */}
        <div className="mb-6">
          <AccountSettings
            email={user.email}
            name={user.name}
            onEditClick={handleEdit}
          />
        </div>

        {/* Billing Section */}
        <div className="mb-6">
          <BillingSection />
        </div>

        {/* Logout Button */}
        <div className="flex justify-center pt-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isLoggingOut ? 'Wird abgemeldet...' : 'Abmelden'}
          </button>
        </div>
      </div>
    </div>
  );
}
