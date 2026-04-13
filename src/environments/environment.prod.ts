export const environment = {
    production: false,
    environment: 'prod',
    shippingRecords: {
        api: 'https://service-registro-envios.olvacourier.com',
        public: {
            config: {
                grant_type: 'client_credentials',
                client_id: 'app_web_id',
                client_secret: '123456'
            }
        }
    },
    paymentGateway: {
        niubiz: {
            assets: {
                // scriptCheckout: 'https://static-content.vnforapps.com/v2/js/checkout.js',
                scriptCheckout: 'https://static-content-qas.vnforapps.com/v2/js/checkout.js?qa=true'
            }
        },
        assets: {
            olvaLogo: 'https://res.cloudinary.com/marmotahosting/image/upload/v1772646298/olva_logo_mp_ituzls.png'
        },
        callback: 'https://web-registro-envios.olvacourier.com/shipment-record/finish',
        callbackError: 'https://web-registro-envios.olvacourier.com/shipment-record/step/3'
    }
};
