'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shadcn/components/ui/dialog';
import { Button } from '@shadcn/components/ui/button';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-primary-foreground font-bold">
              U
            </div>
            Uniplot
          </DialogTitle>
          <DialogDescription>Professional XY Scatter Plot Visualization Tool</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Version</h4>
            <p className="text-sm text-muted-foreground">1.0.0</p>
          </div>

          <div>
            <h4 className="font-medium">Description</h4>
            <p className="text-sm text-muted-foreground">
              Uniplot is a professional tool for visualizing XY scatter plots from simulation
              results. Import JSON or .out files containing time-series data and create interactive,
              multi-panel visualizations with customizable styling and layout options.
            </p>
          </div>

          <div>
            <h4 className="font-medium">Features</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Multi-channel data visualization</li>
              <li>• Resizable panels and layouts</li>
              <li>• Multiple plot configurations</li>
              <li>• Customizable series styling</li>
              <li>• Export capabilities</li>
            </ul>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
