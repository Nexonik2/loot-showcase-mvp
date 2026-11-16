// src/components/ui/InkDrop.tsx

import React from 'react';
import { Droplet } from 'lucide-react';

interface InkDropProps {
  className?: string;
}

export default function InkDrop({
  className = 'text-emerald-400 fill-emerald-400/25',
}: InkDropProps) {
  return (
    <Droplet
      aria-hidden="true"
      className={`inline-block w-[1em] h-[1em] align-[-0.125em] shrink-0 ${className}`}
    />
  );
}