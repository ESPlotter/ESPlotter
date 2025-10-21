import { useMemo } from 'react';

import { useOpenedChannelFiles } from '@renderer/hooks/useOpenedChannelFiles';
import {
  useSelectedChartId,
  useCharts,
  useChannelChartsActions,
} from '@renderer/store/ChannelChartsStore';
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
import { ChannelFileContentSeriePrimitive } from '@shared/domain/primitives/ChannelFileContentSeriePrimitive';
import { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

import { mapToChartSerie } from '../Chart/mapToChartSerie';

interface ChannelMenuItem {
  fileName: string;
  filePath: string;
  xValues: number[];
  channels: ChannelFileContentSeriePrimitive[];
}

export function AppSidebar() {
  const openedChannelFiles = useOpenedChannelFiles();
  const selectedChartId = useSelectedChartId();
  const charts = useCharts();
  const { addChannelToChart, removeChannelFromChart } = useChannelChartsActions();

  const allItems = useMemo(() => {
    return openedChannelFiles.map(mapToMenuItems);
  }, [openedChannelFiles]);

  const selectedChart = selectedChartId ? charts[selectedChartId] : undefined;
  const selectedChannels = selectedChart?.channels ?? {};

  function handleChannelClick(
    menuItem: ChannelMenuItem,
    channel: ChannelFileContentSeriePrimitive,
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

    const serie = mapToChartSerie(channel, menuItem.xValues);

    if (!serie) {
      return;
    }

    addChannelToChart(selectedChartId, channelKey, serie);
  }

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CHANNELS</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {allItems.map((item) => (
                <Accordion type="single" collapsible key={item.filePath}>
                  <AccordionItem value={item.filePath}>
                    <AccordionTrigger className="text-sm font-medium">
                      {item.fileName}
                    </AccordionTrigger>
                    <AccordionContent>
                      {item.channels?.map((channel) => {
                        const channelKey = buildChannelKey(item.filePath, channel.id);
                        const isChannelSelected = Boolean(selectedChannels[channelKey]);

                        return (
                          <SidebarMenuItem key={channelKey}>
                            <SidebarMenuButton
                              isActive={isChannelSelected}
                              className="data-[active=true]:bg-neutral-600 data-[active=true]:text-white data-[active=true]:hover:bg-neutral-800 data-[active=true]:hover:text-white data-[active=false]:hover:bg-neutral-200 my-1"
                              onClick={() => handleChannelClick(item, channel)}
                            >
                              <span>
                                {channel.label} ({channel.unit})
                              </span>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

function mapToMenuItems(data: ChannelFilePrimitive): ChannelMenuItem {
  return {
    fileName: getFileName(data.path),
    filePath: data.path,
    xValues: data.content.x.values,
    channels: data.content.series,
  };

  function getFileName(filePath: string): string {
    return (
      filePath
        .split(/[\\/]/)
        .pop()
        ?.replace(/\.[^/.]+$/, '') || 'test'
    );
  }
}

function buildChannelKey(filePath: string, channelId: string): string {
  return `${filePath}::${channelId}`;
}
