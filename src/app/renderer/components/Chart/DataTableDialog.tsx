import { useState } from 'react';

import { Button } from '@shadcn/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shadcn/components/ui/table';
import { formatNumberWithDecimals } from '@shared/utils/formatNumberWithDecimals';

import { ChartSerie } from './ChartSerie';
import { DataFormatDialog } from './DataFormatDialog';

interface DataTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  series: ChartSerie[];
  initialDecimals: number;
  initialFixed: boolean;
}

export function DataTableDialog({
  open,
  onOpenChange,
  series,
  initialDecimals,
  initialFixed,
}: DataTableDialogProps) {
  const [decimals, setDecimals] = useState(initialDecimals);
  const [fixed, setFixed] = useState(initialFixed);
  const [formatDialogOpen, setFormatDialogOpen] = useState(false);

  const maxRows = Math.max(...series.map((s) => s.data.length), 0);

  function handleFormatChange(newDecimals: number, newFixed: boolean) {
    setDecimals(newDecimals);
    setFixed(newFixed);
  }

  function formatValue(value: number | undefined): string {
    if (value === undefined) {
      return '';
    }
    return formatNumberWithDecimals(value, decimals, fixed);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Data Table</DialogTitle>
          </DialogHeader>
          <div className="flex justify-end mb-2">
            <Button variant="outline" size="sm" onClick={() => setFormatDialogOpen(true)}>
              Data Format
            </Button>
          </div>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky top-0 bg-background">#</TableHead>
                  {series.map((serie, index) => (
                    <TableHead
                      key={index}
                      colSpan={2}
                      className="sticky top-0 bg-background text-center"
                    >
                      {serie.name}
                    </TableHead>
                  ))}
                </TableRow>
                <TableRow>
                  <TableHead className="sticky top-0 bg-background"></TableHead>
                  {series.map((_, index) => (
                    <>
                      <TableHead key={`${index}-x`} className="sticky top-0 bg-background">
                        X
                      </TableHead>
                      <TableHead key={`${index}-y`} className="sticky top-0 bg-background">
                        Y
                      </TableHead>
                    </>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: maxRows }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="font-medium">{rowIndex}</TableCell>
                    {series.map((serie, serieIndex) => {
                      const dataPoint = serie.data[rowIndex];
                      return (
                        <>
                          <TableCell key={`${serieIndex}-x`}>
                            {dataPoint ? formatValue(dataPoint[0]) : ''}
                          </TableCell>
                          <TableCell key={`${serieIndex}-y`}>
                            {dataPoint ? formatValue(dataPoint[1]) : ''}
                          </TableCell>
                        </>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <DataFormatDialog
        open={formatDialogOpen}
        onOpenChange={setFormatDialogOpen}
        currentDecimals={decimals}
        currentFixed={fixed}
        onFormatChange={handleFormatChange}
      />
    </>
  );
}
