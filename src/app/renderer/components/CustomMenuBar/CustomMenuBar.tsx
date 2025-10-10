'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@shadcn/components/ui/dropdown-menu';
import { Button } from '@shadcn/components/ui/button';
import { AboutDialog } from '@components/AboutDialog/AboutDialog';
import { PreferencesDialog } from '../PreferencesDialog/PreferencesDialog';

interface MenuBarProps {
  lockYAxis: boolean;
  setLockYAxis: (value: boolean) => void;
  plotsPerRow: number;
  setPlotsPerRow: (value: number) => void;
  showLegend: boolean;
  setShowLegend: (value: boolean) => void;
  showGridMinor: boolean;
  setShowGridMinor: (value: boolean) => void;
  onAddPage?: () => void;
  onAddPlot?: () => void;
  onFileOpen?: (file: File) => void;
}

export function CustomMenuBar({
  lockYAxis,
  setLockYAxis,
  plotsPerRow,
  setPlotsPerRow,
  showLegend,
  setShowLegend,
  showGridMinor,
  setShowGridMinor,
  onAddPage,
  onAddPlot,
  onFileOpen,
}: MenuBarProps) {
  const [showPreferences, setShowPreferences] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const handleFileOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.out';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        Array.from(files).forEach((file) => {
          if (onFileOpen) {
            onFileOpen(file);
          }
        });
      }
    };
    input.click();
  };

  const handleFileExport = () => {
    const data = {
      timestamp: new Date().toISOString(),
      plots: [],
      settings: {
        lockYAxis,
        plotsPerRow,
        showLegend,
        showGridMinor,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uniplot-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="h-full flex items-center px-2 gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-accent">
              File
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={handleFileOpen}>Open</DropdownMenuItem>
            <DropdownMenuItem onClick={handleFileExport}>Export</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-accent">
              Plot
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={onAddPage}>Add Page</DropdownMenuItem>
            <DropdownMenuItem onClick={onAddPlot}>Add Plot</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={lockYAxis} onCheckedChange={setLockYAxis}>
              Lock Y-Axis
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-accent">
              Preferences
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowPreferences(true)}>
              Default Plot Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs hover:bg-accent">
              Help
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setShowAbout(true)}>About Uniplot</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <PreferencesDialog
        open={showPreferences}
        onOpenChange={setShowPreferences}
        plotsPerRow={plotsPerRow}
        setPlotsPerRow={setPlotsPerRow}
        showLegend={showLegend}
        setShowLegend={setShowLegend}
        showGridMinor={showGridMinor}
        setShowGridMinor={setShowGridMinor}
      />

      <AboutDialog open={showAbout} onOpenChange={setShowAbout} />
    </>
  );
}
