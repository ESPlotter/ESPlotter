import { useState } from 'react';

import { Button } from '@shadcn/components/ui/button';
import { Checkbox } from '@shadcn/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shadcn/components/ui/dialog';
import { Input } from '@shadcn/components/ui/input';

interface DataFormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDecimals: number;
  currentFixed: boolean;
  onFormatChange: (decimals: number, fixed: boolean) => void;
}

export function DataFormatDialog({
  open,
  onOpenChange,
  currentDecimals,
  currentFixed,
  onFormatChange,
}: DataFormatDialogProps) {
  const [decimals, setDecimals] = useState(currentDecimals);
  const [fixed, setFixed] = useState(currentFixed);

  function handleApply() {
    onFormatChange(decimals, fixed);
    onOpenChange(false);
  }

  function handleDecimalsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 15) {
      setDecimals(value);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Data Format</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center gap-4">
            <label htmlFor="decimals" className="text-sm font-medium w-24">
              Decimals:
            </label>
            <Input
              id="decimals"
              type="number"
              min="0"
              max="15"
              value={decimals}
              onChange={handleDecimalsChange}
              className="w-24"
            />
          </div>
          <div className="flex items-center gap-4">
            <label htmlFor="fixed" className="text-sm font-medium w-24">
              Fixed:
            </label>
            <Checkbox
              id="fixed"
              checked={fixed}
              onCheckedChange={(checked) => setFixed(!!checked)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
