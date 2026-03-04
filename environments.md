# Documentación de Archivos `environment` (Angular)

En Angular, los archivos de entorno (`environment.*.ts`) permiten definir variables y configuraciones específicas para cada ambiente (desarrollo, producción, QA, etc). Esto facilita la gestión de endpoints, llaves, y parámetros que pueden variar según el entorno donde se despliegue la aplicación.

## Archivos de entorno disponibles

- `environment.ts`: Configuración por defecto (usualmente desarrollo local).
- `environment.dev.ts`: Configuración para el entorno de desarrollo.
- `environment.prod.ts`: Configuración para el entorno de producción.
- `environment.qa.ts`: Configuración para el entorno de QA (Quality Assurance).

## Ejemplo de estructura (`environment.dev.ts`)

```typescript
export const environment = {
    production: false, // Indica si es entorno productivo
    environment: 'development', // Nombre del entorno
    shippingRecords: {
        api: 'https://registrodeenvios-dev.olvaexpress.pe', // Endpoint API para registros de envío
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
                script: 'https://static-content-qas.vnforapps.com/v2/js/checkout.js?qa=true'
            }
        }
    }
};
```

## Descripción de propiedades comunes

- **production**: `boolean` — Indica si la build es para producción.
- **environment**: `string` — Nombre del entorno.
- **shippingRecords.api**: `string` — URL base de la API de registros de envío.
- **shippingRecords.public.config**: Configuración de autenticación para la API pública.
    - `grant_type`, `client_id`, `client_secret`: Parámetros de autenticación OAuth2.
- **paymentGateway.niubiz.assets.script**: URL del script de integración con la pasarela de pagos Niubiz.

## Uso en la aplicación

Angular selecciona automáticamente el archivo de entorno adecuado según el comando de build:

- `ng build` (por defecto): usa `environment.ts`.
- `ng build --configuration=production`: usa `environment.prod.ts`.
- `ng build --configuration=dev`: usa `environment.dev.ts`.
- `ng build --configuration=qa`: usa `environment.qa.ts`.

## Buenas prácticas

- No almacenar credenciales reales en archivos de entorno, especialmente en repositorios públicos.
- Mantener consistencia en las claves y estructura entre los diferentes archivos de entorno.
- Documentar cada propiedad relevante para facilitar el mantenimiento.

---

> **Nota:** Los archivos de entorno permiten cambiar endpoints y configuraciones sin modificar el código fuente principal, facilitando despliegues en diferentes ambientes.

