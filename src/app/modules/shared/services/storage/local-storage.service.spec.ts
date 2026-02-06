import { LocalStorageService } from './local-storage.service';

describe('LocalStorageService', () => {
    let service: LocalStorageService;
    let store: { [key: string]: string };

    beforeEach(() => {
        store = {};
        spyOn(globalThis.localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
        spyOn(globalThis.localStorage, 'setItem').and.callFake((key: string, value: string) => {
            store[key] = value;
        });
        spyOn(globalThis.localStorage, 'removeItem').and.callFake((key: string) => {
            delete store[key];
        });
        spyOn(globalThis.localStorage, 'clear').and.callFake(() => {
            store = {};
        });
        service = new LocalStorageService();
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
