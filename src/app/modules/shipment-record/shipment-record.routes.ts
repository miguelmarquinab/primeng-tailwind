import { ShipmentRecordLayoutComponent } from '@shipment-record/layout/components/shipment-record-layout/shipment-record-layout.component';
import { ShippingFinishComponent } from './layout/components/shipping-finish/shipping-finishcomponent';

export default [
    {
        path: 'step',
        redirectTo: 'step/1'
    },
    {
        path: 'step/:stepNumber',
        component: ShipmentRecordLayoutComponent
    },
    {
        path: 'finish',
        component: ShippingFinishComponent
    }
];
