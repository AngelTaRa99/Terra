import { Proyecto, Terreno, TerrenoEstado } from '@/types';

function parseEstado(desc: string): TerrenoEstado {
  if (/\bvendido\b/i.test(desc)) return 'vendido';
  if (/\bapartado\b/i.test(desc)) return 'apartado';
  if (/\bvisita\b/i.test(desc)) return 'en_visita';
  return 'libre';
}

function parseArea(desc: string): number {
  const m = desc.match(/([\d,.]+)\s*m/i);
  return m ? parseFloat(m[1].replace(/,/g, '')) : 0;
}

function parsePrice(desc: string): number {
  const m = desc.match(/\$([\d,.]+)\//);
  return m ? parseFloat(m[1].replace(/,/g, '')) : 0;
}

function coordStringToLatLng(coordStr: string): { lat: number; lng: number }[] {
  return coordStr.trim().split(/\s+/).map((pair) => {
    const parts = pair.split(',');
    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    return { lat, lng };
  });
}

const DEG_TO_M = 111320;

function distMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dlat = (a.lat - b.lat) * DEG_TO_M;
  const dlng = (a.lng - b.lng) * DEG_TO_M * Math.cos(((a.lat + b.lat) / 2) * (Math.PI / 180));
  return Math.sqrt(dlat * dlat + dlng * dlng);
}

function computePerimeter(coords: { lat: number; lng: number }[]): number {
  let perim = 0;
  for (let i = 0; i < coords.length; i++) {
    perim += distMeters(coords[i], coords[(i + 1) % coords.length]);
  }
  return Math.round(perim * 10) / 10;
}

function computeSideLengths(coords: { lat: number; lng: number }[]): number[] {
  const sides: number[] = [];
  for (let i = 1; i < coords.length; i++) {
    sides.push(Math.round(distMeters(coords[i], coords[i - 1]) * 10) / 10);
  }
  sides.push(Math.round(distMeters(coords[0], coords[coords.length - 1]) * 10) / 10);
  return sides;
}

function getTagText(el: Element, tagName: string): string {
  const ns = el.getElementsByTagNameNS('*', tagName);
  return ns.length > 0 ? ns[0].textContent ?? '' : '';
}

function getFirstTag(el: Element, tagName: string): Element | null {
  const ns = el.getElementsByTagNameNS('*', tagName);
  return ns.length > 0 ? ns[0] : null;
}

function parseKmlText(xml: string): Terreno[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const placemarks = Array.from(doc.getElementsByTagNameNS('*', 'Placemark'));
  const terrenos: Terreno[] = [];

  for (const pm of placemarks) {
    const id_terreno = getTagText(pm, 'name');
    const desc = getTagText(pm, 'description');
    const coordsNode = getFirstTag(pm, 'coordinates');
    if (!coordsNode?.textContent) continue;
    const ubicacion = coordStringToLatLng(coordsNode.textContent);

    terrenos.push({
      id_terreno,
      proyecto_id: '',
      area_m2: parseArea(desc),
      perimetro: computePerimeter(ubicacion),
      medidas_lados: computeSideLengths(ubicacion),
      ubicacion,
      precio_metro_cuadrado: parsePrice(desc),
      estado: parseEstado(desc),
    });
  }

  return terrenos;
}

export async function fetchKmlAsProyecto(url: string, proyectoId?: string): Promise<Proyecto | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const xml = await res.text();
    const terrenos = parseKmlText(xml).map((t) => ({
      ...t,
      proyecto_id: proyectoId ?? t.proyecto_id,
    }));
    if (terrenos.length === 0) return null;

    const lats = terrenos.flatMap((t) => t.ubicacion.map((c) => c.lat));
    const lngs = terrenos.flatMap((t) => t.ubicacion.map((c) => c.lng));

    return {
      id: proyectoId ?? url,
      nombre: url.split('/').pop()?.replace(/\.kml$/, '').replace(/^./, (c) => c.toUpperCase()) ?? 'Proyecto',
      archivo_kmz_url: url.replace(/\.kml$/, '.kmz'),
      coordenadas_centro: {
        lat: (Math.min(...lats) + Math.max(...lats)) / 2,
        lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      },
      terrenos,
    };
  } catch {
    return null;
  }
}
