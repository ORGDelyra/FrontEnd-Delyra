import { Component, OnInit, AfterViewInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';

@Component({
  selector: 'app-selector-ubicacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-ubicacion.html',
  styleUrl: './selector-ubicacion.css'
})
export class SelectorUbicacion implements OnInit, AfterViewInit, OnDestroy {
  @Input() direccionInicial: string = '';
  @Output() ubicacionSeleccionada = new EventEmitter<{
    direccion: string;
    latitud: string;
    longitud: string;
  }>();

  map!: L.Map;
  marker?: L.Marker;
  direccion: string = '';
  latitud: string = '';
  longitud: string = '';
  buscando: boolean = false;
  resultadosBusqueda: any[] = [];
  mostrarResultados: boolean = false;
  ubicacionObtenida: boolean = false;
  coordenadasCentro: [number, number] = [3.217, -76.497]; // Quilichao, Colombia
  mensaje: string = '';

  ngOnInit() {
    this.direccion = this.direccionInicial;
  }

  ngAfterViewInit() {
    this.inicializarMapa();
  }

  inicializarMapa() {
    // Cargar CSS de Leaflet si no está
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Inicializar mapa
    this.map = L.map('mapa-selector', {
      center: this.coordenadasCentro,
      zoom: 13,
      minZoom: 10,
      maxZoom: 18
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);



    // Forzar estilos en el contenedor del mapa después de que Leaflet lo cree
    setTimeout(() => {
      const mapContainer = document.getElementById('mapa-selector') as HTMLElement;
      if (mapContainer) {
        mapContainer.style.position = 'relative';
        mapContainer.style.zIndex = '0';
        mapContainer.style.isolation = 'isolate';
        mapContainer.style.contain = 'layout style';

        // Forzar position absolute en todos los panes de Leaflet
        const panes = mapContainer.querySelectorAll('[class*="leaflet-pane"]');
        panes.forEach((pane: Element) => {
          (pane as HTMLElement).style.position = 'absolute';
          (pane as HTMLElement).style.zIndex = '1';
        });

        // Forzar position absolute en controles
        const controls = mapContainer.querySelectorAll('.leaflet-control-container');
        controls.forEach((control: Element) => {
          (control as HTMLElement).style.position = 'absolute';
          (control as HTMLElement).style.zIndex = '2';
        });
      }
    }, 100);

    // Click en el mapa para colocar marcador
    this.map.on('click', (e: any) => {
      this.colocarMarcador(e.latlng.lat, e.latlng.lng);
      this.obtenerDireccionDesdeCoord(e.latlng.lat, e.latlng.lng);
    });

    // Botón de geolocalización
    this.agregarBotonGeolocalizacion();
  }

  agregarBotonGeolocalizacion() {
    const locateControl: any = (L as any).control({ position: 'topright' });
    locateControl.onAdd = () => {
      const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
      div.style.cursor = 'pointer';
      div.style.padding = '5px';
      div.title = 'Usar mi ubicación actual';
      div.innerHTML = '📍';
      div.onclick = () => {
        this.usarMiUbicacion();
      };
      return div;
    };
    locateControl.addTo(this.map);
  }

  usarMiUbicacion() {
    if (navigator.geolocation) {
      this.buscando = true;
      this.mensaje = 'Obteniendo tu ubicación...';
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          this.colocarMarcador(latitude, longitude);
          this.map.setView([latitude, longitude], 16);
          this.latitud = latitude.toString();
          this.longitud = longitude.toString();
          this.obtenerDireccionDesdeCoord(latitude, longitude);
          this.buscando = false;
        },
        (error) => {
          this.mensaje = 'No se pudo obtener tu ubicación. Puedes buscar tu dirección manualmente.';
          this.buscando = false;
          console.warn('Error de geolocalización:', error);
        }
      );
    }
  }

  async buscarDireccion(texto: string) {
    if (!texto || texto.length < 3) {
      this.resultadosBusqueda = [];
      this.mostrarResultados = false;
      return;
    }

    this.buscando = true;
    this.mensaje = 'Buscando dirección...';

    try {
      // Usar Nominatim (OpenStreetMap) para geocoding
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(texto)}&countrycodes=co&limit=5`;

      const response = await fetch(url);
      const resultados = await response.json();

      this.resultadosBusqueda = resultados;
      this.mostrarResultados = resultados.length > 0;
      this.buscando = false;
      this.mensaje = '';
    } catch (error) {
      this.mensaje = 'Error al buscar la dirección. Intenta de nuevo.';
      this.buscando = false;
      console.error('Error en búsqueda:', error);
    }
  }

  seleccionarResultado(resultado: any) {
    const lat = parseFloat(resultado.lat);
    const lng = parseFloat(resultado.lon);

    this.direccion = resultado.display_name;
    this.latitud = lat.toString();
    this.longitud = lng.toString();

    this.colocarMarcador(lat, lng);
    this.map.setView([lat, lng], 16);
    this.mostrarResultados = false;
    this.ubicacionObtenida = true;
  }

  colocarMarcador(lat: number, lng: number) {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng], {
        draggable: true
      }).addTo(this.map);

      // Actualizar coordenadas cuando se arrastra el marcador
      this.marker.on('dragend', (e: any) => {
        const pos = e.target.getLatLng();
        this.latitud = pos.lat.toString();
        this.longitud = pos.lng.toString();
        this.obtenerDireccionDesdeCoord(pos.lat, pos.lng);
      });
    }

    this.latitud = lat.toString();
    this.longitud = lng.toString();
    this.ubicacionObtenida = true;
  }

  async obtenerDireccionDesdeCoord(lat: number, lng: number) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const response = await fetch(url);
      const resultado = await response.json();

      if (resultado.address) {
        // Construir dirección legible
        const partes = [
          resultado.address.road,
          resultado.address.house_number,
          resultado.address.village || resultado.address.town || resultado.address.city,
          resultado.address.state
        ].filter(Boolean);

        this.direccion = partes.join(', ');
      }
    } catch (error) {
      console.error('Error al obtener dirección:', error);
    }
  }

  confirmarUbicacion() {
    if (!this.direccion || !this.latitud || !this.longitud) {
      this.mensaje = 'Por favor completa todos los campos';
      return;
    }

    this.ubicacionSeleccionada.emit({
      direccion: this.direccion,
      latitud: this.latitud,
      longitud: this.longitud
    });

    this.mensaje = '✅ Ubicación confirmada';
  }

  limpiar() {
    this.direccion = '';
    this.latitud = '';
    this.longitud = '';
    this.resultadosBusqueda = [];
    this.mostrarResultados = false;
    this.ubicacionObtenida = false;
    this.mensaje = '';

    if (this.marker) {
      this.map.removeLayer(this.marker);
      this.marker = undefined;
    }

    this.map.setView(this.coordenadasCentro, 13);
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
  }
}
