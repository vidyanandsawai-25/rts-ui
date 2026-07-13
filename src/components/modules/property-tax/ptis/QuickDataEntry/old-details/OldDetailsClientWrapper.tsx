'use client';

import { ReactNode } from 'react';
import { OldDetailsTabNav } from './OldDetailsTabNav';

export default function OldDetailsClientWrapper({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <OldDetailsTabNav />
            <div className="flex-1 overflow-y-auto bg-white">
                {children}
            </div>
        </div>
    );
}