import { ShipmentRecordLayoutComponent } from '@shipment-record/layout/components/shipment-record-layout/shipment-record-layout.component';

export default [
    {
        path: 'step',
        redirectTo: 'step/1'
    },
    {
        path: 'step/:stepNumber',
        component: ShipmentRecordLayoutComponent
    }
];
