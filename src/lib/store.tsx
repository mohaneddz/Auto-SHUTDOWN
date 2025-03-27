import { Store } from "@tauri-apps/plugin-store";

export async function initStore() {
    try {
        const store = await Store.load('store.json');
        // console.log('Store initialized:', store);
        return store;

    } catch (error) {
        console.error('Error initializing store:', error);
        throw error;
    }
}