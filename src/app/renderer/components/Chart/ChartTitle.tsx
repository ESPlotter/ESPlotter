import { useEffect, useRef, useState } from 'react';

import { Input } from '@renderer/shadcn/components/ui/input';
import { useChannelChartsActions } from '@renderer/store/ChannelChartsStore';

interface ChartTitleProps {
  chartId: string;
  name: string;
}

export function ChartTitle({ chartId, name }: ChartTitleProps) {
  const { changeNameOfChart } = useChannelChartsActions();
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(name);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isEditing) {
      setValue(name);
    }
  }, [isEditing, name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const frame = requestAnimationFrame(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      });
      return () => cancelAnimationFrame(frame);
    }
    return undefined;
  }, [isEditing]);

  function finishEditing() {
    const trimmed = value.trim();
    const nextName = trimmed.length > 0 ? trimmed : name;
    if (nextName !== name) {
      changeNameOfChart(chartId, nextName);
    }
    setValue(nextName);
    setIsEditing(false);
  }

  function cancelEditing() {
    setValue(name);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={finishEditing}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            finishEditing();
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            cancelEditing();
          }
        }}
        aria-label="Chart name"
        className="text-2xl font-bold"
      />
    );
  }

  return (
    <button
      type="button"
      className="text-2xl font-bold cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      onClick={() => setIsEditing(true)}
    >
      {name}
    </button>
  );
}
