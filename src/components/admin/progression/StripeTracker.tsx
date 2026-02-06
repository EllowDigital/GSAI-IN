import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StripeTrackerProps {
  stripeCount: number;
  onUpdate: (newCount: number) => void;
  disabled?: boolean;
  maxStripes?: number;
}

export default function StripeTracker({
  stripeCount,
  onUpdate,
  disabled = false,
  maxStripes = 4,
}: StripeTrackerProps) {
  const handleDecrement = () => {
    if (stripeCount > 0) {
      onUpdate(stripeCount - 1);
    }
  };

  const handleIncrement = () => {
    if (stripeCount < maxStripes) {
      onUpdate(stripeCount + 1);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50">
      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-full hover:bg-destructive/10 hover:text-destructive"
        onClick={handleDecrement}
        disabled={disabled || stripeCount <= 0}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>

      <div className="flex items-center gap-1 px-2">
        {Array.from({ length: maxStripes }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-4 w-1.5 rounded-sm transition-all duration-200',
              index < stripeCount
                ? 'bg-amber-500 shadow-sm shadow-amber-500/50'
                : 'bg-muted-foreground/20'
            )}
          />
        ))}
      </div>

      <span className="text-xs font-medium text-muted-foreground min-w-[3ch] text-center">
        {stripeCount}/{maxStripes}
      </span>

      <Button
        size="icon"
        variant="ghost"
        className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary"
        onClick={handleIncrement}
        disabled={disabled || stripeCount >= maxStripes}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
