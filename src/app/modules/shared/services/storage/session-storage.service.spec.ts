import { SessionStorageService } from './session-storage.service';

describe('SessionStorageService', () => {
    let service: SessionStorageService;
    let store: { [key: string]: string };

    beforeEach(() => {
        store = {};
        spyOn(globalThis.sessionStorage, 'getItem').and.callFake((key: string) => store[key] || null);
        spyOn(globalThis.sessionStorage, 'setItem').and.callFake((key: string, value: string) => {
            store[key] = value;
        });
        spyOn(globalThis.sessionStorage, 'removeItem').and.callFake((key: string) => {
            delete store[key];
        });
        spyOn(globalThis.sessionStorage, 'clear').and.callFake(() => {
            store = {};
        });
        service = new SessionStorageService();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should set and get a value', () => {
        service.set('key', { foo: 'bar' });
        expect(service.get('key')).toEqual({ foo: 'bar' });
    });

    it('should return null if key does not exist', () => {
        expect(service.get('not-exist')).toBeNull();
    });

    it('should remove a value', () => {
        service.set('key', { foo: 'bar' });
        service.remove('key');
        expect(service.get('key')).toBeNull();
    });

    it('should clear all values', () => {
        service.set('key1', { foo: 1 });
        service.set('key2', { bar: 2 });
        service.clear();
        expect(service.get('key1')).toBeNull();
        expect(service.get('key2')).toBeNull();
    });
});
