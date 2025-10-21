import type { ChannelFilePrimitive } from '@shared/domain/primitives/ChannelFilePrimitive';

export class GetOpenedChannelFiles {
  constructor(
    private readonly stateRepository: import('../../domain/repositories/StateRepository').StateRepository,
  ) {}

  async run(): Promise<ChannelFilePrimitive[]> {
    const files = await this.stateRepository.getOpenedChannelFiles();
    return files.map((file) => file.toPrimitives());
  }
}
