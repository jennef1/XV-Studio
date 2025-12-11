"use client";

interface AccountSettingsProps {
  email: string;
  name: string;
  onEditClick: () => void;
}

export default function AccountSettings({ email, name, onEditClick }: AccountSettingsProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
        Kontoeinstellungen
      </h2>

      {/* Personal Information */}
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Persönliche Informationen
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              E-Mail
            </label>
            <div className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
              {email}
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Name
            </label>
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
              <span className="text-sm text-gray-900 dark:text-gray-100">{name}</span>
              <button
                onClick={onEditClick}
                className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
              >
                Bearbeiten
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Sicherheit
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 dark:text-gray-100">Passwort ändern</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Demnächst verfügbar</p>
            </div>
            <button
              disabled
              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-md cursor-not-allowed"
            >
              Ändern
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 dark:text-gray-100">Zwei-Faktor-Authentifizierung</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Demnächst verfügbar</p>
            </div>
            <button
              disabled
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 dark:text-gray-100">Aktive Sitzungen</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Demnächst verfügbar</p>
            </div>
            <button
              disabled
              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-md cursor-not-allowed"
            >
              Anzeigen
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Einstellungen
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 dark:text-gray-100">Sprache</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Deutsch</p>
            </div>
            <button
              disabled
              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-md cursor-not-allowed"
            >
              Ändern
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-900 dark:text-gray-100">Benachrichtigungen</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Demnächst verfügbar</p>
            </div>
            <button
              disabled
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div>
        <h3 className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">
          Gefahrenzone
        </h3>
        <div className="border border-red-200 dark:border-red-900 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                Konto löschen
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Diese Aktion kann nicht rückgängig gemacht werden. Bitte kontaktieren Sie den Support.
              </p>
            </div>
            <button
              disabled
              className="ml-4 px-3 py-1.5 text-xs bg-red-100 dark:bg-red-900/30 text-red-400 dark:text-red-500 rounded-md cursor-not-allowed"
            >
              Löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
