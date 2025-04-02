import { load } from '@tauri-apps/plugin-store';

export async function initStore() {
    // @ts-ignore
    if (window.__TAURI__) {
        try {
            const store = await load('store.json', { autoSave: false });
            // console.log('Store initialized:', store);
            return store;
        } catch (error) {
            console.error('Error initializing store:', error);
            throw error;
        }
    } else {
        console.error('Tauri environment is not available.');
        return null;
    }
}
