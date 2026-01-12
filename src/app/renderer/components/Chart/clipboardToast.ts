import { IconCheck } from '@tabler/icons-react';
import { createElement } from 'react';
import { toast } from 'sonner';

const SUCCESS_ICON = createElement(IconCheck, { className: 'size-4' });

export function notifyClipboardSuccess(message: string): void {
  toast.success(message, { icon: SUCCESS_ICON });
}
