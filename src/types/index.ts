export type TerrenoEstado = 'libre' | 'en_visita' | 'apartado' | 'vendido';

export interface Coordenada {
  lat: number;
  lng: number;
}

export interface Terreno {
  id_terreno: string;
  proyecto_id: string;
  area_m2: number;
  perimetro: number;
  medidas_lados: number[];
  ubicacion: Coordenada[];
  precio_metro_cuadrado: number;
  estado: TerrenoEstado;
}

export interface Proyecto {
  id: string;
  nombre: string;
  archivo_kmz_url: string;
  coordenadas_centro: Coordenada;
  terrenos: Terreno[];
}

export type Rol = 'vendedor' | 'visitante';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: Rol;
}
