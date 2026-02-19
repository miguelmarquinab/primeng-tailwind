import { Component } from '@angular/core';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-shipping-finish',
    imports: [Button],
    templateUrl: './shipping-finish.component.html',
    styleUrl: './shipping-finish.component.scss'
})
export class ShippingFinishComponent {
    registrationData = {
        registrationNumber: '20240818705',
        dateTime: '24/09/25 - 12:49:24',
        card: '4474****2240 (Visa)',
        amountPaid: 'S/ 15.56'
    };

    onViewStores() {
        console.log('Ver tiendas o agentes');
    }

    onRegisterNewShipment() {
        console.log('Registrar nuevo envío');
    }

    onDownloadLabel() {
        console.log('Descargar rótulo');
    }
}
