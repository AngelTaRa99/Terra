'use client';

import { Proyecto, TerrenoEstado } from '@/types';
import { useRef, useState, useCallback } from 'react';
import { useTenant } from '@/lib/TenantProvider';

interface MapContainerProps {
  project: Proyecto | null;
  onTerrenoClick: (id: string) => void;
  selectedTerrenoId: string | null;
}

const ESTADO_STYLE: Record<TerrenoEstado, { fill: string; stroke: string }> = {
  libre: { fill: 'rgba(34, 197, 94, 0.3)', stroke: '#16a34a' },
  en_visita: { fill: 'rgba(234, 179, 8, 0.3)', stroke: '#ca8a04' },
  apartado: { fill: 'rgba(251, 146, 60, 0.3)', stroke: '#ea580c' },
  vendido: { fill: 'rgba(34, 197, 94, 0.3)', stroke: '#16a34a' },
};

const SVG_W = 800;
const SVG_H = 600;

function centerOf(coords: { lat: number; lng: number }[]) {
  const latSum = coords.reduce((s, c) => s + c.lat, 0);
  const lngSum = coords.reduce((s, c) => s + c.lng, 0);
  return { lat: latSum / coords.length, lng: lngSum / coords.length };
}

function toPixel(
  lat: number,
  lng: number,
  center: { lat: number; lng: number },
  scale: number
) {
  return {
    x: (lng - center.lng) * scale + SVG_W / 2,
    y: (center.lat - lat) * scale + SVG_H / 2,
  };
}

export function MapContainer({ project, onTerrenoClick, selectedTerrenoId }: MapContainerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number; moved: boolean } | null>(null);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const { tenant } = useTenant();

  if (!project || project.terrenos.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: 'var(--color-map-bg)' }}>
        <p className="text-gray-400">Selecciona un proyecto para visualizar el mapa</p>
      </div>
    );
  }

  const { terrenos, coordenadas_centro: center } = project;

  const allLats = terrenos.flatMap((t) => t.ubicacion.map((c) => c.lat));
  const allLngs = terrenos.flatMap((t) => t.ubicacion.map((c) => c.lng));
  const latSpan = Math.max(...allLats) - Math.min(...allLats) || 0.001;
  const lngSpan = Math.max(...allLngs) - Math.min(...allLngs) || 0.001;
  const baseScale = Math.min(SVG_W * 0.8 / lngSpan, SVG_H * 0.8 / latSpan);

  const getSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * SVG_W,
      y: ((clientY - rect.top) / rect.height) * SVG_H,
    };
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const pt = getSvgPoint(e.clientX, e.clientY);
    dragRef.current = { startX: pt.x, startY: pt.y, panX: pan.x, panY: pan.y, moved: false };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const pt = getSvgPoint(e.clientX, e.clientY);
    const dx = pt.x - d.startX;
    const dy = pt.y - d.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;
    if (d.moved) {
      setPan({ x: d.panX + dx, y: d.panY + dy });
    }
  };

  const handleMouseUp = () => {
    const d = dragRef.current;
    if (d && !d.moved) return;
    dragRef.current = null;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    const d = dragRef.current;
    if (d && d.moved) e.stopPropagation();
    dragRef.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const pt = getSvgPoint(e.clientX, e.clientY);
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => {
      const next = Math.min(20, Math.max(0.1, prev * factor));
      const wx = (pt.x - pan.x) / prev;
      const wy = (pt.y - pan.y) / prev;
      setPan((p) => ({
        x: pt.x - wx * next,
        y: pt.y - wy * next,
      }));
      return next;
    });
  };

  const getTouchDist = (touches: React.TouchList) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchMid = (touches: React.TouchList) => {
    if (touches.length < 2) return getSvgPoint(touches[0].clientX, touches[0].clientY);
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const pt = getSvgPoint(e.touches[0].clientX, e.touches[0].clientY);
      dragRef.current = { startX: pt.x, startY: pt.y, panX: pan.x, panY: pan.y, moved: false };
    } else if (e.touches.length === 2) {
      dragRef.current = null;
      pinchRef.current = { dist: getTouchDist(e.touches), zoom: zoom };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1 && dragRef.current) {
      const pt = getSvgPoint(e.touches[0].clientX, e.touches[0].clientY);
      const d = dragRef.current;
      const dx = pt.x - d.startX;
      const dy = pt.y - d.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true;
      if (d.moved) setPan({ x: d.panX + dx, y: d.panY + dy });
    } else if (e.touches.length === 2 && pinchRef.current) {
      const mid = getTouchMid(e.touches);
      const dist = getTouchDist(e.touches);
      const factor = dist / pinchRef.current.dist;
      const base = pinchRef.current.zoom;
      setZoom(() => {
        const next = Math.min(20, Math.max(0.1, base * factor));
        const svgMid = getSvgPoint(mid.x, mid.y);
        const wx = (svgMid.x - pan.x) / base;
        const wy = (svgMid.y - pan.y) / base;
        setPan((p) => ({
          x: svgMid.x - wx * next,
          y: svgMid.y - wy * next,
        }));
        return next;
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      const d = dragRef.current;
      if (d && !d.moved) {
        const el = document.elementFromPoint(
          e.changedTouches[0].clientX,
          e.changedTouches[0].clientY
        );
        const terrenoId = el?.closest('[data-terreno-id]')?.getAttribute('data-terreno-id');
        if (terrenoId) onTerrenoClick(terrenoId);
      }
      dragRef.current = null;
      pinchRef.current = null;
    }
  };

  return (
    <div className="h-full w-full" style={{ backgroundColor: 'var(--color-map-bg)', touchAction: 'none' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="h-full w-full select-none"
        preserveAspectRatio="xMidYMid meet"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClickCapture={handleClickCapture}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {terrenos.map((t) => {
            const pts = t.ubicacion
              .map((c) => toPixel(c.lat, c.lng, center, baseScale))
              .map((p) => `${p.x},${p.y}`)
              .join(' ');
            const centerPt = centerOf(t.ubicacion);
            const pixelCenter = toPixel(centerPt.lat, centerPt.lng, center, baseScale);
            const style = ESTADO_STYLE[t.estado];
            const isSelected = t.id_terreno === selectedTerrenoId;

            return (
              <g
                key={t.id_terreno}
                data-terreno-id={t.id_terreno}
                onClick={() => onTerrenoClick(t.id_terreno)}
                className="cursor-pointer"
              >
                <polygon
                  points={pts}
                  fill={style.fill}
                  stroke={isSelected ? '#059669' : style.stroke}
                  strokeWidth={isSelected ? 3 / zoom : 2 / zoom}
                  className="transition-all hover:opacity-80"
                />
                {(t.estado === 'vendido' || t.estado === 'apartado') && (
                  <circle
                    cx={pixelCenter.x}
                    cy={pixelCenter.y}
                    r={6 / zoom}
                    fill={t.estado === 'vendido' ? '#16a34a' : '#ea580c'}
                    stroke="#fff"
                    strokeWidth={2 / zoom}
                  />
                )}
                <text
                  x={pixelCenter.x}
                  y={pixelCenter.y - 12 / zoom}
                  textAnchor="middle"
                  className="pointer-events-none fill-gray-600"
                  style={{ fontSize: `${10 / zoom}px`, fontWeight: 500 }}
                >
                  {t.id_terreno}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
