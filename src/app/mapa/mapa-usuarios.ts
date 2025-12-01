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
  SQ_CENTER: [number, number] = [3.217, -76.497];
  SQ_BOUNDS = L.latLngBounds([3.10, -76.62], [3.34, -76.37]);

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

    // Centrar y restringir mapa a Santander de Quilichao (Cauca) - coordenadas aproximadas
    const SQ_CENTER: [number, number] = [3.217, -76.497];
    const SQ_BOUNDS = L.latLngBounds([3.10, -76.62], [3.34, -76.37]);
    this.map = L.map('mapa-usuarios-container', {
      center: this.SQ_CENTER,
      zoom: 13,
      minZoom: 12,
      maxZoom: 18,
      maxBounds: this.SQ_BOUNDS,
      maxBoundsViscosity: 0.8
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer = L.layerGroup().addTo(this.map);

    if (this.branches.length) this.renderMarkers();
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
    this.markersLayer.clearLayers();
    for (const b of this.filteredBranches) {
      const lat = b.latitud ? parseFloat(b.latitud) : NaN;
      const lng = b.longitud ? parseFloat(b.longitud) : NaN;
      if (isNaN(lat) || isNaN(lng)) continue;
      // Crear popup con posible logo
      const logoHtml = b.logo_comercio ? `<div style="margin-bottom:6px"><img src="${b.logo_comercio}" alt="logo" style="width:80px;height:50px;object-fit:cover;border-radius:6px;"/></div>` : '';
      const marker = L.marker([lat, lng]);
      const popup = `${logoHtml}<strong>${b.nombre_sucursal}</strong><br>${b.direccion || ''}`;
      marker.bindPopup(popup);
      marker.addTo(this.markersLayer);
    }
    // ajustar vista si hay marcadores
    const all = this.markersLayer.getLayers();
    if (all.length) {
      const group = L.featureGroup(all as L.Marker[]);
      this.map.fitBounds(group.getBounds().pad(0.2));
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
    if (isNaN(lat) || isNaN(lng)) { this.mensaje = 'Sucursal sin ubicación'; setTimeout(() => this.mensaje='',3000); return; }
    this.map.setView([lat, lng], 16);
    // abrir popup correspondiente: buscar marker en layer
    this.markersLayer.eachLayer((layer: any) => {
      const ll = layer.getLatLng && layer.getLatLng();
      if (ll && Math.abs(ll.lat - lat) < 0.00001 && Math.abs(ll.lng - lng) < 0.00001) {
        layer.openPopup();
      }
    });
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
