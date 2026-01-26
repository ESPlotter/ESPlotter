import { XIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

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
}

export function AppSidebar() {
  const openedChannelFiles = useOpenedChannelFiles();
  const selectedChartId = useSelectedChartId();
  const charts = useCharts();
  const { addChannelToChart, removeChannelFromChart, removeChannelsFromAllCharts } =
    useChannelChartsActions();
  const { removeFile } = useChannelFilesActions();

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
      const serie = mapToChartSerie(seriesPayload.channel, seriesPayload.x.values);

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
}: ChannelFileAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleValueChange(value: string) {
    setIsOpen(value === item.filePath);
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
        <div className="flex w-full items-center gap-2">
          <AccordionTrigger className="flex-1 text-sm font-medium">
            <span className="flex min-w-0 flex-1 items-center gap-2 text-left">
              <span className="truncate">{item.fileName}</span>
              {item.status === 'loading' ? (
                <span className="size-3 animate-spin rounded-full border border-muted-foreground border-t-transparent" />
              ) : null}
            </span>
          </AccordionTrigger>
          <button
            onClick={() => onCloseFile(item.filePath)}
            className="rounded p-1 hover:bg-muted"
            aria-label="Close file"
            title="Close"
            type="button"
          >
            <XIcon className="size-4" />
          </button>
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
