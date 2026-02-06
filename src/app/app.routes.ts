import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '@layouts/public-layout/components/public-layout/public-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        loadChildren: () => import('./modules/home/home.routes').then((m) => m.default)
    },
    {
        path: 'shipment-record',
        component: PublicLayoutComponent,
        loadChildren: () => import('./modules/shipment-record/shipment-record.routes').then((m) => m.default)
    }
];
