# 🚀 Angular CLI Cheatsheet - Registro Envíos 3.0

> **Angular v20** | **PrimeNG v20** | **TailwindCSS v4** | **pnpm**

---

## 📋 Tabla de Contenidos

- [Comandos de Inicio](#-comandos-de-inicio)
- [Generación de Componentes](#-generación-de-componentes)
- [Generación de Servicios](#-generación-de-servicios)
- [Generación de Directivas](#-generación-de-directivas)
- [Generación de Pipes](#-generación-de-pipes)
- [Generación de Guards](#-generación-de-guards)
- [Generación de Interceptors](#-generación-de-interceptors)
- [Generación de Modelos/Interfaces](#-generación-de-modelosinterfaces)
- [Generación de Validators](#-generación-de-validators)
- [Generación de Rutas](#-generación-de-rutas)
- [Path Aliases](#-path-aliases)
- [Snippets de Código](#-snippets-de-código)
- [BUENAS PRÁCTICAS](#-buenas-prácticas)
  - [Arquitectura y Estructura](#️-arquitectura-y-estructura)
  - [Componentes](#-componentes)
  - [Servicios y HTTP](#-servicios-y-http)
  - [Formularios Reactivos](#-formularios-reactivos)
  - [Seguridad](#-seguridad)
  - [Rendimiento](#-rendimiento)
  - [Testing](#-testing)
  - [Código Limpio](#-código-limpio)
  - [Convenciones de Archivos](#-convenciones-de-archivos)
  - [Internacionalización](#-internacionalización-i18n)
  - [Estilos](#-estilos)
- [Buenas Prácticas para Evitar Memory Leaks](#-buenas-prácticas-para-evitar-memory-leaks)

---

## 🚀 Comandos de Inicio

```bash
# Instalar dependencias
pnpm install

# Desarrollo
pnpm start              # Puerto 4700
pnpm start:dev          # Configuración development
pnpm start:qa           # Configuración QA
pnpm start:prod         # Configuración production

# Build
pnpm build:dev          # Build development
pnpm build:qa           # Build QA
pnpm build:prod         # Build production

# Testing & Linting
pnpm test               # Ejecutar tests
pnpm lint               # Ejecutar linter
```

---

## 🧩 Generación de Componentes

### Componente Standalone (Estándar del proyecto)

```bash
# Componente básico en módulo específico
ng g c modules/[module-name]/components/[component-name] --skip-tests

# Ejemplo: Componente en shipment-record
ng g c modules/shipment-record/steps/components/step2/my-new-component --skip-tests

# Ejemplo: Componente en shared
ng g c modules/shared/components/shipping-summary-buttons/my-button --skip-tests

# Componente con test
ng g c modules/shared/components/[name]
```

### Estructura esperada del componente:

```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-example',
    imports: [],  // Angular v20: imports en lugar de standalone
    templateUrl: './example.component.html',
    styleUrls: ['./example.component.scss']
})
export class ExampleComponent {
    @Input() data!: string;
    @Output() dataChange = new EventEmitter<string>();
}
```

---

## ⚙️ Generación de Servicios

```bash
# Servicio en módulo específico
ng g s modules/[module-name]/services/[service-name] --skip-tests

# Ejemplos
ng g s modules/shipment-record/services/shipping --skip-tests
ng g s modules/shared/services/storage/cache --skip-tests
ng g s modules/geo/services/location --skip-tests
```

### Template de Servicio con HttpClient:

```typescript
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
    providedIn: 'root'
})
export class ExampleService {
    private readonly baseUrl = environment.shippingRecords.api;
    private readonly http = inject(HttpClient);

    getAll(): Observable<ExampleResponse> {
        return this.http.get<ExampleResponse>(`${this.baseUrl}/v1/examples`);
    }

    getById(id: string): Observable<ExampleResponse> {
        return this.http.get<ExampleResponse>(`${this.baseUrl}/v1/examples/${id}`);
    }

    create(payload: ExamplePayload): Observable<ExampleResponse> {
        return this.http.post<ExampleResponse>(`${this.baseUrl}/v1/examples`, payload);
    }

    update(id: string, payload: ExamplePayload): Observable<ExampleResponse> {
        return this.http.put<ExampleResponse>(`${this.baseUrl}/v1/examples/${id}`, payload);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/v1/examples/${id}`);
    }

    search(params: SearchParams): Observable<ExampleCollectionResponse> {
        let httpParams = new HttpParams();
        if (params.query) httpParams = httpParams.set('query', params.query);
        if (params.page) httpParams = httpParams.set('page', params.page.toString());
        
        return this.http.get<ExampleCollectionResponse>(`${this.baseUrl}/v1/examples/search`, {
            params: httpParams
        });
    }
}
```

### Template de Servicio con Signals (Estado local):

```typescript
import { Injectable, signal, computed } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StateService {
    private readonly _items = signal<Item[]>([]);
    private readonly _loading = signal<boolean>(false);

    // Signals públicos (readonly)
    readonly items = this._items.asReadonly();
    readonly loading = this._loading.asReadonly();
    
    // Computed
    readonly itemCount = computed(() => this._items().length);
    readonly isEmpty = computed(() => this._items().length === 0);

    setItems(items: Item[]) {
        this._items.set(items);
    }

    addItem(item: Item) {
        this._items.update(items => [...items, item]);
    }

    removeItem(id: string) {
        this._items.update(items => items.filter(item => item.id !== id));
    }

    setLoading(value: boolean) {
        this._loading.set(value);
    }
}
```

---

## 📐 Generación de Directivas

```bash
# Directiva en shared
ng g d modules/shared/directives/[directive-name] --skip-tests

# Ejemplos
ng g d modules/shared/directives/auto-focus --skip-tests
ng g d modules/shared/directives/click-outside --skip-tests
```

### Template de Directiva:

```typescript
import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';

@Directive({
    standalone: true,
    selector: '[appMyDirective]'
})
export class MyDirective {
    @Input() appMyDirective = '';
    
    private readonly el = inject(ElementRef);

    @HostListener('input', ['$event'])
    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        // Lógica de la directiva
    }

    @HostListener('focus')
    onFocus(): void {
        // Lógica cuando el elemento recibe foco
    }

    @HostListener('blur')
    onBlur(): void {
        // Lógica cuando el elemento pierde foco
    }
}
```

---

## 🔧 Generación de Pipes

```bash
# Pipe en shared
ng g p modules/shared/pipes/[pipe-name] --skip-tests

# Ejemplos
ng g p modules/shared/pipes/currency-format --skip-tests
ng g p modules/shared/pipes/date-format --skip-tests
```

### Template de Pipe:

```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    standalone: true,
    name: 'myPipe'
})
export class MyPipe implements PipeTransform {
    transform(value: string | null, ...args: unknown[]): string {
        if (!value) return '';
        // Lógica de transformación
        return value.toUpperCase();
    }
}
```

---

## 🛡️ Generación de Guards

```bash
# Guard funcional (recomendado Angular v20)
ng g guard modules/shared/guards/[guard-name] --functional --skip-tests

# Ejemplos
ng g guard modules/shared/guards/auth --functional --skip-tests
ng g guard modules/shared/guards/role --functional --skip-tests
```

### Template de Guard Funcional:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@/modules/authentication/token/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        return true;
    }

    return router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
    });
};

// Guard con roles
export const roleGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const requiredRoles = route.data['roles'] as string[];
    const userRoles = authService.getUserRoles();

    if (requiredRoles.some(role => userRoles.includes(role))) {
        return true;
    }

    return router.createUrlTree(['/unauthorized']);
};
```

---

## 🔄 Generación de Interceptors

```bash
# Interceptor funcional
ng g interceptor modules/shared/interceptors/[interceptor-name] --functional --skip-tests

# Ejemplos
ng g interceptor modules/shared/interceptors/error-handler --functional --skip-tests
ng g interceptor modules/shared/interceptors/cache --functional --skip-tests
```

### Template de Interceptor Funcional:

```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, finalize } from 'rxjs';
import { ToastService } from '@shared/services/toast/toast.service';
import { LoadingService } from '@shared/services/is-loading/loading.service';

// Interceptor básico
export const myInterceptor: HttpInterceptorFn = (req, next) => {
    // Modificar request
    const modifiedReq = req.clone({
        setHeaders: {
            'X-Custom-Header': 'value'
        }
    });
    
    return next(modifiedReq);
};

// Interceptor de errores
export const errorHandlerInterceptor: HttpInterceptorFn = (req, next) => {
    const toastService = inject(ToastService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'Ha ocurrido un error';
            
            if (error.status === 400) {
                errorMessage = 'Solicitud inválida';
            } else if (error.status === 404) {
                errorMessage = 'Recurso no encontrado';
            } else if (error.status >= 500) {
                errorMessage = 'Error del servidor';
            }

            toastService.showToast(errorMessage, 'error');
            return throwError(() => error);
        })
    );
};

// Interceptor de loading
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
    const loadingService = inject(LoadingService);

    loadingService.show();
    return next(req).pipe(
        finalize(() => loadingService.hide())
    );
};
```

---

## 📝 Generación de Modelos/Interfaces

> **Nota:** Angular CLI no genera interfaces directamente. Crear manualmente.

### Ubicación de archivos:

```
ng g interface src/app/modules/[module-name]/models/[model-name].model.ts --type=model
ng g interface src/app/modules/shared/models/[model-name].model.ts --type=model
```

### Template de Modelo/Interface:

```typescript
// response.model.ts - Modelo de respuesta genérico
export interface ResponseCollection<T> {
    content?: T;
    number?: number;
    size?: number;
    totalElements?: number;
    totalPages?: number;
    first?: boolean;
    last?: boolean;
}

// example.model.ts - Modelo específico
import { ResponseCollection } from '@shared/models/response-collection.model';

// Response del API
export interface ExampleCollectionResponse extends ResponseCollection<ExampleEntityResponse> {}

export interface ExampleEntityResponse {
    id?: string;
    name?: string;
    description?: string;
    status?: ExampleStatus;
    createdAt?: string;
    updatedAt?: string;
}

// Payload para crear/actualizar
export interface ExamplePayload {
    name: string;
    description?: string;
    status?: ExampleStatus;
}

// Query params para búsqueda
export interface ExampleQueryParams {
    query?: string;
    status?: ExampleStatus;
    page?: number;
    size?: number;
}

// Enum de estados
export type ExampleStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING';

// Form data (para formularios reactivos)
export interface ExampleFormData {
    name: string | null;
    description: string | null;
    status: ExampleStatus | null;
}
```

---

## ✅ Generación de Validators

> **Nota:** Crear manualmente en la carpeta validators.

### Ubicación:

```
src/app/modules/shared/validators/[validator-name].validator.ts
```

### Template de Validator:

```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validador personalizado para [descripción]
 * @returns ValidatorFn
 */
export function CustomValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value ?? '';
        
        // Si está vacío, dejar que Validators.required lo maneje
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const text = String(value).trim();
        
        // Lógica de validación
        if (/* condición válida */) {
            return null; // Válido
        }

        return { customError: true }; // Inválido
    };
}

// Ejemplo: Validador de RUC peruano
export function RucValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value ?? '';
        if (!value) return null;
        
        const ruc = String(value).trim();
        if (ruc.length !== 11) {
            return { invalidLength: true };
        }
        if (!/^(10|20)\d{9}$/.test(ruc)) {
            return { invalidFormat: true };
        }
        return null;
    };
}

// Ejemplo: Validador de celular peruano
export function CellphoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value ?? '';
        if (!value) return null;
        
        const phone = String(value).trim();
        if (!phone.startsWith('9') || phone.length !== 9) {
            return { invalidCellphone: true };
        }
        return null;
    };
}

// Ejemplo: Validador asíncrono
export function AsyncValidator(service: ValidationService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        return service.validate(control.value).pipe(
            map(isValid => isValid ? null : { asyncError: true }),
            catchError(() => of(null))
        );
    };
}
```

---

## 🛤️ Generación de Rutas

### Estructura de rutas del proyecto:

```
src/app/
├── app.routes.ts                    # Rutas principales
└── modules/
    ├── home/
    │   └── home.routes.ts           # Rutas de home
    └── shipment-record/
        └── shipment-record.routes.ts # Rutas de shipment
```

### Template de archivo de rutas:

```typescript
// [module-name].routes.ts
import { Routes } from '@angular/router';

// Exportación por defecto (lazy loading)
export default [
    {
        path: '',
        redirectTo: 'list',
        pathMatch: 'full'
    },
    {
        path: 'list',
        loadComponent: () => import('./components/list/list.component')
            .then(m => m.ListComponent)
    },
    {
        path: 'detail/:id',
        loadComponent: () => import('./components/detail/detail.component')
            .then(m => m.DetailComponent)
    },
    {
        path: 'create',
        loadComponent: () => import('./components/form/form.component')
            .then(m => m.FormComponent),
        canActivate: [authGuard]
    }
] as Routes;
```

### Agregar nuevo módulo a las rutas principales (app.routes.ts):

```typescript
import { Routes } from '@angular/router';
import { PublicLayoutComponent } from '@layouts/public-layout/components/public-layout/public-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: PublicLayoutComponent,
        loadChildren: () => import('./modules/home/home.routes').then(m => m.default)
    },
    {
        path: 'shipment-record',
        component: PublicLayoutComponent,
        loadChildren: () => import('./modules/shipment-record/shipment-record.routes').then(m => m.default)
    },
    // Agregar nuevo módulo
    {
        path: 'new-module',
        component: PublicLayoutComponent,
        loadChildren: () => import('./modules/new-module/new-module.routes').then(m => m.default)
    }
];
```

---

## 📁 Path Aliases

Aliases configurados en `tsconfig.json`:

| Alias | Path |
|-------|------|
| `@/*` | `src/app/*` |
| `@env/*` | `src/environments/*` |
| `@shared/*` | `src/app/modules/shared/*` |
| `@shipment-record/*` | `src/app/modules/shipment-record/*` |
| `@layouts/*` | `src/app/modules/layouts/*` |

### Ejemplos de uso:

```typescript
// Importar desde environments
import { environment } from '@env/environment';

// Importar desde shared
import { ToastService } from '@shared/services/toast/toast.service';
import { ResponseCollection } from '@shared/models/response-collection.model';
import { OnlyNumberDirective } from '@shared/directives/only-number.directive';
import { CellphoneValidator } from '@shared/validators/cellphone.validator';

// Importar desde módulo específico
import { CartService } from '@shipment-record/services/cart.service';
import { CartItem } from '@shipment-record/models/cart.model';

// Importar desde layouts
import { PublicLayoutComponent } from '@layouts/public-layout/components/public-layout/public-layout.component';

// Importar genérico
import { AuthService } from '@/modules/authentication/token/services/auth.service';
```

---

## 💻 Snippets de Código

### Componente con Reactive Forms:

```typescript
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';

@Component({
    selector: 'app-my-form',
    imports: [ReactiveFormsModule, InputText, Button],
    templateUrl: './my-form.component.html'
})
export class MyFormComponent implements OnInit {
    private readonly fb = inject(FormBuilder);
    
    form!: FormGroup;

    ngOnInit() {
        this.initForm();
    }

    private initForm() {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]]
        });
    }

    onSubmit() {
        if (this.form.valid) {
            const formData = this.form.value;
            // Procesar datos
        }
    }
}
```

### Componente con OnDestroy (cleanup):

```typescript
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MyService } from './my.service';

@Component({
    selector: 'app-my-component',
    imports: [],
    templateUrl: './my.component.html'
})
export class MyComponent implements OnInit, OnDestroy {
    private readonly myService = inject(MyService);
    private readonly destroy$ = new Subject<void>();

    data: any[] = [];

    ngOnInit() {
        this.loadData();
    }

    private loadData() {
        this.myService.getData()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (response) => {
                    this.data = response.content ?? [];
                },
                error: (err) => console.error('Error:', err)
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
```

### Uso de Signals en Componentes:

```typescript
import { Component, signal, computed, effect } from '@angular/core';

@Component({
    selector: 'app-signals-example',
    imports: [],
    template: `
        <p>Count: {{ count() }}</p>
        <p>Double: {{ doubleCount() }}</p>
        <button (click)="increment()">+</button>
    `
})
export class SignalsExampleComponent {
    count = signal(0);
    doubleCount = computed(() => this.count() * 2);

    constructor() {
        // Effect para side effects
        effect(() => {
            console.log('Count changed:', this.count());
        });
    }

    increment() {
        this.count.update(c => c + 1);
    }
}
```

### Toast Notification:

```typescript
import { inject } from '@angular/core';
import { ToastService } from '@shared/services/toast/toast.service';

// En cualquier componente/servicio
const toastService = inject(ToastService);

// Mostrar mensajes
toastService.showToast('Operación exitosa', 'success');
toastService.showToast('Error al procesar', 'error');
toastService.showToast('Información importante', 'info');
toastService.showToast('Advertencia', 'warn');
```

---

## 📂 Estructura de Carpetas para Nuevo Módulo

```bash
# Crear estructura de nuevo módulo
mkdir -p src/app/modules/[module-name]/{components,services,models,constants}

# Estructura resultante:
src/app/modules/[module-name]/
├── [module-name].routes.ts
├── components/
│   └── [component-name]/
│       ├── [component-name].component.ts
│       ├── [component-name].component.html
│       └── [component-name].component.scss
├── services/
│   └── [service-name].service.ts
├── models/
│   └── [model-name].model.ts
└── constants/
    └── [constant-name].constant.ts
```

---

## 🎨 Imports de PrimeNG Comunes

```typescript
// Formularios
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';
import { Checkbox } from 'primeng/checkbox';
import { RadioButton } from 'primeng/radiobutton';
import { InputSwitch } from 'primeng/inputswitch';
import { AutoComplete } from 'primeng/autocomplete';

// Botones y Acciones
import { Button } from 'primeng/button';
import { SplitButton } from 'primeng/splitbutton';

// Layout
import { Card } from 'primeng/card';
import { Panel } from 'primeng/panel';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Tabs, Tab, TabPanel } from 'primeng/tabs';
import { Dialog } from 'primeng/dialog';

// Datos
import { Table } from 'primeng/table';
import { DataView } from 'primeng/dataview';
import { Paginator } from 'primeng/paginator';

// Mensajes
import { Toast } from 'primeng/toast';
import { Message } from 'primeng/message';
import { ConfirmDialog } from 'primeng/confirmdialog';
```

---

## ⚡ Comandos Rápidos

```bash
# Generar componente rápido
ng g c modules/shared/components/[name] --skip-tests

# Generar servicio rápido
ng g s modules/[module]/services/[name] --skip-tests

# Generar directiva rápida
ng g d modules/shared/directives/[name] --skip-tests

# Ver ayuda de schematics
ng g --help

# Verificar versión de Angular
ng version
```

---

## 📚 BUENAS PRÁCTICAS

### 🏗️ Arquitectura y Estructura

#### 1. Organización de Carpetas por Feature/Módulo

```
✅ BIEN: Organizar por feature
src/app/modules/
├── shipment-record/          # Feature module
│   ├── components/           # Componentes del feature
│   ├── services/             # Servicios específicos
│   ├── models/               # Interfaces/tipos
│   ├── constants/            # Constantes
│   └── shipment-record.routes.ts
├── shared/                   # Código compartido
│   ├── components/
│   ├── directives/
│   ├── pipes/
│   ├── services/
│   └── utils/

❌ MAL: Organizar por tipo
src/app/
├── components/               # Todos los componentes juntos
├── services/                 # Todos los servicios juntos
├── models/                   # Todos los modelos juntos
```

#### 2. Principio de Responsabilidad Única (SRP)

```typescript
// ❌ MAL: Componente hace demasiadas cosas
@Component({...})
export class OrderComponent {
    orders: Order[] = [];
    
    loadOrders() { /* HTTP call */ }
    calculateTotal() { /* Lógica de negocio */ }
    formatDate() { /* Formateo */ }
    validateOrder() { /* Validación */ }
    sendEmail() { /* Notificación */ }
}

// ✅ BIEN: Separar responsabilidades
@Component({...})
export class OrderComponent {
    private readonly orderService = inject(OrderService);
    orders = this.orderService.orders;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
    // Solo lógica de datos
}

// Pipe para formateo
@Pipe({ name: 'dateFormat' })
export class DateFormatPipe { }

// Validador separado
export function orderValidator(): ValidatorFn { }
```

#### 3. Smart vs Dumb Components

```typescript
// ✅ Smart Component (Container) - Maneja lógica y estado
@Component({
    selector: 'app-order-container',
    template: `
        <app-order-list 
            [orders]="orders()" 
            (orderSelected)="onOrderSelect($event)"
        />
    `
})
export class OrderContainerComponent {
    private readonly orderService = inject(OrderService);
    orders = this.orderService.orders;
    
    onOrderSelect(order: Order) {
        this.orderService.selectOrder(order);
    }
}

// ✅ Dumb Component (Presentational) - Solo presenta datos
@Component({
    selector: 'app-order-list',
    template: `
        @for (order of orders; track order.id) {
            <div (click)="orderSelected.emit(order)">
                {{ order.name }}
            </div>
        }
    `
})
export class OrderListComponent {
    @Input() orders: Order[] = [];
    @Output() orderSelected = new EventEmitter<Order>();
}
```

---

### 🎯 Componentes

#### 1. Usar `inject()` en lugar de Constructor Injection

```typescript
// ❌ Antiguo: Constructor injection
export class MyComponent {
    constructor(
        private myService: MyService,
        private router: Router,
        private fb: FormBuilder
    ) {}
}

// ✅ Moderno: inject() function
export class MyComponent {
    private readonly myService = inject(MyService);
    private readonly router = inject(Router);
    private readonly fb = inject(FormBuilder);
}
```

#### 2. Usar Signals para Estado Reactivo

```typescript
// ❌ Antiguo: Propiedades mutables
export class CounterComponent {
    count = 0;
    
    increment() {
        this.count++;
    }
}

// ✅ Moderno: Signals
export class CounterComponent {
    count = signal(0);
    doubleCount = computed(() => this.count() * 2);
    
    increment() {
        this.count.update(c => c + 1);
    }
}
```

#### 3. Inputs Required y con Transform

```typescript
// ✅ Input requerido
@Input({ required: true }) orderId!: string;

// ✅ Input con transformación
@Input({ transform: booleanAttribute }) disabled = false;
@Input({ transform: numberAttribute }) quantity = 0;

// ✅ Input con alias
@Input({ alias: 'item' }) orderItem!: Order;
```

#### 4. Usar OnPush Change Detection

```typescript
// ✅ Mejor rendimiento con OnPush
@Component({
    selector: 'app-order-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `...`
})
export class OrderListComponent {
    @Input() orders: Order[] = [];
}
```

#### 5. TrackBy en Loops

```typescript
// ❌ MAL: Sin trackBy
@for (item of items) {
    <app-item [data]="item" />
}

// ✅ BIEN: Con track
@for (item of items; track item.id) {
    <app-item [data]="item" />
}

// ✅ BIEN: Track por índice si no hay ID único
@for (item of items; track $index) {
    <app-item [data]="item" />
}
```

#### 6. Lazy Loading de Componentes

```typescript
// ✅ Lazy load en rutas
{
    path: 'orders',
    loadComponent: () => import('./orders/orders.component')
        .then(m => m.OrdersComponent)
}

// ✅ Lazy load con @defer
@Component({
    template: `
        @defer (on viewport) {
            <app-heavy-component />
        } @placeholder {
            <div>Cargando...</div>
        }
    `
})
```

---

### 📡 Servicios y HTTP

#### 1. Centralizar URLs de API

```typescript
// ✅ BIEN: URLs centralizadas en environment
// environment.ts
export const environment = {
    production: false,
    api: {
        base: 'https://api.example.com',
        shipments: '/v1/shipments',
        orders: '/v1/orders'
    }
};

// service.ts
@Injectable({ providedIn: 'root' })
export class ShipmentService {
    private readonly baseUrl = `${environment.api.base}${environment.api.shipments}`;
}
```

#### 2. Tipar Respuestas HTTP

```typescript
// ❌ MAL: Sin tipos
getOrders() {
    return this.http.get('/orders');
}

// ✅ BIEN: Con tipos
getOrders(): Observable<OrderCollectionResponse> {
    return this.http.get<OrderCollectionResponse>(`${this.baseUrl}/orders`);
}
```

#### 3. Manejo de Errores Consistente

```typescript
// ✅ BIEN: Manejo de errores centralizado
@Injectable({ providedIn: 'root' })
export class OrderService {
    private readonly http = inject(HttpClient);
    private readonly toast = inject(ToastService);

    getOrders(): Observable<Order[]> {
        return this.http.get<OrderResponse>(`${this.baseUrl}/orders`).pipe(
            map(response => response.content ?? []),
            catchError(error => {
                this.toast.showToast('Error al cargar órdenes', 'error');
                return of([]);
            })
        );
    }
}
```

#### 4. Usar Interceptors para Cross-Cutting Concerns

```typescript
// ✅ Auth interceptor
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = inject(AuthService).getToken();
    if (token) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });
    }
    return next(req);
};

// ✅ Registrar en app.config.ts
export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(
            withInterceptors([authInterceptor, loadingInterceptor])
        )
    ]
};
```

---

### 📝 Formularios Reactivos

#### 1. Tipar FormGroups

```typescript
// ❌ MAL: FormGroup sin tipos
form = this.fb.group({
    name: [''],
    email: ['']
});

// ✅ BIEN: FormGroup tipado
interface OrderForm {
    name: FormControl<string>;
    email: FormControl<string>;
    quantity: FormControl<number>;
}

form = this.fb.group<OrderForm>({
    name: this.fb.control('', { nonNullable: true }),
    email: this.fb.control('', { nonNullable: true }),
    quantity: this.fb.control(0, { nonNullable: true })
});
```

#### 2. Validadores Reutilizables

```typescript
// ✅ Validadores en archivos separados
// validators/email.validator.ts
export function emailDomainValidator(domain: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const email = control.value;
        if (email && !email.endsWith(`@${domain}`)) {
            return { invalidDomain: { expected: domain } };
        }
        return null;
    };
}

// Uso
email: ['', [Validators.required, emailDomainValidator('empresa.com')]]
```

#### 3. Mensajes de Error Centralizados

```typescript
// ✅ Constantes de mensajes
export const VALIDATION_MESSAGES = {
    required: 'Este campo es requerido',
    email: 'Ingrese un email válido',
    minlength: (min: number) => `Mínimo ${min} caracteres`,
    maxlength: (max: number) => `Máximo ${max} caracteres`,
    pattern: 'Formato inválido'
};

// ✅ Componente de error reutilizable
@Component({
    selector: 'app-field-error',
    template: `
        @if (control?.invalid && control?.touched) {
            <small class="text-red-500">{{ errorMessage }}</small>
        }
    `
})
export class FieldErrorComponent {
    @Input() control?: AbstractControl;
    @Input() messages = VALIDATION_MESSAGES;
    
    get errorMessage(): string {
        if (!this.control?.errors) return '';
        const errorKey = Object.keys(this.control.errors)[0];
        return this.messages[errorKey] ?? 'Error de validación';
    }
}
```

---

### 🔒 Seguridad

#### 1. Sanitizar Inputs del Usuario

```typescript
// ✅ Usar DomSanitizer para HTML dinámico
@Component({...})
export class HtmlContentComponent {
    private readonly sanitizer = inject(DomSanitizer);
    
    @Input() set htmlContent(value: string) {
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(value);
    }
    safeHtml?: SafeHtml;
}
```

#### 2. No Exponer Información Sensible

```typescript
// ❌ MAL: Token en localStorage visible
localStorage.setItem('token', token);

// ✅ BIEN: Usar HttpOnly cookies (backend) o encriptar
// O al menos usar sessionStorage para datos temporales
sessionStorage.setItem('token', token);
```

#### 3. Validar en Frontend Y Backend

```typescript
// ✅ Siempre validar en ambos lados
// Frontend: UX inmediato
// Backend: Seguridad real
```

---

### ⚡ Rendimiento

#### 1. Lazy Loading de Módulos y Componentes

```typescript
// ✅ Rutas con lazy loading
export const routes: Routes = [
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin.routes')
            .then(m => m.adminRoutes),
        canActivate: [authGuard]
    }
];
```

#### 2. Virtual Scrolling para Listas Grandes

```typescript
// ✅ Usar CDK Virtual Scroll
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
    imports: [ScrollingModule],
    template: `
        <cdk-virtual-scroll-viewport itemSize="50" class="h-[400px]">
            <div *cdkVirtualFor="let item of items">
                {{ item.name }}
            </div>
        </cdk-virtual-scroll-viewport>
    `
})
```

#### 3. Debounce en Búsquedas

```typescript
// ✅ Debounce para evitar llamadas excesivas
searchControl = new FormControl('');

ngOnInit() {
    this.searchControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(term => this.searchService.search(term)),
        takeUntil(this.destroy$)
    ).subscribe(results => {
        this.results = results;
    });
}
```

#### 4. Preload Strategies

```typescript
// ✅ Precargar módulos en background
export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes, withPreloading(PreloadAllModules))
    ]
};
```

---

### 🧪 Testing

#### 1. Nombrar Tests Descriptivamente

```typescript
// ❌ MAL: Nombres genéricos
it('should work', () => {});
it('test 1', () => {});

// ✅ BIEN: Nombres descriptivos
it('should display error message when email is invalid', () => {});
it('should call API when form is submitted with valid data', () => {});
it('should disable submit button while loading', () => {});
```

#### 2. Arrange-Act-Assert Pattern

```typescript
it('should calculate total correctly', () => {
    // Arrange
    const items = [{ price: 100 }, { price: 200 }];
    component.items = items;
    
    // Act
    const total = component.calculateTotal();
    
    // Assert
    expect(total).toBe(300);
});
```

#### 3. Mock de Servicios

```typescript
// ✅ Crear mocks reutilizables
const mockOrderService = {
    getOrders: jasmine.createSpy('getOrders')
        .and.returnValue(of([{ id: '1', name: 'Order 1' }])),
    createOrder: jasmine.createSpy('createOrder')
        .and.returnValue(of({ id: '2' }))
};

beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
            { provide: OrderService, useValue: mockOrderService }
        ]
    });
});
```

---

### 📖 Código Limpio

#### 1. Nombres Descriptivos

```typescript
// ❌ MAL: Nombres ambiguos
const d = new Date();
const arr = [];
function calc(x, y) {}

// ✅ BIEN: Nombres descriptivos
const currentDate = new Date();
const activeOrders: Order[] = [];
function calculateShippingCost(weight: number, distance: number) {}
```

#### 2. Constantes en Lugar de Magic Numbers

```typescript
// ❌ MAL: Números mágicos
if (status === 1) {}
if (items.length > 10) {}

// ✅ BIEN: Constantes con significado
const ORDER_STATUS = {
    PENDING: 1,
    COMPLETED: 2,
    CANCELLED: 3
} as const;

const MAX_ITEMS_PER_PAGE = 10;

if (status === ORDER_STATUS.PENDING) {}
if (items.length > MAX_ITEMS_PER_PAGE) {}
```

#### 3. Evitar Código Duplicado (DRY)

```typescript
// ❌ MAL: Código duplicado
function getActiveUsers() {
    return this.users.filter(u => u.active && !u.deleted);
}
function getActiveAdmins() {
    return this.admins.filter(a => a.active && !a.deleted);
}

// ✅ BIEN: Función reutilizable
function filterActive<T extends { active: boolean; deleted: boolean }>(items: T[]): T[] {
    return items.filter(item => item.active && !item.deleted);
}

const activeUsers = filterActive(this.users);
const activeAdmins = filterActive(this.admins);
```

#### 4. Early Returns

```typescript
// ❌ MAL: Anidación excesiva
function processOrder(order: Order) {
    if (order) {
        if (order.isValid) {
            if (order.items.length > 0) {
                // Procesar
            }
        }
    }
}

// ✅ BIEN: Early returns
function processOrder(order: Order) {
    if (!order) return;
    if (!order.isValid) return;
    if (order.items.length === 0) return;
    
    // Procesar
}
```

#### 5. Funciones Pequeñas y Enfocadas

```typescript
// ❌ MAL: Función que hace muchas cosas
function processAndValidateAndSaveOrder(order: Order) {
    // 100 líneas de código...
}

// ✅ BIEN: Funciones pequeñas
function validateOrder(order: Order): boolean { /* ... */ }
function calculateTotal(order: Order): number { /* ... */ }
function saveOrder(order: Order): Observable<Order> { /* ... */ }

function processOrder(order: Order) {
    if (!validateOrder(order)) return;
    order.total = calculateTotal(order);
    return saveOrder(order);
}
```

---

### 📁 Convenciones de Archivos

#### 1. Nomenclatura de Archivos

```
✅ Convenciones del proyecto:
component:    my-component.component.ts
service:      my-service.service.ts
directive:    my-directive.directive.ts
pipe:         my-pipe.pipe.ts
guard:        my-guard.guard.ts
interceptor:  my-handler.interceptor.ts
model:        my-model.model.ts
constant:     my-constant.constant.ts
validator:    my-validator.validator.ts
util:         my-util.util.ts
```

#### 2. Un Archivo por Clase/Función

```typescript
// ❌ MAL: Múltiples clases en un archivo
// user.ts
export class User {}
export class UserService {}
export class UserValidator {}

// ✅ BIEN: Archivos separados
// user.model.ts
export interface User {}

// user.service.ts
export class UserService {}

// user.validator.ts
export function userValidator() {}
```

#### 3. Index Files para Exports

```typescript
// ✅ shared/components/index.ts
export * from './button/button.component';
export * from './input/input.component';
export * from './modal/modal.component';

// Uso simplificado
import { ButtonComponent, InputComponent } from '@shared/components';
```

---

### 🌐 Internacionalización (i18n)

#### 1. Usar Translate Pipe

```html
<!-- ✅ Usar ngx-translate -->
<h1>{{ 'HOME.TITLE' | translate }}</h1>
<p>{{ 'HOME.WELCOME' | translate: { name: userName } }}</p>
```

#### 2. Archivos de Traducción Organizados

```json
// es.json
{
    "COMMON": {
        "SAVE": "Guardar",
        "CANCEL": "Cancelar",
        "DELETE": "Eliminar"
    },
    "ERRORS": {
        "REQUIRED": "Este campo es requerido",
        "INVALID_EMAIL": "Email inválido"
    },
    "ORDERS": {
        "TITLE": "Mis Órdenes",
        "EMPTY": "No tienes órdenes"
    }
}
```

---

### 🎨 Estilos

#### 1. Usar Variables CSS/SCSS

```scss
// ✅ Variables centralizadas
// _variables.scss
$primary-color: #1976d2;
$secondary-color: #424242;
$border-radius: 8px;
$spacing-unit: 8px;

// Uso
.button {
    background: $primary-color;
    border-radius: $border-radius;
    padding: $spacing-unit * 2;
}
```

#### 2. BEM para Clases CSS

```scss
// ✅ Block__Element--Modifier
.card {
    &__header {
        // .card__header
    }
    &__body {
        // .card__body
    }
    &--highlighted {
        // .card--highlighted
    }
}
```

#### 3. Preferir TailwindCSS para Utilidades

```html
<!-- ✅ Clases de utilidad de Tailwind -->
<div class="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
    <span class="text-lg font-semibold text-gray-800">Título</span>
    <button class="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">
        Acción
    </button>
</div>
```

---

## 🧹 Buenas Prácticas para Evitar Memory Leaks

### 1. Patrón `takeUntil` con `destroy$` (Recomendado)

```typescript
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { MyService } from './my.service';

@Component({
    selector: 'app-example',
    imports: [],
    templateUrl: './example.component.html'
})
export class ExampleComponent implements OnInit, OnDestroy {
    private readonly myService = inject(MyService);
    private readonly destroy$ = new Subject<void>();

    ngOnInit() {
        // ✅ Suscripción con takeUntil - se cancela automáticamente
        this.myService.getData()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                // Procesar datos
            });

        // ✅ Múltiples suscripciones usando el mismo destroy$
        this.myService.getOtherData()
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                // Procesar otros datos
            });
    }

    ngOnDestroy() {
        // 🔥 Emite y completa para cancelar TODAS las suscripciones
        this.destroy$.next();
        this.destroy$.complete();
    }
}
```

### 2. Patrón `DestroyRef` con `takeUntilDestroyed` (Angular v16+)

```typescript
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MyService } from './my.service';

@Component({
    selector: 'app-example',
    imports: [],
    templateUrl: './example.component.html'
})
export class ExampleComponent implements OnInit {
    private readonly myService = inject(MyService);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit() {
        // ✅ Se cancela automáticamente cuando el componente se destruye
        this.myService.getData()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((data) => {
                // Procesar datos
            });
    }

    // ✅ No necesita ngOnDestroy!
}
```

### 3. Usar `takeUntilDestroyed()` en el constructor

```typescript
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MyService } from './my.service';

@Component({
    selector: 'app-example',
    imports: [],
    templateUrl: './example.component.html'
})
export class ExampleComponent {
    private readonly myService = inject(MyService);
    
    data$ = this.myService.getData().pipe(
        takeUntilDestroyed() // ✅ Funciona sin pasar DestroyRef en el constructor
    );

    constructor() {
        // ✅ También funciona en el constructor
        this.myService.getOtherData()
            .pipe(takeUntilDestroyed())
            .subscribe((data) => {
                // Procesar datos
            });
    }
}
```

### 4. Pipe `async` en Templates (Preferido)

```typescript
// component.ts
@Component({
    selector: 'app-example',
    imports: [AsyncPipe, NgIf],
    template: `
        <!-- ✅ async pipe maneja automáticamente la suscripción -->
        @if (data$ | async; as data) {
            <p>{{ data.name }}</p>
        }
        
        <!-- ✅ Múltiples observables -->
        @if (loading$ | async) {
            <app-spinner />
        }
    `
})
export class ExampleComponent {
    private readonly myService = inject(MyService);
    
    // ✅ No necesita suscripción manual
    data$ = this.myService.getData();
    loading$ = this.myService.loading$;
}
```

### 5. Operadores de Completado Automático

```typescript
import { Component, inject } from '@angular/core';
import { take, first, takeWhile } from 'rxjs';

@Component({...})
export class ExampleComponent {
    private readonly myService = inject(MyService);

    loadOnce() {
        // ✅ take(1) - Toma solo el primer valor y completa
        this.myService.getData()
            .pipe(take(1))
            .subscribe((data) => {
                // Se ejecuta una vez
            });
    }

    loadFirst() {
        // ✅ first() - Similar a take(1), pero lanza error si no hay valores
        this.myService.getData()
            .pipe(first())
            .subscribe((data) => {
                // Se ejecuta una vez
            });
    }

    loadWhile() {
        // ✅ takeWhile - Completa cuando la condición es false
        this.myService.getData()
            .pipe(takeWhile((data) => data.isActive))
            .subscribe((data) => {
                // Se ejecuta mientras isActive sea true
            });
    }
}
```

### 6. Cancelar Suscripciones Manualmente

```typescript
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({...})
export class ExampleComponent implements OnInit, OnDestroy {
    private readonly myService = inject(MyService);
    private subscription?: Subscription;
    private subscriptions: Subscription[] = [];

    ngOnInit() {
        // ✅ Guardar referencia para cancelar después
        this.subscription = this.myService.getData().subscribe((data) => {
            // Procesar datos
        });

        // ✅ Múltiples suscripciones en array
        this.subscriptions.push(
            this.myService.getData1().subscribe(),
            this.myService.getData2().subscribe()
        );
    }

    ngOnDestroy() {
        // 🔥 Cancelar suscripción individual
        this.subscription?.unsubscribe();

        // 🔥 Cancelar todas las suscripciones del array
        this.subscriptions.forEach(sub => sub.unsubscribe());
    }
}
```

### 7. Limpiar Event Listeners

```typescript
import { Component, OnDestroy, OnInit, ElementRef, inject, NgZone } from '@angular/core';

@Component({...})
export class ExampleComponent implements OnInit, OnDestroy {
    private readonly el = inject(ElementRef);
    private readonly ngZone = inject(NgZone);
    private resizeListener?: () => void;

    ngOnInit() {
        // ✅ Guardar referencia del listener
        this.resizeListener = () => this.onResize();
        
        // ✅ Ejecutar fuera de Angular para mejor rendimiento
        this.ngZone.runOutsideAngular(() => {
            window.addEventListener('resize', this.resizeListener!);
        });
    }

    private onResize() {
        this.ngZone.run(() => {
            // Actualizar estado
        });
    }

    ngOnDestroy() {
        // 🔥 Remover event listener
        if (this.resizeListener) {
            window.removeEventListener('resize', this.resizeListener);
        }
    }
}
```

### 8. Limpiar setInterval y setTimeout

```typescript
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({...})
export class ExampleComponent implements OnInit, OnDestroy {
    private intervalId?: ReturnType<typeof setInterval>;
    private timeoutId?: ReturnType<typeof setTimeout>;

    ngOnInit() {
        // ✅ Guardar referencia del interval
        this.intervalId = setInterval(() => {
            this.updateData();
        }, 5000);

        // ✅ Guardar referencia del timeout
        this.timeoutId = setTimeout(() => {
            this.doSomething();
        }, 3000);
    }

    ngOnDestroy() {
        // 🔥 Limpiar interval
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        // 🔥 Limpiar timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
}
```

### 9. Usar `interval` de RxJS en lugar de `setInterval`

```typescript
import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subject, takeUntil } from 'rxjs';

@Component({...})
export class ExampleComponent implements OnInit, OnDestroy {
    private readonly destroy$ = new Subject<void>();

    ngOnInit() {
        // ✅ Usar interval de RxJS - se cancela con takeUntil
        interval(5000)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.updateData();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
```

### 10. Desconectar Observers (IntersectionObserver, MutationObserver, etc.)

```typescript
import { Component, OnDestroy, OnInit, ElementRef, inject } from '@angular/core';

@Component({...})
export class ExampleComponent implements OnInit, OnDestroy {
    private readonly el = inject(ElementRef);
    private intersectionObserver?: IntersectionObserver;
    private mutationObserver?: MutationObserver;

    ngOnInit() {
        // ✅ IntersectionObserver
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.onVisible();
                }
            });
        });
        this.intersectionObserver.observe(this.el.nativeElement);

        // ✅ MutationObserver
        this.mutationObserver = new MutationObserver((mutations) => {
            // Procesar mutaciones
        });
        this.mutationObserver.observe(this.el.nativeElement, { 
            childList: true, 
            subtree: true 
        });
    }

    ngOnDestroy() {
        // 🔥 Desconectar observers
        this.intersectionObserver?.disconnect();
        this.mutationObserver?.disconnect();
    }
}
```

### 📊 Resumen de Patrones

| Patrón | Uso Recomendado | Ventaja |
|--------|-----------------|---------|
| `takeUntil(destroy$)` | Múltiples suscripciones | Control centralizado |
| `takeUntilDestroyed()` | Angular v16+ | Menos código boilerplate |
| `async` pipe | Templates | Automático, sin código |
| `take(1)` / `first()` | Una sola emisión | Auto-completa |
| `Subscription[]` | Suscripciones dinámicas | Flexibilidad |

### ⚠️ Errores Comunes a Evitar

```typescript
// ❌ MAL: Suscripción sin cleanup
ngOnInit() {
    this.myService.getData().subscribe(data => {
        this.data = data;
    });
}

// ❌ MAL: Olvidar limpiar event listeners
ngOnInit() {
    window.addEventListener('resize', this.onResize);
}

// ❌ MAL: No limpiar intervals
ngOnInit() {
    setInterval(() => this.update(), 1000);
}

// ❌ MAL: Suscripciones anidadas
this.service1.getData().subscribe(data1 => {
    this.service2.getData(data1.id).subscribe(data2 => {
        // Difícil de limpiar
    });
});

// ✅ BIEN: Usar switchMap para suscripciones anidadas
this.service1.getData().pipe(
    switchMap(data1 => this.service2.getData(data1.id)),
    takeUntil(this.destroy$)
).subscribe(data2 => {
    // Una sola suscripción para limpiar
});
```

---

**Última actualización:** Febrero 2026  
**Angular CLI:** v20.0.1  
**Proyecto:** Registro Envíos 3.0 - OLVA

