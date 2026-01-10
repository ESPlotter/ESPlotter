import { describe, expect, it } from 'vitest';

import { ReadCsvTxtFilePath } from '@main/channel-file/application/use-cases/ReadCsvTxtFilePath';
import { ChannelFile } from '@main/channel-file/domain/entities/ChannelFile';

import { ChannelFilePrimitiveMother } from '../../../../shared/domain/primitives/ChannelFilePrimitiveMother';
import { CsvTxtFileServiceMock } from '../../infrastructure/services/CsvTxtFileServiceMock';

describe('ReadCsvTxtFilePath', () => {
  it('returns the channel file primitives from the service', async () => {
    const channelFilePrimitive = ChannelFilePrimitiveMother.random();
    const channelFile = ChannelFile.fromPrimitives(channelFilePrimitive);
    const service = new CsvTxtFileServiceMock();
    const useCase = new ReadCsvTxtFilePath(service);

    service.transformToChannelFileMock.mockResolvedValue(channelFile);

    const result = await useCase.run(channelFilePrimitive.path);

    expect(service.transformToChannelFileMock).toHaveBeenCalledWith(channelFilePrimitive.path);
    expect(result).toEqual(channelFile.toPrimitives());
  });

  it('propagates errors from the service', async () => {
    const service = new CsvTxtFileServiceMock();
    const useCase = new ReadCsvTxtFilePath(service);
    const expectedError = new Error('transform to channel file failed');

    service.transformToChannelFileMock.mockRejectedValue(expectedError);

    await expect(useCase.run('/path/to/file.txt')).rejects.toBe(expectedError);
  });
});
