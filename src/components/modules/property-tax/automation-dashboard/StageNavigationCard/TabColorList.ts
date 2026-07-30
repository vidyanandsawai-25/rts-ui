export const getTabColors = (value: string) => {
    switch (value) {
        case 'geo-sequencing':
            return {
                iconBgActive: '#7c3aed',
                bgActive: '#f5f3ff',
                iconTextInactive: '#7c3aed',
            };
        case 'internal-survey':
            return {
                iconBgActive: '#3b82f6',
                bgActive: '#eff6ff',
                iconTextInactive: '#3b82f6',
            };
        case 'quality-check':
            return {
                iconBgActive: '#10b981',
                bgActive: '#ecfdf5',
                iconTextInactive: '#10b981',
            };
        case 'assessment':
            return {
                iconBgActive: '#3b82f6',
                bgActive: '#eff6ff',
                iconTextInactive: '#3b82f6',
            };
        case 'approval-by-ulb':
            return {
                iconBgActive: '#22c55e',
                bgActive: '#f0fdf4',
                iconTextInactive: '#22c55e',
            };
        case 'notice-distribution':
            return {
                iconBgActive: '#f59e0b',
                bgActive: '#fef3c7',
                iconTextInactive: '#f59e0b',
            };
        case 'hearing-appeals':
            return {
                iconBgActive: '#ef4444',
                bgActive: '#fef2f2',
                iconTextInactive: '#ef4444',
            };
        case 'bills-distribution':
            return {
                iconBgActive: '#6366f1',
                bgActive: '#eef2ff',
                iconTextInactive: '#6366f1',
            };
        case 'bill-generation':
            return {
                iconBgActive: '#7c3aed',
                bgActive: '#f5f3ff',
                iconTextInactive: '#7c3aed',
            };
        default:
            return {
                iconBgActive: '#6366f1',
                bgActive: '#f8fafc',
                iconTextInactive: '#6366f1',
            };
    }
};
