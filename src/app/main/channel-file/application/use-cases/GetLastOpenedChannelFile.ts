import type { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

export class GetLastOpenedChannelFile {
  constructor(
    private readonly stateRepository: import('../../domain/repositories/StateRepository').StateRepository,
  ) {}

  async run(): Promise<ChannelFilePrimitive | null> {
    const file = await this.stateRepository.getLastOpenedChannelFile();

    if (!file) {
      return null;
    }

    return file.toPrimitives();
  }
}
