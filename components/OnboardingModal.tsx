"use client";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-all"
          aria-label="Schließen"
        >
          <svg className="w-6 h-6 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-10">
          {/* Header with gradient accent */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 mb-6">
              <span className="text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-semibold">
                XV STUDIO
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Willkommen bei XV Studio!
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Bevor du Bilder und Videos erstellst, beginne damit, deine Business-URL anzugeben, damit wir ein Firmenprofil erstellen und es für die Erstellung von Marketingmaterial verwenden können.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-full font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Los geht&apos;s
          </button>
        </div>
      </div>
    </div>
  );
}
