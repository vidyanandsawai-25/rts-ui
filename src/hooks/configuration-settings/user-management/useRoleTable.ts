'use client';

import { useState, useMemo } from 'react';
import { Role } from '@/types/user-management';

export function useRoleTable(initialRoles: Role[]) {
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const pageSize = 10;

  const filteredRoles = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return roles.filter((r) => (r.name || '').toLowerCase().includes(term));
  }, [roles, searchTerm]);

  return {
    roles,
    setRoles,
    searchTerm,
    setSearchTerm,
    pageNumber,
    setPageNumber,
    pageSize,
    filteredRoles,
  };
}
