"use client";

export default function BillingSection() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
      {/* Header with Coming Soon badge */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Abrechnung & Abonnement
        </h2>
        <span className="px-3 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
          Demnächst
        </span>
      </div>

      {/* Current Plan */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Aktueller Plan: Free Tier
        </h3>
        <ul className="space-y-2">
          <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Unbegrenzte Unternehmensprofile
          </li>
          <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Unbegrenzte Produkte
          </li>
          <li className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Unbegrenzte KI-Inhalte
          </li>
        </ul>
      </div>

      {/* Upgrade Button (disabled) */}
      <button
        disabled
        className="w-full py-2.5 px-4 mb-6 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg font-medium text-sm cursor-not-allowed"
      >
        Upgrade auf Pro
      </button>

      {/* Future Features */}
      <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Zukünftige Funktionen:
        </h3>
        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <li>• Monatliche Rechnungen</li>
          <li>• Nutzungsanalysen</li>
          <li>• Zahlungshistorie</li>
          <li>• Rechnungsdownloads</li>
        </ul>
      </div>
    </div>
  );
}
