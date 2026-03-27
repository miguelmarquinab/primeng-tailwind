export const environment = {
    production: false,
    environment: 'localhost',
    shippingRecords: {
        // api: 'http://localhost:8000',
        api: 'https://registrodeenvios-dev.olvaexpress.pe',
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
                scriptCheckout: 'https://static-content-qas.vnforapps.com/v2/js/checkout.js?qa=true'
            }
        },
        assets: {
            olvaLogo: 'https://res.cloudinary.com/marmotahosting/image/upload/v1772646298/olva_logo_mp_ituzls.png'
        },
        callback: 'http://localhost:4700/shipment-record/finish',
        callbackError: 'http://localhost:4700/shipment-record/step/3'
    }
};
