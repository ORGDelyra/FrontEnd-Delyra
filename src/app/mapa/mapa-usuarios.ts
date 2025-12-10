import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendedorService } from '../services/vendedor.service';
import { Branch } from '../interfaces/branch.interface';
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mapa-usuarios.html',
  styleUrl: './mapa-usuarios.css'
})
export class MapaUsuarios implements OnInit, AfterViewInit, OnDestroy {
  map!: L.Map;
  markersLayer!: L.LayerGroup;
  branches: Branch[] = [];
  filteredBranches: Branch[] = [];
  query: string = '';
  loading: boolean = false;
  mensaje: string = '';
  boundsEnabled: boolean = true;

  // Coordenadas de Santander de Quilichao, Cauca, Colombia
  SQ_CENTER: [number, number] = [3.0133, -76.4842]; // Centro del municipio
  SQ_BOUNDS = L.latLngBounds(
    [2.95, -76.58],  // Suroeste
    [3.08, -76.38]   // Noreste
  );

  constructor(private vendedorService: VendedorService) {}

  ngOnInit(): void {
    this.loading = true;
    this.vendedorService.obtenerSucursales().subscribe({
      next: (data) => {
        this.branches = data || [];
        this.filteredBranches = [...this.branches];
        this.loading = false;
        // si el mapa ya está cargado, renderizar marcadores
        if (this.map) this.renderMarkers();
      },
      error: (err) => {
        console.error('Error cargando sucursales', err);
        this.mensaje = 'No se pudieron cargar las sucursales';
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    // asegurar CSS de Leaflet (si no está global)
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Usar setTimeout para asegurar que el contenedor tenga dimensiones
    setTimeout(() => {
      const container = document.getElementById('mapa-usuarios-container');
      if (!container) {
        console.error('Contenedor del mapa no encontrado');
        return;
      }

      // Verificar que el contenedor tenga dimensiones
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        console.warn('Contenedor del mapa sin dimensiones, reintentando...');
        setTimeout(() => this.initMap(), 500);
        return;
      }

      this.initMap();
    }, 100);
  }

  private initMap(): void {
    try {
      // Inicializar mapa centrado en Santander de Quilichao
      this.map = L.map('mapa-usuarios-container', {
        center: this.SQ_CENTER,
        zoom: 13,
        minZoom: 11,
        maxZoom: 18,
        maxBounds: this.SQ_BOUNDS,
        maxBoundsViscosity: 1.0
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.markersLayer = L.layerGroup().addTo(this.map);

      // Forzar recalcular tamaño del mapa
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
          if (this.branches.length) this.renderMarkers();
        }
      }, 200);
    } catch (error) {
      console.error('Error inicializando mapa:', error);
    }
  }

  fitToQuilichao() {
    if (!this.map) return;
    this.map.fitBounds(this.SQ_BOUNDS.pad(0.1));
  }

  toggleBounds() {
    if (!this.map) return;
    this.boundsEnabled = !this.boundsEnabled;
    // remove or set bounds
    if (this.boundsEnabled) {
      (this.map as any).setMaxBounds(this.SQ_BOUNDS);
    } else {
      try { (this.map as any).setMaxBounds(null); } catch(e) { (this.map as any).options.maxBounds = undefined; }
    }
  }

  renderMarkers() {
    if (!this.map || !this.markersLayer) return;

    try {
      // Asegurar que el contenedor tenga tamaño antes de pintar
      this.map.invalidateSize({ pan: false });
      this.markersLayer.clearLayers();

      for (const b of this.filteredBranches) {
        const lat = b.latitud ? parseFloat(b.latitud) : NaN;
        const lng = b.longitud ? parseFloat(b.longitud) : NaN;

        // Validar coordenadas
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(`Sucursal "${b.nombre_sucursal}" sin coordenadas válidas`);
          continue;
        }

        // Crear icono personalizado
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: '<div style="background-color:#7dff7a;width:28px;height:28px;border-radius:50%;border:3px solid #04060f;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="font-size:16px;">📍</span></div>',
          iconSize: [28, 28],
          iconAnchor: [14, 28]
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        // Crear popup con diseño mejorado
        const logoHtml = b.logo_comercio
          ? `<div style="margin-bottom:8px;text-align:center;"><img src="${b.logo_comercio}" alt="logo" style="width:100px;height:60px;object-fit:cover;border-radius:8px;border:2px solid #7dff7a;"/></div>`
          : '';

        const popupContent = `
          <div style="min-width:180px;font-family:system-ui,-apple-system,sans-serif;">
            ${logoHtml}
            <div style="font-size:16px;font-weight:bold;color:#04060f;margin-bottom:6px;">${b.nombre_sucursal}</div>
            <div style="font-size:13px;color:#555;margin-bottom:4px;">📍 ${b.direccion || 'Dirección no disponible'}</div>
            <div style="font-size:12px;color:#666;border-top:1px solid #eee;padding-top:6px;margin-top:6px;">
              <div>NIT: ${b.nit || 'N/A'}</div>
            </div>
            <div style="margin-top:10px;text-align:center;">
              <a href="/tienda/${b.id}" style="display:inline-block;padding:8px 16px;background:#007bff;color:white;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;">
                🏪 Ver Tienda
              </a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });

        marker.addTo(this.markersLayer);
      }

      // Ajustar vista si hay marcadores
      const allMarkers = this.markersLayer.getLayers();
      if (allMarkers.length > 0) {
        const group = L.featureGroup(allMarkers as L.Marker[]);
        this.map.fitBounds(group.getBounds().pad(0.15));
      } else {
        // Si no hay marcadores, centrar en Quilichao
        this.map.setView(this.SQ_CENTER, 13);
      }
    } catch (error) {
      console.error('Error renderizando marcadores:', error);
    }
  }

  onQueryChange() {
    const q = this.query.trim().toLowerCase();
    if (!q) {
      this.filteredBranches = [...this.branches];
    } else {
      this.filteredBranches = this.branches.filter(b => b.nombre_sucursal.toLowerCase().includes(q));
    }
    this.renderMarkers();
  }

  selectBranch(b: Branch) {
    const lat = b.latitud ? parseFloat(b.latitud) : NaN;
    const lng = b.longitud ? parseFloat(b.longitud) : NaN;
    if (isNaN(lat) || isNaN(lng)) {
      this.mensaje = 'Esta sucursal no tiene ubicación registrada';
      setTimeout(() => this.mensaje='', 3000);
      return;
    }

    // Centrar el mapa en la ubicación con zoom
    this.map.setView([lat, lng], 17, { animate: true, duration: 0.5 });

    // Buscar y abrir el popup del marcador correspondiente
    setTimeout(() => {
      this.markersLayer.eachLayer((layer: any) => {
        if (layer.getLatLng) {
          const markerLatLng = layer.getLatLng();
          // Comparar con tolerancia más amplia por precisión decimal
          if (Math.abs(markerLatLng.lat - lat) < 0.0001 && Math.abs(markerLatLng.lng - lng) < 0.0001) {
            layer.openPopup();
          }
        }
      });
    }, 600); // Esperar que termine la animación del mapa
  }

  showAll() {
    this.query = '';
    this.filteredBranches = [...this.branches];
    this.renderMarkers();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
  }
}
