import { describe, expect, test, beforeEach } from 'vitest';

import { useChannelFilesStore } from '@renderer/store/ChannelFilesStore';
import { ChannelFilePreviewPrimitive } from '@shared/domain/primitives/ChannelFilePreviewPrimitive';

function createMockChannelFile(path: string): ChannelFilePreviewPrimitive {
  return {
    path,
    content: {
      schemaVersion: 1,
      metadata: {
        type: 'csv',
      },
      x: {
        id: 'time',
        label: 'Time',
        unit: 's',
      },
      series: [
        {
          id: 'channel-1',
          label: 'Voltage',
          unit: 'V',
        },
      ],
    },
  };
}

describe('ChannelFilesStore', () => {
  beforeEach(() => {
    useChannelFilesStore.setState({
      files: [],
      actions: useChannelFilesStore.getState().actions,
    });
  });

  describe('addFile', () => {
    test('should add a new file', () => {
      const { addFile } = useChannelFilesStore.getState().actions;
      const file = createMockChannelFile('/path/to/file1.csv');

      addFile(file);

      const { files } = useChannelFilesStore.getState();
      expect(files).toHaveLength(1);
      expect(files[0].path).toBe('/path/to/file1.csv');
    });

    test('should add file at the beginning of the list', () => {
      const { addFile } = useChannelFilesStore.getState().actions;
      const file1 = createMockChannelFile('/path/to/file1.csv');
      const file2 = createMockChannelFile('/path/to/file2.csv');

      addFile(file1);
      addFile(file2);

      const { files } = useChannelFilesStore.getState();
      expect(files[0].path).toBe('/path/to/file2.csv');
      expect(files[1].path).toBe('/path/to/file1.csv');
    });

    test('should replace existing file with same path', () => {
      const { addFile } = useChannelFilesStore.getState().actions;
      const file1 = createMockChannelFile('/path/to/file.csv');
      const file2 = createMockChannelFile('/path/to/file.csv');

      addFile(file1);
      addFile(file2);

      const { files } = useChannelFilesStore.getState();
      expect(files).toHaveLength(1);
      expect(files[0].path).toBe('/path/to/file.csv');
    });
  });

  describe('removeFile', () => {
    test('should remove a file by path', () => {
      const { addFile, removeFile } = useChannelFilesStore.getState().actions;
      const file1 = createMockChannelFile('/path/to/file1.csv');
      const file2 = createMockChannelFile('/path/to/file2.csv');

      addFile(file1);
      addFile(file2);
      removeFile('/path/to/file1.csv');

      const { files } = useChannelFilesStore.getState();
      expect(files).toHaveLength(1);
      expect(files[0].path).toBe('/path/to/file2.csv');
    });

    test('should handle removing non-existent file', () => {
      const { addFile, removeFile } = useChannelFilesStore.getState().actions;
      const file = createMockChannelFile('/path/to/file1.csv');

      addFile(file);
      removeFile('/path/to/non-existent.csv');

      const { files } = useChannelFilesStore.getState();
      expect(files).toHaveLength(1);
      expect(files[0].path).toBe('/path/to/file1.csv');
    });

    test('should remove all matching files', () => {
      const { addFile, removeFile } = useChannelFilesStore.getState().actions;
      const file1 = createMockChannelFile('/path/to/file1.csv');
      const file2 = createMockChannelFile('/path/to/file2.csv');
      const file3 = createMockChannelFile('/path/to/file3.csv');

      addFile(file1);
      addFile(file2);
      addFile(file3);
      removeFile('/path/to/file2.csv');

      const { files } = useChannelFilesStore.getState();
      expect(files).toHaveLength(2);
      expect(files.map((f) => f.path)).toEqual(['/path/to/file3.csv', '/path/to/file1.csv']);
    });
  });

  describe('clearFiles', () => {
    test('should remove all files', () => {
      const { addFile, clearFiles } = useChannelFilesStore.getState().actions;
      const file1 = createMockChannelFile('/path/to/file1.csv');
      const file2 = createMockChannelFile('/path/to/file2.csv');

      addFile(file1);
      addFile(file2);
      clearFiles();

      const { files } = useChannelFilesStore.getState();
      expect(files).toHaveLength(0);
    });
  });
});
