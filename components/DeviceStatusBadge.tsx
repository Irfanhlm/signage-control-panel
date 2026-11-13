import { DeviceStatus } from '@/lib/types';

interface DeviceStatusBadgeProps {
  status: DeviceStatus;
  size?: 'sm' | 'md';
}

export function DeviceStatusBadge({ status, size = 'md' }: DeviceStatusBadgeProps) {
  const isOnline = status === 'online';

  const sizeClasses =
    size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-md transition-all duration-200 ${sizeClasses} ${
        isOnline
          ? 'bg-emerald-500 text-white'
          : 'bg-gray-200 text-gray-700'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isOnline ? 'bg-white' : 'bg-gray-500'
        }`}
        aria-hidden="true"
      />
      <span>{isOnline ? 'Online' : 'Offline'}</span>
    </span>
  );
}
