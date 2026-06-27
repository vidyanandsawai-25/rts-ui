'use client';

import { useServerInsertedHTML } from 'next/navigation';

interface RuntimeConfigInjectProps {
  configScript: string;
}

export function RuntimeConfigInject({ configScript }: RuntimeConfigInjectProps) {
  useServerInsertedHTML(() => {
    return (
      <script
        id="runtime-config"
        dangerouslySetInnerHTML={{ __html: configScript }}
      />
    );
  });

  return null;
}
