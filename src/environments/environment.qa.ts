export const environment = {
    production: false,
    environment: 'qa',
    shippingRecords: {
        api: 'https://registrodeenvios-dev.olvaexpress.pe/',
        public: {
            config: {
                grant_type: 'client_credentials',
                client_id: 'app_web_id',
                client_secret: '123456'
            }
        }
    }
};
