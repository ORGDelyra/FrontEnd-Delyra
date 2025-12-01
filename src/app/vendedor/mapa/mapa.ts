import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VendedorService } from '../../services/vendedor.service';
import { Branch } from '../../interfaces/branch.interface';

// Nota: requiere instalar `leaflet` y `@types/leaflet`
import * as L from 'leaflet';

@Component({
  selector: 'app-mapa-vendedor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class MapaVendedor implements OnInit, AfterViewInit, OnDestroy {
  @Input() branchId?: number;

  map!: L.Map;
  marker?: L.Marker;
  lat: number | null = null;
  lng: number | null = null;
  cargando: boolean = false;
  mensaje: string = '';
  boundsEnabled: boolean = true;
  SQ_CENTER: [number, number] = [3.217, -76.497];
  SQ_BOUNDS = L.latLngBounds([3.10, -76.62], [3.34, -76.37]);

  constructor(private vendedorService: VendedorService) {}

  ngOnInit() {
    if (this.branchId) {
      this.cargando = true;
      this.vendedorService.obtenerSucursalPorId(this.branchId).subscribe({
        next: (s: Branch) => {
          if (s) {
            this.lat = s.latitud ? parseFloat(s.latitud) : null;
            this.lng = s.longitud ? parseFloat(s.longitud) : null;
          }
          this.cargando = false;
          // si el mapa ya está inicializado, colocar marcador
          if (this.map && this.lat !== null && this.lng !== null) {
            this.setMarker(this.lat, this.lng);
            this.map.setView([this.lat, this.lng], 15);
          }
        },
        error: () => { this.cargando = false; }
      });
    }
  }

  ngAfterViewInit() {
    // Asegurar que Leaflet CSS esté cargado (puedes también añadirlo en styles.css)
    const leafletCssId = 'leaflet-css';
    if (!document.getElementById(leafletCssId)) {
      const link = document.createElement('link');
      link.id = leafletCssId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Centrar y restringir mapa a Santander de Quilichao (Cauca) - coordenadas aproximadas
    const SQ_CENTER: [number, number] = [3.217, -76.497];
    const SQ_BOUNDS = L.latLngBounds([3.10, -76.62], [3.34, -76.37]);
    this.map = L.map('mapa-container', {
      center: SQ_CENTER,
      zoom: 13,
      minZoom: 12,
      maxZoom: 18,
      maxBounds: SQ_BOUNDS,
      maxBoundsViscosity: 0.8
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    // Si ya tenemos coordenadas cargadas desde el backend
    if (this.lat !== null && this.lng !== null) {
      this.setMarker(this.lat, this.lng);
      this.map.setView([this.lat, this.lng], 15);
    }

    // Click para colocar/recoger marcador
    this.map.on('click', (e: any) => {
      const { lat, lng } = e.latlng;
      this.lat = lat;
      this.lng = lng;
      this.setMarker(lat, lng, true);
    });

    // Botón de geolocalización simple
    // Casting a `any` porque las definiciones de leaflet en TS a veces tratan `control` como namespace
    const locateControl: any = (L.control as any)({ position: 'topright' });
    locateControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.style.cursor = 'pointer';
      div.title = 'Usar mi ubicación';
      div.innerHTML = '📍';
      div.onclick = () => {
        this.map.locate({ setView: true, maxZoom: 16 });
      };
      return div;
    };
    locateControl.addTo(this.map);

    this.map.on('locationfound', (ev: any) => {
      const { lat, lng } = ev.latlng;
      this.lat = lat; this.lng = lng;
      this.setMarker(lat, lng, true);
    });
  }

  fitToQuilichao() {
    if (!this.map) return;
    this.map.fitBounds(this.SQ_BOUNDS.pad(0.1));
  }

  toggleBounds() {
    if (!this.map) return;
    this.boundsEnabled = !this.boundsEnabled;
    if (this.boundsEnabled) {
      (this.map as any).setMaxBounds(this.SQ_BOUNDS);
    } else {
      try { (this.map as any).setMaxBounds(null); } catch(e) { (this.map as any).options.maxBounds = undefined; }
    }
  }

  setMarker(lat: number, lng: number, draggable: boolean = true) {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
      return;
    }
    this.marker = L.marker([lat, lng], { draggable }).addTo(this.map);
    if (draggable) {
      this.marker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        this.lat = pos.lat; this.lng = pos.lng;
      });
    }
  }

  async guardarUbicacion() {
    if (!this.branchId) { this.mensaje = 'No hay sucursal seleccionada.'; return; }
    if (this.lat === null || this.lng === null) { this.mensaje = 'Indica una ubicación en el mapa.'; return; }
    this.cargando = true;
    try {
      await this.vendedorService.actualizarSucursal(this.branchId, {
        latitud: String(this.lat),
        longitud: String(this.lng)
      }).toPromise();
      this.mensaje = 'Ubicación guardada correctamente.';
    } catch (err) {
      console.error(err);
      this.mensaje = 'Error al guardar la ubicación.';
    } finally {
      this.cargando = false;
      setTimeout(() => this.mensaje = '', 3000);
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
  }
}
