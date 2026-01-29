import { ClockIcon, XIcon } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { type ChartSerie } from '@renderer/components/Chart/ChartSerie';
import { useOpenedChannelFiles } from '@renderer/hooks/useOpenedChannelFiles';
import {
  useSelectedChartId,
  useCharts,
  useChannelChartsActions,
} from '@renderer/store/ChannelChartsStore';
import { type OpenedChannelFile, useChannelFilesActions } from '@renderer/store/ChannelFilesStore';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@shadcn/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shadcn/components/ui/dropdown-menu';
import { Input } from '@shadcn/components/ui/input';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@shadcn/components/ui/sidebar';
import { type ChannelFileContentSerieDescriptorPrimitive } from '@shared/domain/primitives/ChannelFileContentSerieDescriptorPrimitive';

import { mapToChartSerie } from '../Chart/mapToChartSerie';

interface SelectedChannelsMap {
  [channelKey: string]: ChartSerie;
}

interface ChannelMenuItemBase {
  fileName: string;
  filePath: string;
  status: 'loading' | 'ready';
}

interface ChannelMenuItemLoading extends ChannelMenuItemBase {
  status: 'loading';
}

interface ChannelMenuItemReady extends ChannelMenuItemBase {
  status: 'ready';
  channels: ChannelFileContentSerieDescriptorPrimitive[];
  timeOffset: number;
}

type ChannelMenuItem = ChannelMenuItemLoading | ChannelMenuItemReady;

interface ChannelFileAccordionProps {
  item: ChannelMenuItem;
  selectedChannels: SelectedChannelsMap;
  onChannelClick: (
    menuItem: ChannelMenuItemReady,
    channel: ChannelFileContentSerieDescriptorPrimitive,
  ) => void;
  onCloseFile: (filePath: string) => void;
  onTimeOffsetChange: (filePath: string, timeOffset: number) => void;
}

