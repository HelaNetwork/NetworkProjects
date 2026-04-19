'use client';

import dynamic from 'next/dynamic';

const CursorParticles = dynamic(() => import('@/components/CursorParticles'), {
  ssr: false,
});

export default function ClientParticles() {
  return <CursorParticles />;
}
