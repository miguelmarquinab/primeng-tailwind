import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LocalStorageService {
    localStorage: Storage;

    constructor() {
        this.localStorage = globalThis.localStorage;
    }

    get(key: string) {
        const item = this.localStorage.getItem(key);
        if (!item) {
            return null;
        }
        return JSON.parse(item);
    }

    set(key: string, value: any) {
        this.localStorage.setItem(key, JSON.stringify(value));
    }

    remove(key: string) {
        this.localStorage.removeItem(key);
    }

    clear() {
        this.localStorage.clear();
    }
}
