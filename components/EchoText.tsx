import React from 'react';

interface EchoTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'div' | 'span';
  className?: string;
  sizeClass?: string;
}

/**
 * Swiss Minimalist Echo Effect:
 * Layered text with 4-5 background repetitions offset by -0.04em, -0.08em, -0.12em, and -0.16em,
 * fading from #bfbfbf to #d9d9d9, with foreground text in #111111.
 */
export function EchoText({
  text,
  as: Tag = 'h1',
  className = '',
  sizeClass = 'text-4xl sm:text-6xl lg:text-7xl',
}: EchoTextProps) {
  return (
    <Tag
      className={`relative inline-block select-none font-headline font-bold uppercase tracking-[-0.05em] leading-[0.9] pt-[0.2em] ${sizeClass} ${className}`}
    >
      {/* Background Layer 4: offset -0.16em, color #d9d9d9 */}
      <span
        className="absolute left-0 top-[0.04em] text-[#d9d9d9] pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        {text}
      </span>

      {/* Background Layer 3: offset -0.12em, color #d0d0d0 */}
      <span
        className="absolute left-0 top-[0.08em] text-[#d0d0d0] pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        {text}
      </span>

      {/* Background Layer 2: offset -0.08em, color #c8c8c8 */}
      <span
        className="absolute left-0 top-[0.12em] text-[#c8c8c8] pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        {text}
      </span>

      {/* Background Layer 1: offset -0.04em, color #bfbfbf */}
      <span
        className="absolute left-0 top-[0.16em] text-[#bfbfbf] pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        {text}
      </span>

      {/* Foreground Layer: primary text deep black #111111 */}
      <span className="relative z-10 text-[#111111]">{text}</span>
    </Tag>
  );
}

