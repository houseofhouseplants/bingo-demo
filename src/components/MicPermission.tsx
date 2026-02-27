import { Button } from './ui/Button';

interface Props {
  onAllow: () => void;
  onDeny: () => void;
}

export function MicPermission({ onAllow, onDeny }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <div className="text-3xl mb-3">🎤</div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Enable microphone?</h2>
        <p className="text-sm text-gray-600 mb-4">
          Meeting Bingo listens for buzzwords in real time. Audio is processed
          locally on your device — it's <strong>never recorded or sent anywhere</strong>.
        </p>
        <p className="text-xs text-gray-400 mb-5">
          🔒 You can also tap squares manually if you prefer not to use the mic.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" size="md" onClick={onDeny} className="flex-1">
            No thanks
          </Button>
          <Button size="md" onClick={onAllow} className="flex-1">
            Allow
          </Button>
        </div>
      </div>
    </div>
  );
}
