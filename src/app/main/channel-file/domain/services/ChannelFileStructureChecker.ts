import { ChannelFileStructureDoesNotHaveAllowedStructure } from '../exceptions/ChannelFileStructureDoesNotHaveAllowedStructure';

export class ChannelFileStructureChecker {
  constructor() {}

  async run(content: string): Promise<void> {
    const data: unknown = JSON.parse(content);

    if (!this.isAllowedFileStructure(data)) {
      throw new ChannelFileStructureDoesNotHaveAllowedStructure();
    }
  }

  private isAllowedFileStructure(fileContent: unknown): boolean {
    const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
    const isNumArray = (v: unknown): v is number[] =>
      Array.isArray(v) && v.every((n) => typeof n === 'number' && Number.isFinite(n));

    if (!isObj(fileContent)) return false;
    if (typeof fileContent.schemaVersion !== 'number') return false;

    // metadata
    if (!isObj(fileContent.metadata)) return false;
    if (typeof fileContent.metadata.timestamp !== 'string') return false;
    if (typeof (fileContent.metadata as Record<string, unknown>).SCR !== 'number') return false;

    // x axis
    if (!isObj(fileContent.x)) return false;
    if (typeof fileContent.x.id !== 'string') return false;
    if (typeof fileContent.x.label !== 'string') return false;
    if (typeof fileContent.x.unit !== 'string') return false;
    if (!isNumArray(fileContent.x.values)) return false;

    // series
    if (!Array.isArray(fileContent.series) || fileContent.series.length === 0) return false;
    for (const s of fileContent.series) {
      if (!isObj(s)) return false;
      if (typeof s.id !== 'string') return false;
      if (typeof s.label !== 'string') return false;
      if (typeof s.unit !== 'string') return false;
      if (!isNumArray(s.values)) return false;
    }

    return true;
  }
}
