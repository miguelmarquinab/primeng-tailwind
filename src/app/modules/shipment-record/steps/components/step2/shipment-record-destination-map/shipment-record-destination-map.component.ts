import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import * as L from 'leaflet';
import { SearchAddressEntityResponse } from '@/modules/geo/models/search-address.model';

@Component({
    selector: 'app-shipment-record-destination-map',
    imports: [],
    templateUrl: './shipment-record-destination-map.component.html',
    styleUrl: './shipment-record-destination-map.component.scss'
})
export class ShipmentRecordDestinationMapComponent implements AfterViewInit, OnChanges, OnDestroy, OnInit {
    @Input() currentSearchAddress!: SearchAddressEntityResponse | null;
    @Input() showMarker: boolean = true;
    @ViewChild('mapContainer') mapContainer?: ElementRef<HTMLDivElement>;

    olvaIcon!: any;
    private map: L.Map | null = null;
    private marker: L.Marker | null = null;
    private pendingCoordinates: [number, number] | null = null;
    ngOnInit(): void {
        this.olvaIcon = L.icon({
            iconUrl: '/shared/images/PIN_HOUSE.svg',
            iconSize: [45, 55],
            shadowSize: [50, 64],
            iconAnchor: [22, 94],
            shadowAnchor: [4, 62],
            popupAnchor: [-3, -76]
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.initMap();
            this.applyPendingCoordinates();
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['showMarker'] && !this.showMarker) {
            this.removeMarker();
            return;
        }

        if (changes['currentSearchAddress'] && this.currentSearchAddress && this.map) {
            const coordinates = this.currentSearchAddress.coordinates;
            if (!coordinates) {
                console.warn('No coordinates available for the current search address.');
                return;
            }
            this.removeMarker();
            const point: [number, number] = [coordinates.latitude ?? 0, coordinates.longitude ?? 0];
            this.setMarker(point);
        }
        if (changes['currentSearchAddress'] && this.currentSearchAddress && !this.map) {
            const coordinates = this.currentSearchAddress.coordinates;
            if (!coordinates) {
                console.warn('No coordinates available for the current search address.');
                return;
            }
            this.pendingCoordinates = [coordinates.latitude ?? 0, coordinates.longitude ?? 0];
        }
    }

    ngOnDestroy(): void {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
    }

    private removeMarker(): void {
        if (this.marker && this.map) {
            this.map.removeLayer(this.marker);
            this.marker = null;
        }
    }

    // Initialize the map
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
        const limaLocation:[number,number] = [-12.04318, -77.02824];

        this.map = L.map(mapContainer, {
            zoomControl: false
        }).setView(limaLocation, 20);

        L.control
            .zoom({
                position: 'bottomright'
            })
            .addTo(this.map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(this.map);
    }

    private setMarker(point: [number, number]): void {
        if (!this.map) {
            return;
        }
        this.removeMarker();
        this.map.setView(point, 15);
        this.marker = L.marker(point, {
            icon: this.olvaIcon
        })
            .addTo(this.map)
            .bindPopup(`<b>${this.currentSearchAddress?.address ?? ''}</b>`)
            .openPopup();
    }

    private applyPendingCoordinates(): void {
        if (this.pendingCoordinates && this.map) {
            this.setMarker(this.pendingCoordinates);
            this.pendingCoordinates = null;
        }
    }
}
