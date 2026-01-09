import { useState } from 'react';

import {
  useDataTableFormat,
  useDataTableFormatActions,
} from '@renderer/store/DataTableFormatStore';
import { Button } from '@shadcn/components/ui/button';
import { Checkbox } from '@shadcn/components/ui/checkbox';
import { Input } from '@shadcn/components/ui/input';
import { Separator } from '@shadcn/components/ui/separator';

export function DataTableFormatSetting() {
  const format = useDataTableFormat();
  const { updateFormat } = useDataTableFormatActions();
  const [decimals, setDecimals] = useState(format.decimals);
  const [fixed, setFixed] = useState(format.fixed);

  function handleSave() {
    updateFormat(decimals, fixed);
  }

  function handleDecimalsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0 && value <= 15) {
      setDecimals(value);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">Data Table Format</h2>
        <p className="text-sm text-muted-foreground">
          Configure the default format for displaying values in data tables
        </p>
      </div>
      <Separator />
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <label htmlFor="decimals-setting" className="text-sm font-medium w-32">
            Decimals:
          </label>
          <Input
            id="decimals-setting"
            type="number"
            min="0"
            max="15"
            value={decimals}
            onChange={handleDecimalsChange}
            className="w-24"
          />
          <span className="text-sm text-muted-foreground">(0-15)</span>
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="fixed-setting" className="text-sm font-medium w-32">
            Fixed:
          </label>
          <Checkbox
            id="fixed-setting"
            checked={fixed}
            onCheckedChange={(checked) => setFixed(!!checked)}
          />
          <span className="text-sm text-muted-foreground">
            Always show the specified number of decimal places
          </span>
        </div>
        <div>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </div>
    </section>
  );
}
