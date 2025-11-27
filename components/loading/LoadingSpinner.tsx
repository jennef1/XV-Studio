export default function LoadingSpinner() {
  return (
    <div className="relative w-24 h-24">
      {/* Outer rotating ring */}
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-pink-500 animate-spin"></div>

      {/* Middle rotating ring */}
      <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-pink-500 border-r-orange-500 animate-spin-slow"></div>

      {/* Inner rotating ring */}
      <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-orange-500 border-r-purple-500 animate-spin-fast"></div>

      {/* Center glow */}
      <div className="absolute inset-8 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 opacity-60 blur-sm"></div>
    </div>
  );
}
