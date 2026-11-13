import { ContentType } from '@/lib/types';

interface ContentTypeBadgeProps {
  tipe: ContentType;
}

/**
 * Flat Design Content Type Tag:
 * Distinct solid color blocks for clear visual differentiation without shadows.
 */
export function ContentTypeBadge({ tipe }: ContentTypeBadgeProps) {
  const styles: Record<ContentType, { label: string; bg: string; text: string }> = {
    text: {
      label: 'TEXT',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
    },
    image: {
      label: 'IMAGE',
      bg: 'bg-emerald-100',
      text: 'text-emerald-700',
    },
    video: {
      label: 'VIDEO',
      bg: 'bg-amber-100',
      text: 'text-amber-800',
    },
    url: {
      label: 'WEB URL',
      bg: 'bg-purple-100',
      text: 'text-purple-700',
    },
  };

  const style = styles[tipe] || styles.text;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold tracking-wider uppercase ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}
