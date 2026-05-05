export interface SubMenuItem {
  name: string;
  href: string;
  className?: string;
}

/** Serializable for Server → Client Components: use `iconName` only (Lucide export name). */
export interface MenuItem {
  name: string;
  nameHi: string;
  iconName?: string;
  href: string;
  subItems?: SubMenuItem[];
}
