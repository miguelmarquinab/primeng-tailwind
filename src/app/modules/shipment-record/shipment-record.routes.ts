import { ShipmentRecordLayoutComponent } from '@shipment-record/layout/components/shipment-record-layout/shipment-record-layout.component';
import { ShippingFinishComponent } from '@shipment-record/steps/components/finish/shipping-finish/shipping-finish.component';
import { ShippingFinishErrorComponent } from '@shipment-record/steps/components/finish/shipping-finish-error/shipping-finish-error.component';

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
        path: 'step/:stepNumber/item/:itemUuid',
        component: ShipmentRecordLayoutComponent
    },
    {
        path: 'finish',
        component: ShippingFinishComponent
    },
    {
        path: 'finish-error',
        component: ShippingFinishErrorComponent
    }
];
