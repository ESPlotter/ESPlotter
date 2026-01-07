import { Trash2Icon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

import { ChartSeriePalleteColorPicker } from './ChartSeriePalleteColorPicker';

export function ChartSeriePaletteColorItemSetting({
  defaultColor,
  index,
  onChange,
  onRemove,
}: {
  defaultColor: string;
  index: number;
  onChange: (color: string) => void;
  onRemove: (index: number) => void;
}) {
  const [color, setColor] = useState(defaultColor);
  const [isEditing, setIsEditing] = useState(false);
  const hasMountedRef = useRef(false);
  // Keep internal color in sync when prop changes (e.g. after loading prefs)
  useEffect(() => {
    setColor(defaultColor);
  }, [defaultColor]);

  // Only run onChange when editing finishes, but skip the very first mount
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    if (!isEditing) {
      onChange(color);
    }
  }, [isEditing]);

  return (
    <>
      <div className={`group rounded-md p-3 transition`}>
        <div className="flex items-center gap-3">
          <div className="w-8 rounded text-center text-xs font-semibold text-muted-foreground">
            {index + 1}
          </div>
          <button
            type="button"
            aria-label={`Edit colour ${index + 1}`}
            onClick={() => setIsEditing((prev) => !prev)}
            className="flex h-12 flex-1 items-center justify-start gap-3 rounded-md px-3 transition focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ backgroundColor: color }}
          >
            <span className="rounded bg-background/70 px-2 py-1 text-xs font-medium text-foreground shadow">
              {color}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="rounded p-2 hover:bg-muted"
            aria-label="Remove colour"
          >
            <Trash2Icon className="size-4" />
          </button>
        </div>
      </div>

      {isEditing && <ChartSeriePalleteColorPicker defaultColor={color} onChange={setColor} />}
    </>
  );
}
