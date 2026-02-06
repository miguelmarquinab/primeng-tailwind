export interface Toast {
    detail: string;
    summary?: string;
    severity: 'success' | 'error' | 'info' | 'warn';
}
