'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { TenantConfig, getTenant, TENANTS, TENANT_DEFAULT_ID } from '@/config/tenant';

interface TenantContextValue {
  tenant: TenantConfig;
  setTenantId: (id: string) => void;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState<string>(TENANT_DEFAULT_ID);

  const tenant = useMemo(() => getTenant(tenantId), [tenantId]);

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.host : '';
    if (host) {
      const matched = Object.values(TENANTS).find((t) => host.includes(t.domain));
      if (matched) setTenantId(matched.id);
    }
  }, []);

  useEffect(() => {
    const t = tenant.theme;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', t.primary);
    root.style.setProperty('--color-secondary', t.secondary);
    root.style.setProperty('--color-accent', t.accent);
    root.style.setProperty('--color-map-bg', t.mapBackground);
  }, [tenant]);

  return (
    <TenantContext.Provider value={{ tenant, setTenantId }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant(): TenantContextValue {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}
