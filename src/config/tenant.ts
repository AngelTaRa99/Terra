export interface TenantConfig {
  id: string;
  companyName: string;
  domain: string;
  assets: {
    logoUrl: string;
    favicon: string;
    heroImage: string;
  };
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    mapBackground: string;
  };
  contactFormEmail: string;
  mapSettings: {
    lat: number;
    lng: number;
    defaultZoom: number;
  };
}

export const TENANTS: Record<string, TenantConfig> = {
  'inmobiliaria-alpha': {
    id: 'inmobiliaria-alpha',
    companyName: 'Inmobiliaria Alpha',
    domain: 'alpha.terra-saas.com',
    assets: {
      logoUrl: '/logos/alpha-logo.svg',
      favicon: '/logos/alpha-favicon.ico',
      heroImage: '/heroes/alpha-hero.jpg',
    },
    theme: {
      primary: '#059669',
      secondary: '#0284c7',
      accent: '#d97706',
      mapBackground: '#F3F4F6',
    },
    contactFormEmail: 'ventas@inmobiliaria-alpha.com',
    mapSettings: {
      lat: 25.6866,
      lng: -100.3161,
      defaultZoom: 16,
    },
  },

  'beta-bienes-raices': {
    id: 'beta-bienes-raices',
    companyName: 'Beta Bienes Raíces',
    domain: 'beta.terra-saas.com',
    assets: {
      logoUrl: '/logos/beta-logo.svg',
      favicon: '/logos/beta-favicon.ico',
      heroImage: '/heroes/beta-hero.jpg',
    },
    theme: {
      primary: '#7c3aed',
      secondary: '#0ea5e9',
      accent: '#f59e0b',
      mapBackground: '#f0f4ff',
    },
    contactFormEmail: 'contacto@beta-bienes-raices.com',
    mapSettings: {
      lat: 25.7255,
      lng: -100.2742,
      defaultZoom: 15,
    },
  },
};

export const TENANT_DEFAULT_ID = 'inmobiliaria-alpha';

export function getTenant(id: string): TenantConfig {
  return TENANTS[id] ?? TENANTS[TENANT_DEFAULT_ID];
}

export function resolveTenantFromDomain(host: string): TenantConfig {
  const matched = Object.values(TENANTS).find((t) => host.includes(t.domain));
  return matched ?? TENANTS[TENANT_DEFAULT_ID];
}
