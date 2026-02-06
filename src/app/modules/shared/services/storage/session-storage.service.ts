import { Injectable } from '@angular/core';
import { StorageInterface } from './storage.interface';

@Injectable({
    providedIn: 'root'
})
export class SessionStorageService implements StorageInterface {
    sessionStorage: Storage;

    constructor() {
        this.sessionStorage = globalThis.sessionStorage;
    }

    get(key: string) {
        const item = this.sessionStorage.getItem(key);
        if (!item) {
            return null;
        }
        return JSON.parse(item);
    }

    set(key: string, value: any) {
        this.sessionStorage.setItem(key, JSON.stringify(value));
    }

    setPlain(key: string, value: any) {
        this.sessionStorage.setItem(key, value);
    }

    getPlain(key: string) {
        return this.sessionStorage.getItem(key);
    }

    remove(key: string) {
        this.sessionStorage.removeItem(key);
    }

    clear() {
        this.sessionStorage.clear();
    }
}