export function AppSidebar() {
  const openedChannelFiles = useOpenedChannelFiles();
  const selectedChartId = useSelectedChartId();
  const charts = useCharts();
  const { addChannelToChart, removeChannelFromChart, removeChannelsFromAllCharts } =
    useChannelChartsActions();
  const { removeFile, setFileTimeOffset } = useChannelFilesActions();

  const allItems = useMemo(() => {
    return openedChannelFiles.map(mapToMenuItems);
  }, [openedChannelFiles]);

  const selectedChart = selectedChartId ? charts[selectedChartId] : undefined;
  const selectedChannels: SelectedChannelsMap = selectedChart?.channels ?? {};

  async function handleChannelClick(
    menuItem: ChannelMenuItemReady,
    channel: ChannelFileContentSerieDescriptorPrimitive,
  ) {
    if (!selectedChartId || !selectedChart) {
      return;
    }

    const channelKey = buildChannelKey(menuItem.filePath, channel.id);
    const isChannelSelected = Boolean(selectedChart.channels[channelKey]);

    if (isChannelSelected) {
      removeChannelFromChart(selectedChartId, channelKey);
      return;
    }

    try {
      const seriesPayload = await window.files.getChannelFileSeries(menuItem.filePath, channel.id);
      const serie = mapToChartSerie(
        seriesPayload.channel,
        seriesPayload.x.values,
        menuItem.timeOffset,
      );

      if (!serie) {
        return;
      }

      addChannelToChart(selectedChartId, channelKey, serie);
    } catch {
      return;
    }
  }

  function handleCloseFile(filePath: string) {
    removeChannelsFromAllCharts(filePath);
    void window.files.closeChannelFile(filePath);
    removeFile(filePath);
  }

  async function handleTimeOffsetChange(filePath: string, newTimeOffset: number) {
    // Update the store
    setFileTimeOffset(filePath, newTimeOffset);

    // Re-add all channels from this file that are currently in ANY chart
    const prefix = `${filePath}::`;

    // Iterate through all charts
    for (const [chartId, chart] of Object.entries(charts)) {
      const channelsToUpdate = Object.keys(chart.channels).filter((channelKey) =>
        channelKey.startsWith(prefix),
      );

      for (const channelKey of channelsToUpdate) {
        const channelId = channelKey.replace(prefix, '');
        try {
          const seriesPayload = await window.files.getChannelFileSeries(filePath, channelId);
          const serie = mapToChartSerie(
            seriesPayload.channel,
            seriesPayload.x.values,
            newTimeOffset,
          );

          if (serie) {
            addChannelToChart(chartId, channelKey, serie);
          }
        } catch {
          // Ignore errors when re-adding channels
        }
      }
    }
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CHANNELS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allItems.map((item) => (
                <ChannelFileAccordion
                  key={item.filePath}
                  item={item}
                  selectedChannels={selectedChannels}
                  onChannelClick={handleChannelClick}
                  onCloseFile={handleCloseFile}
                  onTimeOffsetChange={handleTimeOffsetChange}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function ChannelFileAccordion({
  item,
  selectedChannels,
  onChannelClick,
  onCloseFile,
  onTimeOffsetChange,
}: ChannelFileAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeOffset = item.status === 'ready' ? item.timeOffset : 0;
  const [timeOffsetInput, setTimeOffsetInput] = useState(String(timeOffset));
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const timeDelayInputId = `time-delay-${item.filePath.replace(/[^a-z0-9]/gi, '-')}`;
  const isAnyMenuOpen = isOptionsMenuOpen || isContextMenuOpen;

  // Sync input with current timeOffset when menu opens
  useEffect(() => {
    if (isAnyMenuOpen) {
      setTimeOffsetInput(String(timeOffset));
      // Focus the input after a delay to ensure the menu is fully rendered
      const timer = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [isAnyMenuOpen, timeOffset]);

  function handleValueChange(value: string) {
    setIsOpen(value === item.filePath);
  }

  function handleTimeOffsetInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTimeOffsetInput(e.target.value);
  }

  function handleTimeOffsetApply() {
    const value = parseFloat(timeOffsetInput);
    // Validate the input
    if (isNaN(value) || !isFinite(value)) {
      // Reset to current offset if invalid
      setTimeOffsetInput(String(timeOffset));
      return;
    }
    // Only apply if value has changed
    if (value !== timeOffset) {
      onTimeOffsetChange(item.filePath, value);
    }
    setIsOptionsMenuOpen(false);
    setIsContextMenuOpen(false);
    setContextMenuPosition(null);
  }

  function handleTimeOffsetKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleTimeOffsetApply();
    }
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setIsOptionsMenuOpen(false);
    setIsContextMenuOpen(true);
  }

  function renderContent() {
    if (item.status !== 'ready') {
      if (!isOpen) {
        return null;
      }

      return <div className="px-2 py-2 text-xs text-muted-foreground">Loading channels...</div>;
    }

    if (!isOpen) {
      return null;
    }

    return item.channels.map((channel) => {
      const channelKey = buildChannelKey(item.filePath, channel.id);
      const isChannelSelected = Boolean(selectedChannels[channelKey]);

      return (
        <SidebarMenuItem key={channelKey}>
          <SidebarMenuButton
            isActive={isChannelSelected}
            className="data-[active=true]:bg-neutral-600 data-[active=true]:text-white data-[active=true]:hover:bg-neutral-800 data-[active=true]:hover:text-white data-[active=false]:hover:bg-neutral-200 my-1"
            onClick={() => void onChannelClick(item, channel)}
          >
            <span>
              {channel.label} ({channel.unit})
            </span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
    });
  }

  return (
    <Accordion type="single" collapsible onValueChange={handleValueChange}>
      <AccordionItem value={item.filePath}>
        <div className="flex w-full min-w-0 items-center gap-2">
          <AccordionTrigger
            className="min-w-0 flex-1 text-sm font-medium"
            onContextMenu={handleContextMenu}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
              <span className="min-w-0 flex-1 basis-0 truncate">{item.fileName}</span>
              {item.status === 'loading' ? (
                <span className="shrink-0 size-3 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
              ) : null}
              {item.status === 'ready' && timeOffset !== 0 ? (
                <span className="shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                  <ClockIcon className="size-3" />
                  <span>
                    {timeOffset > 0 ? '+' : ''}
                    {timeOffset} s
                  </span>
                </span>
              ) : null}
            </span>
          </AccordionTrigger>
          <DropdownMenu
            open={isOptionsMenuOpen}
            onOpenChange={(open) => {
              setIsOptionsMenuOpen(open);
              if (open) {
                setIsContextMenuOpen(false);
                setContextMenuPosition(null);
              }
            }}
          >
            <DropdownMenuTrigger asChild>
              <button
                className="rounded p-1 hover:bg-muted"
                aria-label="File options"
                title="Options"
                type="button"
                data-testid="channel-file-options-button"
                onClick={() => {
                  setIsOptionsMenuOpen(true);
                  setIsContextMenuOpen(false);
                  setContextMenuPosition(null);
                }}
              >
                <svg
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                  />
                </svg>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-80"
              sideOffset={6}
              aria-label="Channel file menu"
              aria-labelledby={undefined}
            >
              <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                File settings
              </DropdownMenuLabel>
              {item.status === 'ready' ? (
                <DropdownMenuItem
                  className="focus:bg-transparent"
                  onSelect={(event) => event.preventDefault()}
                >
                  <div className="flex w-full items-center gap-2">
                    <ClockIcon className="size-4 text-muted-foreground" />
                    <div className="flex w-full items-center gap-2">
                      <label className="text-xs text-muted-foreground" htmlFor={timeDelayInputId}>
                        Time delay (s)
                      </label>
                      <Input
                        ref={inputRef}
                        id={timeDelayInputId}
                        type="number"
                        step="any"
                        aria-label="Time delay"
                        data-testid="channel-file-menu-time-offset-input"
                        value={timeOffsetInput}
                        onChange={handleTimeOffsetInputChange}
                        onKeyDown={handleTimeOffsetKeyDown}
                        className="h-7 w-24 text-xs"
                        placeholder="0.0"
                      />
                      <button
                        onClick={handleTimeOffsetApply}
                        className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
                        type="button"
                      >
                        Apply
                      </button>
                      <button
                        onClick={() => {
                          setTimeOffsetInput('0');
                          onTimeOffsetChange(item.filePath, 0);
                          setIsOptionsMenuOpen(false);
                        }}
                        className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                        type="button"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => {
                  onCloseFile(item.filePath);
                }}
              >
                <XIcon className="mr-2 size-4" />
                <span>Close file</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {contextMenuPosition ? (
            <DropdownMenu
              open={isContextMenuOpen}
              onOpenChange={(open) => {
                setIsContextMenuOpen(open);
                if (!open) {
                  setContextMenuPosition(null);
                }
              }}
            >
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  style={{
                    position: 'fixed',
                    left: contextMenuPosition.x,
                    top: contextMenuPosition.y,
                    width: 1,
                    height: 1,
                    opacity: 0,
                  }}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-80"
                sideOffset={6}
                aria-label="Channel file menu"
                aria-labelledby={undefined}
              >
                <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                  File settings
                </DropdownMenuLabel>
                {item.status === 'ready' ? (
                  <DropdownMenuItem
                    className="focus:bg-transparent"
                    onSelect={(event) => event.preventDefault()}
                  >
                    <div className="flex w-full items-center gap-2">
                      <ClockIcon className="size-4 text-muted-foreground" />
                      <div className="flex w-full items-center gap-2">
                        <label className="text-xs text-muted-foreground" htmlFor={timeDelayInputId}>
                          Time delay (s)
                        </label>
                        <Input
                          ref={inputRef}
                          id={timeDelayInputId}
                          type="number"
                          step="any"
                          aria-label="Time delay"
                          data-testid="channel-file-menu-time-offset-input"
                          value={timeOffsetInput}
                          onChange={handleTimeOffsetInputChange}
                          onKeyDown={handleTimeOffsetKeyDown}
                          className="h-7 w-24 text-xs"
                          placeholder="0.0"
                        />
                        <button
                          onClick={handleTimeOffsetApply}
                          className="rounded border border-border px-2 py-1 text-xs text-foreground hover:bg-muted"
                          type="button"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => {
                            setTimeOffsetInput('0');
                            onTimeOffsetChange(item.filePath, 0);
                            setIsContextMenuOpen(false);
                            setContextMenuPosition(null);
                          }}
                          className="rounded border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
                          type="button"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => {
                    onCloseFile(item.filePath);
                  }}
                >
                  <XIcon className="mr-2 size-4" />
                  <span>Close file</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
        <AccordionContent>{renderContent()}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function mapToMenuItems(data: OpenedChannelFile): ChannelMenuItem {
  if (data.status !== 'ready') {
    return {
      fileName: getFileName(data.path),
      filePath: data.path,
      status: 'loading',
    };
  }

  return {
    fileName: getFileName(data.path),
    filePath: data.path,
    status: 'ready',
    channels: data.file.content.series,
    timeOffset: data.timeOffset,
  };
}

function getFileName(filePath: string): string {
  return (
    filePath
      .split(/[\\/]/)
      .pop()
      ?.replace(/\.[^/.]+$/, '') || filePath
  );
}

function buildChannelKey(filePath: string, channelId: string): string {
  return `${filePath}::${channelId}`;
}
