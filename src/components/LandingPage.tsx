import { Button } from './ui/Button';

interface Props {
  onStart: () => void;
}

export function LandingPage({ onStart }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Meeting Bingo</h1>
        <p className="text-lg text-gray-600 mb-2">Turn any meeting into a game.</p>
        <p className="text-gray-500 mb-8">Auto-detects buzzwords using your microphone.</p>

        <Button size="lg" onClick={onStart} className="w-full sm:w-auto mb-4">
          🎮 New Game
        </Button>

        <p className="text-xs text-gray-400 mb-12">
          🔒 Audio processed locally. Never recorded or sent anywhere.
        </p>

        <div className="bg-white rounded-2xl p-6 shadow-sm text-left">
          <h2 className="font-semibold text-gray-700 mb-4">How it works</h2>
          <ol className="space-y-3 text-sm text-gray-600">
            <li className="flex gap-3"><span>1️⃣</span><span>Pick a buzzword category for your meeting type</span></li>
            <li className="flex gap-3"><span>2️⃣</span><span>Enable microphone for automatic word detection</span></li>
            <li className="flex gap-3"><span>3️⃣</span><span>Join your meeting and listen</span></li>
            <li className="flex gap-3"><span>4️⃣</span><span>Watch squares fill automatically — get BINGO!</span></li>
          </ol>
        </div>
      </div>
    </div>
  );
}
