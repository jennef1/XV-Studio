"use client";

interface LandingHeaderProps {
  onOpenLogin: () => void;
}

export default function LandingHeader({ onOpenLogin }: LandingHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo Text Only */}
          <div className="flex items-center">
            <span className="text-xl font-bold text-gray-900">
              XV STUDIO
            </span>
          </div>

          {/* Login Button with Gradient Border */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-sm opacity-75"></div>
            <button
              onClick={onOpenLogin}
              className="relative px-6 py-2 text-sm font-semibold text-gray-900 hover:text-white transition-all duration-200 bg-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 rounded-full"
              style={{
                border: '2px solid transparent',
                backgroundImage: 'linear-gradient(white, white), linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153))',
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
              }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

