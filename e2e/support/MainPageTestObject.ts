import path from 'node:path';

import { type ElectronApplication, type Page } from '@playwright/test';

import { ChartTestObject } from './ChartTestObject';
import { ClipboardTestObject } from './ClipboardTestObject';
import { MenuTestObject } from './MenuTestObject';
import { PreferencesTestObject } from './PreferencesTestObject';
import { SidebarTestObject } from './SidebarTestObject';
import { setupE2eTestEnvironment } from './setupE2eTestEnvironment';

interface WindowFilesApi {
  onChannelFileOpened: (listener: () => void) => () => void;
}

export class MainPageTestObject {
  readonly charts: ChartTestObject;
  readonly clipboard: ClipboardTestObject;
  readonly menu: MenuTestObject;
  readonly preferences: PreferencesTestObject;
  readonly sidebar: SidebarTestObject;

  private constructor(
    private readonly app: ElectronApplication,
    private readonly page: Page,
  ) {
    this.menu = new MenuTestObject(app, page);
    this.sidebar = new SidebarTestObject(page);
    this.charts = new ChartTestObject(page);
    this.clipboard = new ClipboardTestObject(app);
    this.preferences = new PreferencesTestObject(this.menu, page);
  }

  static async create(): Promise<MainPageTestObject> {
    const { electronApp, mainPage } = await setupE2eTestEnvironment();
    return new MainPageTestObject(electronApp, mainPage);
  }

  get electronApp(): ElectronApplication {
    return this.app;
  }

  get mainPage(): Page {
    return this.page;
  }

  async close(): Promise<void> {
    await this.app.close();
  }

  async openFixtureViaImportMenu(fixtureName: string): Promise<void> {
    await this.setNextOpenFixturePath(fixtureName);
    const parsedPromise = this.waitForLastOpenedChannelFileChanged();
    await this.menu.openImportMenu();
    await parsedPromise;
  }

  async openFixtureAndExpandInSidebar(fixtureName: string, fileLabel: string): Promise<void> {
    await this.openFixtureViaImportMenu(fixtureName);
    await this.sidebar.expandFile(fileLabel);
  }

  async attemptImportFixture(fixtureName: string): Promise<void> {
    await this.setNextOpenFixturePath(fixtureName);
    await this.menu.openImportMenu();
  }

  async openOutFixture(fixtureName: string): Promise<void> {
    await this.setNextOpenFixturePath(fixtureName);
    const parsedPromise = this.waitForLastOpenedChannelFileChanged();
    await this.menu.openOutFileMenu();
    await parsedPromise;
    await this.sidebar.expandFirstFile();
  }

  async createChartsWithChannel(channelLabel: string, count: number): Promise<void> {
    for (let index = 0; index < count; index += 1) {
      await this.charts.createAndSelectChart();
      await this.sidebar.toggleChannel(channelLabel);
    }
  }

  private async setNextOpenFixturePath(fileName: string): Promise<string> {
    const fullPath = path.resolve(process.cwd(), 'fixtures', fileName);
    await this.app.evaluate((_, fixturePath) => {
      process.env.ESPLOTTER_E2E_OPEN_PATH = fixturePath;
    }, fullPath);

    return fullPath;
  }

  private waitForLastOpenedChannelFileChanged(): Promise<void> {
    return this.page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          const filesApi = window.files as WindowFilesApi;
          const off = filesApi.onChannelFileOpened(() => {
            off();
            resolve();
          });
        }),
    );
  }
}
