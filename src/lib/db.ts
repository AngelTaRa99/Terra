import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { MOCK_PROYECTOS } from './mockData';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DB_DIR, 'terra.db');

let db: Database.Database | null = null;

function initSchema() {
  db!.exec(`
    CREATE TABLE IF NOT EXISTS proyectos (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      archivo_kmz_url TEXT NOT NULL,
      coordenadas_centro TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS terrenos (
      id_terreno TEXT NOT NULL,
      proyecto_id TEXT NOT NULL,
      area_m2 REAL NOT NULL,
      perimetro REAL NOT NULL,
      precio_metro_cuadrado REAL NOT NULL,
      estado TEXT NOT NULL DEFAULT 'libre',
      ubicacion TEXT NOT NULL,
      medidas_lados TEXT NOT NULL,
      PRIMARY KEY (id_terreno, proyecto_id),
      FOREIGN KEY (proyecto_id) REFERENCES proyectos(id)
    );
  `);
}

function seedIfEmpty() {
  const count = db!.prepare('SELECT COUNT(*) as c FROM proyectos').get() as { c: number };
  if (count.c > 0) return;

  const insertProyecto = db!.prepare(
    'INSERT INTO proyectos (id, nombre, archivo_kmz_url, coordenadas_centro) VALUES (?, ?, ?, ?)'
  );
  const insertTerreno = db!.prepare(
    'INSERT INTO terrenos (id_terreno, proyecto_id, area_m2, perimetro, precio_metro_cuadrado, estado, ubicacion, medidas_lados) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const tx = db!.transaction(() => {
    for (const p of MOCK_PROYECTOS) {
      insertProyecto.run(p.id, p.nombre, p.archivo_kmz_url, JSON.stringify(p.coordenadas_centro));
      for (const t of p.terrenos) {
        insertTerreno.run(
          t.id_terreno,
          t.proyecto_id,
          t.area_m2,
          t.perimetro,
          t.precio_metro_cuadrado,
          t.estado,
          JSON.stringify(t.ubicacion),
          JSON.stringify(t.medidas_lados)
        );
      }
    }
  });
  tx();
}

export function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(DB_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initSchema();
    seedIfEmpty();
  }
  return db;
}

export function getTerrenosByProyecto(proyectoId: string) {
  const rows = getDb()
    .prepare('SELECT * FROM terrenos WHERE proyecto_id = ?')
    .all(proyectoId) as any[];

  return rows.map((r) => ({
    id_terreno: r.id_terreno,
    proyecto_id: r.proyecto_id,
    area_m2: r.area_m2,
    perimetro: r.perimetro,
    precio_metro_cuadrado: r.precio_metro_cuadrado,
    estado: r.estado,
    ubicacion: JSON.parse(r.ubicacion),
    medidas_lados: JSON.parse(r.medidas_lados),
  }));
}

export function getProyectos() {
  const rows = getDb()
    .prepare('SELECT * FROM proyectos')
    .all() as any[];

  return rows.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    archivo_kmz_url: r.archivo_kmz_url,
    coordenadas_centro: JSON.parse(r.coordenadas_centro),
    terrenos: getTerrenosByProyecto(r.id),
  }));
}

export function updateTerrenoEstado(id_terreno: string, proyecto_id: string, estado: string) {
  getDb()
    .prepare('UPDATE terrenos SET estado = ? WHERE id_terreno = ? AND proyecto_id = ?')
    .run(estado, id_terreno, proyecto_id);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}
