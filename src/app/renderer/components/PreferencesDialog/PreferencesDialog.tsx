'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shadcn/components/ui/dialog';
import { Button } from '@shadcn/components/ui/button';
import { Input } from '@shadcn/components/ui/input';
import { Label } from '@shadcn/components/ui/label';
import { Checkbox } from '@shadcn/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shadcn/components/ui/select';

interface PreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plotsPerRow: number;
  setPlotsPerRow: (value: number) => void;
  showLegend: boolean;
  setShowLegend: (value: boolean) => void;
  showGridMinor: boolean;
  setShowGridMinor: (value: boolean) => void;
}

const defaultSeriesSettings = [
  { color: '#3b82f6', lineStyle: 'solid' },
  { color: '#ef4444', lineStyle: 'solid' },
  { color: '#10b981', lineStyle: 'solid' },
  { color: '#f59e0b', lineStyle: 'solid' },
  { color: '#8b5cf6', lineStyle: 'solid' },
  { color: '#06b6d4', lineStyle: 'solid' },
  { color: '#f97316', lineStyle: 'solid' },
  { color: '#84cc16', lineStyle: 'solid' },
  { color: '#ec4899', lineStyle: 'solid' },
  { color: '#6b7280', lineStyle: 'solid' },
];

export function PreferencesDialog({
  open,
  onOpenChange,
  plotsPerRow,
  setPlotsPerRow,
  showLegend,
  setShowLegend,
  showGridMinor,
  setShowGridMinor,
}: PreferencesDialogProps) {
  const [seriesSettings, setSeriesSettings] = useState(defaultSeriesSettings);
  const [tempPlotsPerRow, setTempPlotsPerRow] = useState(plotsPerRow.toString());

  const handleSave = () => {
    const newPlotsPerRow = Number.parseInt(tempPlotsPerRow);
    if (newPlotsPerRow > 0 && newPlotsPerRow <= 10) {
      setPlotsPerRow(newPlotsPerRow);
    }
    onOpenChange(false);
  };

  const handleReset = () => {
    setSeriesSettings(defaultSeriesSettings);
    setTempPlotsPerRow('2');
    setShowLegend(true);
    setShowGridMinor(false);
  };

  const updateSeriesColor = (index: number, color: string) => {
    const newSettings = [...seriesSettings];
    newSettings[index] = { ...newSettings[index], color };
    setSeriesSettings(newSettings);
  };

  const updateSeriesLineStyle = (index: number, lineStyle: string) => {
    const newSettings = [...seriesSettings];
    newSettings[index] = { ...newSettings[index], lineStyle };
    setSeriesSettings(newSettings);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Default Plot Settings</DialogTitle>
          <DialogDescription>Configure default settings for new plots and series</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium">Default Series Settings</Label>
            <div className="mt-2 space-y-2">
              {seriesSettings.map((series, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm w-16">Series {index + 1}:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={series.color}
                      onChange={(e) => updateSeriesColor(index, e.target.value)}
                      className="w-8 h-8 rounded border border-border"
                    />
                    <Select
                      value={series.lineStyle}
                      onValueChange={(value) => updateSeriesLineStyle(index, value)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="legend"
                checked={showLegend}
                onCheckedChange={(checked) => setShowLegend(checked as boolean)}
              />
              <Label htmlFor="legend">Show Legend by default</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="gridMinor"
                checked={showGridMinor}
                onCheckedChange={(checked) => setShowGridMinor(checked as boolean)}
              />
              <Label htmlFor="gridMinor">Show Grid Minor by default</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="plotsPerRow" className="text-sm">
                Plots per row:
              </Label>
              <Input
                id="plotsPerRow"
                type="number"
                min="1"
                max="10"
                value={tempPlotsPerRow}
                onChange={(e) => setTempPlotsPerRow(e.target.value)}
                className="w-20"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={handleReset}>
              Reset to Default
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
