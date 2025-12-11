/**
 * Profile service functions for managing user profile data
 */

interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

interface UploadAvatarResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Update user profile (name and avatar URL)
 */
export async function updateProfile(
  name: string,
  avatarUrl?: string | null
): Promise<UpdateProfileResult> {
  try {
    const response = await fetch("/api/user/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: name,
        avatar_url: avatarUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Fehler beim Aktualisieren des Profils",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      error: "Netzwerkfehler. Bitte versuchen Sie es erneut.",
    };
  }
}

/**
 * Upload avatar image
 */
export async function uploadAvatar(file: File): Promise<UploadAvatarResult> {
  try {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return {
        success: false,
        error: "Bitte laden Sie nur JPG, PNG oder WEBP Dateien hoch",
      };
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: "Die Datei darf maximal 5MB groß sein",
      };
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/user/avatar", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Fehler beim Hochladen des Avatars",
      };
    }

    return {
      success: true,
      url: data.url,
    };
  } catch (error) {
    console.error("Avatar upload error:", error);
    return {
      success: false,
      error: "Netzwerkfehler. Bitte versuchen Sie es erneut.",
    };
  }
}

/**
 * Delete avatar from storage (used when updating avatar)
 */
export async function deleteAvatar(userId: string, avatarPath: string): Promise<boolean> {
  try {
    // This would be implemented when we have the delete endpoint
    // For now, we'll just overwrite avatars on upload
    console.log("Delete avatar:", userId, avatarPath);
    return true;
  } catch (error) {
    console.error("Avatar deletion error:", error);
    return false;
  }
}
