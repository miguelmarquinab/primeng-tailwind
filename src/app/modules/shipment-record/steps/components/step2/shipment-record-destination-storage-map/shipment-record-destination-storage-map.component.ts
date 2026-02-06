import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import * as L from 'leaflet';
import { DestinationEntityResponse } from '@shipment-record/models/destination.model';

@Component({
    selector: 'app-shipment-record-destination-storage-map',
    imports: [],
    templateUrl: './shipment-record-destination-storage-map.component.html',
    styleUrl: './shipment-record-destination-storage-map.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ShipmentRecordDestinationStorageMapComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
    @Input() destinationStore!: DestinationEntityResponse;
    @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;
    olvaIcon!: any;
    private map: L.Map | null = null;
    private marker: L.Marker | null = null;
    private pendingDestination: DestinationEntityResponse | null = null;
    private initScheduled = false;

    ngOnInit(): void {
        this.olvaIcon = L.icon({
            iconUrl: '/shared/images/PIN_OLVA.svg',
            iconSize: [38, 95],
            shadowSize: [50, 64],
            iconAnchor: [22, 94],
            shadowAnchor: [4, 62],
            popupAnchor: [-3, -76]
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('Changes detected in ShipmentRecordDestinationStorageMapComponent:', changes);

        if (changes['destinationStore'] && this.destinationStore) {
            if (!this.map) {
                this.pendingDestination = this.destinationStore;
                this.ensureMapInitialized();
                return;
            }
            this.updateMarker(this.destinationStore);
        }
    }

    ngAfterViewInit(): void {
        this.ensureMapInitialized();
    }

    ngOnDestroy(): void {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }

    private initMap(): void {
        if (this.map) {
            return;
        }

        L.Marker.prototype.options.icon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        });

        const mapContainer = this.mapContainer?.nativeElement;
        if (!mapContainer) {
            console.error('Map container not found! Make sure map container exists in the DOM.');
            return;
        }

        this.map = L.map(mapContainer, {
            zoomControl: false
        }).setView([-12.04318, -77.02824], 20);

        L.control
            .zoom({
                position: 'bottomright'
            })
            .addTo(this.map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);
    }

    private updateMarker(destination: DestinationEntityResponse): void {
        if (!this.map || typeof this.map.setView !== 'function') {
            return;
        }
        const latitude = Number.parseFloat(destination.latitude || '0');
        const longitude = Number.parseFloat(destination.longitude || '0');
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            return;
        }
        const currentLocation: [number, number] = [latitude, longitude];
        this.map.setView(currentLocation, 20);
        if (this.marker) {
            this.map.removeLayer(this.marker);
            this.marker = null;
        }
        this.marker = L.marker(currentLocation, {
            icon: this.olvaIcon
        })
            .addTo(this.map)
            .bindPopup(`<b>${destination.headquarter_name ?? ''}</b>`);
    }

    private applyPendingDestination(): void {
        if (this.pendingDestination && this.map) {
            this.updateMarker(this.pendingDestination);
            this.pendingDestination = null;
        }
    }

    private ensureMapInitialized(): void {
        if (this.map || this.initScheduled) {
            return;
        }
        this.initScheduled = true;
        setTimeout(() => {
            this.initScheduled = false;
            this.initMap();
            this.applyPendingDestination();
            this.map?.invalidateSize();
        });
    }
}
