import { ChannelFile } from '../entities/ChannelFile';

export interface ChannelFileStateRepository {
  saveOpenedChannelFiles(files: ChannelFile[]): Promise<void>;
  getLastOpenedChannelFile(): Promise<ChannelFile | null>;
  getOpenedChannelFiles(): Promise<ChannelFile[]>;
  onLastOpenedChannelFileChange(cb: (file: ChannelFile | null) => void): () => void;
}
