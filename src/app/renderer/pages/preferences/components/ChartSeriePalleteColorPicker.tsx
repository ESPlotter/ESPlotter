'use client';

import Color, { ColorLike } from 'color';

import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from '@shadcn/components/ui/color-picker';

export function ChartSeriePalleteColorPicker({
  defaultColor,
  onChange,
}: {
  defaultColor: string;
  onChange: (newColor: string) => void;
}) {
  return (
    <ColorPicker
      className="max-w-sm rounded-md border bg-background p-4 shadow-sm"
      defaultValue={defaultColor}
      onChange={(value: ColorLike) => {
        onChange(Color(value).hex());
      }}
    >
      <ColorPickerSelection />
      <div className="flex items-center gap-4">
        <ColorPickerEyeDropper />
        <div className="grid w-full gap-1">
          <ColorPickerHue />
          <ColorPickerAlpha />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ColorPickerOutput />
        <ColorPickerFormat />
      </div>
    </ColorPicker>
  );
}
