import { Button } from './ui/Button';

interface Props {
  isListening: boolean;
  isSupported: boolean;
  onToggleListening: () => void;
  onNewCard: () => void;
  onChangeCategory: () => void;
}

export function GameControls({ isListening, isSupported, onToggleListening, onNewCard, onChangeCategory }: Props) {
  return (
    <div className="flex gap-3 justify-center mt-4">
      <Button variant="secondary" size="sm" onClick={onChangeCategory}>
        ← Categories
      </Button>
      <Button variant="secondary" size="sm" onClick={onNewCard}>
        🔄 New Card
      </Button>
      {isSupported ? (
        <Button
          variant={isListening ? 'ghost' : 'primary'}
          size="sm"
          onClick={onToggleListening}
        >
          {isListening ? '⏹ Stop Listening' : '🎤 Start Listening'}
        </Button>
      ) : (
        <span className="text-xs text-gray-400 self-center">Manual mode (speech unavailable)</span>
      )}
    </div>
  );
}
