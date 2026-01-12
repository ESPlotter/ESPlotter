import { type Page } from '@playwright/test';

import { getSidebarChannelButton } from './getSidebarChannelButton';

export async function clickSidebarChannel(
  page: Page,
  channelLabel: string,
  fileLabel?: string,
): Promise<void> {
  const channelButton = getSidebarChannelButton(page, channelLabel, fileLabel);
  await channelButton.waitFor({ state: 'visible', timeout: 5000 });
  await channelButton.click();
}
