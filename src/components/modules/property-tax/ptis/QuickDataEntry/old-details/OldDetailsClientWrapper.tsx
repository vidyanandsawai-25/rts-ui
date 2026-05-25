'use client';

import { ReactNode } from 'react';
import { OldDetailsTabNav } from './OldDetailsTabNav';

export default function OldDetailsClientWrapper({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="flex h-full flex-col bg-white">
            <OldDetailsTabNav />
            <div className="flex-1 overflow-y-auto bg-white p-4">
                {children}
            </div>
        </div>
    );
}