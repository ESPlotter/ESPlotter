export class ChannelFileStructureDoesNotHaveAllowedStructure extends Error {
  constructor() {
    super('Channel file structure does not have allowed structure');
  }
}
