/**
 * Format UTC ISO string to local readable date and time.
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return 'Belum pernah aktif';

  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '-';

    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

/**
 * Format relative time (e.g. "baru saja", "2 menit lalu").
 */
export function formatTimeAgo(isoString: string | null | undefined): string {
  if (!isoString) return 'Belum pernah aktif';

  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 0) return 'Baru saja';

    const diffSeconds = Math.floor(diffMs / 1000);
    if (diffSeconds < 10) return 'Baru saja';
    if (diffSeconds < 60) return `${diffSeconds} dtk lalu`;

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes} mnt lalu`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} jam lalu`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} hari lalu`;
  } catch {
    return formatDateTime(isoString);
  }
}

