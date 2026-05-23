import { Proyecto } from '@/types';

export const MOCK_PROYECTOS: Proyecto[] = [
  {
    id: 'proj-001',
    nombre: 'Altavista Residencial',
    archivo_kmz_url: '/altavista.kmz',
    coordenadas_centro: { lat: 25.6866, lng: -100.3161 },
    terrenos: [
      {
        id_terreno: 'ALT-001',
        proyecto_id: 'proj-001',
        area_m2: 250,
        perimetro: 65.5,
        medidas_lados: [12.5, 20, 12.5, 20],
        ubicacion: [
          { lat: 25.687, lng: -100.3165 },
          { lat: 25.687, lng: -100.3158 },
          { lat: 25.6864, lng: -100.3158 },
          { lat: 25.6864, lng: -100.3165 },
        ],
        precio_metro_cuadrado: 850,
        estado: 'libre',
      },
      {
        id_terreno: 'ALT-002',
        proyecto_id: 'proj-001',
        area_m2: 320,
        perimetro: 72,
        medidas_lados: [16, 20, 16, 20],
        ubicacion: [
          { lat: 25.6874, lng: -100.3165 },
          { lat: 25.6874, lng: -100.3158 },
          { lat: 25.687, lng: -100.3158 },
          { lat: 25.687, lng: -100.3165 },
        ],
        precio_metro_cuadrado: 920,
        estado: 'vendido',
      },
      {
        id_terreno: 'ALT-003',
        proyecto_id: 'proj-001',
        area_m2: 180,
        perimetro: 54,
        medidas_lados: [9, 18, 9, 18],
        ubicacion: [
          { lat: 25.6864, lng: -100.317 },
          { lat: 25.6864, lng: -100.3165 },
          { lat: 25.6858, lng: -100.3165 },
          { lat: 25.6858, lng: -100.317 },
        ],
        precio_metro_cuadrado: 780,
        estado: 'apartado',
      },
      {
        id_terreno: 'ALT-004',
        proyecto_id: 'proj-001',
        area_m2: 400,
        perimetro: 80,
        medidas_lados: [20, 20, 20, 20],
        ubicacion: [
          { lat: 25.6874, lng: -100.317 },
          { lat: 25.6874, lng: -100.3165 },
          { lat: 25.687, lng: -100.3165 },
          { lat: 25.687, lng: -100.317 },
        ],
        precio_metro_cuadrado: 1100,
        estado: 'libre',
      },
    ],
  },
  {
    id: 'proj-002',
    nombre: 'Bosques del Valle',
    archivo_kmz_url: '/bosques.kmz',
    coordenadas_centro: { lat: 25.7255, lng: -100.2742 },
    terrenos: [
      {
        id_terreno: 'BOS-001',
        proyecto_id: 'proj-002',
        area_m2: 300,
        perimetro: 70,
        medidas_lados: [15, 20, 15, 20],
        ubicacion: [
          { lat: 25.726, lng: -100.2748 },
          { lat: 25.726, lng: -100.274 },
          { lat: 25.7253, lng: -100.274 },
          { lat: 25.7253, lng: -100.2748 },
        ],
        precio_metro_cuadrado: 1250,
        estado: 'vendido',
      },
      {
        id_terreno: 'BOS-002',
        proyecto_id: 'proj-002',
        area_m2: 220,
        perimetro: 59.6,
        medidas_lados: [10.8, 19, 10.8, 19],
        ubicacion: [
          { lat: 25.726, lng: -100.2755 },
          { lat: 25.726, lng: -100.2748 },
          { lat: 25.7253, lng: -100.2748 },
          { lat: 25.7253, lng: -100.2755 },
        ],
        precio_metro_cuadrado: 1150,
        estado: 'libre',
      },
      {
        id_terreno: 'BOS-003',
        proyecto_id: 'proj-002',
        area_m2: 150,
        perimetro: 50,
        medidas_lados: [10, 15, 10, 15],
        ubicacion: [
          { lat: 25.7253, lng: -100.2748 },
          { lat: 25.7253, lng: -100.274 },
          { lat: 25.7248, lng: -100.274 },
          { lat: 25.7248, lng: -100.2748 },
        ],
        precio_metro_cuadrado: 950,
        estado: 'apartado',
      },
    ],
  },
  {
    id: 'proj-003',
    nombre: 'Campestre La Vista',
    archivo_kmz_url: '/campestre.kmz',
    coordenadas_centro: { lat: 25.651, lng: -100.29 },
    terrenos: [
      {
        id_terreno: 'CLV-001',
        proyecto_id: 'proj-003',
        area_m2: 500,
        perimetro: 90,
        medidas_lados: [25, 20, 25, 20],
        ubicacion: [
          { lat: 25.6515, lng: -100.2905 },
          { lat: 25.6515, lng: -100.2895 },
          { lat: 25.6505, lng: -100.2895 },
          { lat: 25.6505, lng: -100.2905 },
        ],
        precio_metro_cuadrado: 1400,
        estado: 'libre',
      },
      {
        id_terreno: 'CLV-002',
        proyecto_id: 'proj-003',
        area_m2: 350,
        perimetro: 75,
        medidas_lados: [15, 25, 15, 25],
        ubicacion: [
          { lat: 25.6515, lng: -100.2915 },
          { lat: 25.6515, lng: -100.2905 },
          { lat: 25.6505, lng: -100.2905 },
          { lat: 25.6505, lng: -100.2915 },
        ],
        precio_metro_cuadrado: 1350,
        estado: 'vendido',
      },
    ],
  },
];

export const getProjectByName = (nombre: string): Proyecto | undefined =>
  MOCK_PROYECTOS.find((p) => p.nombre === nombre);

export const getSortedProjects = (): Proyecto[] =>
  [...MOCK_PROYECTOS].sort((a, b) => a.nombre.localeCompare(b.nombre));
