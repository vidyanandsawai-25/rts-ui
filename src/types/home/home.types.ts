export interface Stat {
    label: string;
    value: string;
}

export interface Service {
    id: number;
    name?: string;
    link: string;
    icon: string;
    title: string;
    subtext: string;
    stats?: Stat[];
    description?: string;
    [key: string]: unknown;
}

export interface DashboardStats {
    totalUsers: number;
    activeProperties: number;
    totalRevenue: number;
    [key: string]: unknown;
}

export type ServiceCardProps = Omit<Service, 'id'>;
