import { describe, expect, it } from 'vitest';

import { ReadPsseOutFilePath } from '@main/channel-file/application/use-cases/ReadPsseOutFilePath';
import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';

import { ChannelFilePrimitiveMother } from '../../../../shared/domain/primitives/ChannelFilePrimitiveMother';
import { PsseOutFileServiceMock } from '../../infrastructure/services/PsseOutFileServiceMock';

describe('ReadPsseOutFilePath', () => {
  it('returns the channel file primitives from the service', async () => {
    const channelFilePrimitive = ChannelFilePrimitiveMother.random();
    const channelFile = ChannelFile.fromPrimitives(channelFilePrimitive);
    const service = new PsseOutFileServiceMock();
    const useCase = new ReadPsseOutFilePath(service);

    service.transformToChannelFileMock.mockResolvedValue(channelFile);

    const result = await useCase.run(channelFilePrimitive.path);

    expect(service.transformToChannelFileMock).toHaveBeenCalledWith(channelFilePrimitive.path);
    expect(result).toEqual(channelFile.toPrimitives());
  });

  it('propagates errors from the service', async () => {
    const service = new PsseOutFileServiceMock();
    const useCase = new ReadPsseOutFilePath(service);
    const expectedError = new Error('transform to channel file failed');

    service.transformToChannelFileMock.mockRejectedValue(expectedError);

    await expect(useCase.run('/path/to/file.out')).rejects.toBe(expectedError);
  });
});
