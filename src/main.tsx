import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter as Router } from 'react-router-dom';

import { TrayIcon } from '@tauri-apps/api/tray';
import { defaultWindowIcon } from '@tauri-apps/api/app';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Menu } from '@tauri-apps/api/menu';

import { register, unregisterAll, isRegistered } from '@tauri-apps/plugin-global-shortcut';
import { initStore } from './lib/store';

// --- State Tracking ---
let trayRef: any = null;
let shortcutsRegistered = false;    // Track if we are responsible for unregistering
let appInitializationComplete = false; // Prevent initializeApp running multiple times

// --- Constants ---
import { SHORTCUT_ENABLE, SHORTCUT_DISABLE, SHORTCUT_SHOW } from './lib/constants';

const debounceTimes: Record<string, number> = {};
const DEBOUNCE_DELAY = 300;

let store:any = null;

function debounce(shortcut: string, func: () => void) {
    const now = performance.now();
    const lastExecution = debounceTimes[shortcut] || 0;
    if (now - lastExecution > DEBOUNCE_DELAY) {
        debounceTimes[shortcut] = now;
        func();
    } else {
    }
}

// --- Interfaces ---
interface CustomTrayIconOptions {
    tooltip: string;
    menu: Menu;
    menuOnLeftClick: boolean;
    action: (event: any) => void;
    icon?: any; // Tray expects path or raw image data
}

// --- Window Shortcuts Functions ---

async function toggleWindowVisibility(appWindow: ReturnType<typeof getCurrentWindow>) {
    try {
        if (appWindow && typeof appWindow.isVisible === 'function') {
            if (await appWindow.isVisible() && await appWindow.isFocused()) {
                await appWindow.hide();
                await appWindow.setSkipTaskbar(true);
            } else {
                await appWindow.show();
                await appWindow.unminimize();
                await appWindow.setFocus();
                await appWindow.setSkipTaskbar(false);
            }
        } else {
            console.warn("toggleWindowVisibility: appWindow object invalid.");
        }
    } catch (error) {
        console.error("Error toggling window visibility:", error);
    }
}

export async function regGlobal() {
    try {

        await register(SHORTCUT_SHOW, () => {
            const currentWindow = getCurrentWindow();
            debounce(SHORTCUT_SHOW, async () => {
                await toggleWindowVisibility(currentWindow);
            });
        });
        // console.log("Global shortcut registered:", SHORTCUT_SHOW);
    }
    catch (error) {
        console.error("Error registering global shortcut:", error);
    }
}


// async function handleEnableShortcut() {
//     debounce(SHORTCUT_ENABLE, async () => { 
//         try {
//             while (!store);
//             store.set("enable", true); // Update store
//             console.log("Enable shortcut pressed, setting enable to true.");
//         } catch (error) {
//             console.error("Error handling enable shortcut:", error);
//         }
//     });
// }

// async function handleDisableShortcut() {
//     debounce(SHORTCUT_DISABLE, async () => { 
//         try {
//             while (!store);
//             store.set("enable", false); // Update store
//             console.log("Disable shortcut pressed, setting enable to false.");
//         } catch (error) {
//             console.error("Error handling disable shortcut:", error);
//         }
//     });
// }

// --- Main Application Initialization ---
async function initializeApp() {
    // Only run initialization once per page load
    store = await initStore()

    if (appInitializationComplete) {
        console.warn("initializeApp already completed. Skipping.");
        return;
    }
    // console.log("Starting App Initialization...");

    const appWindow = getCurrentWindow();

    // Skip setup for special windows (e.g., confirmation dialogs)
    if (appWindow.label.includes("confirmation")) {
        // console.log("Skipping setup for confirmation window.");
        appInitializationComplete = true;
        return;
    }

    // --- Global Shortcut Setup ---
    //   @ts-ignore
    let registrationAttempted = false;
    let registrationSuccess = true;
    try {
        // Clean up any shortcuts from previous development sessions
        // console.log("Attempting to unregister all previous shortcuts...");
        await unregisterAll();
        // console.log("Previous shortcuts potentially unregistered.");
    } catch (error) {
        console.warn("Could not unregister all shortcuts (might be none registered):", error);

    }

    try {
        registrationAttempted = true;

        if (!(await isRegistered(SHORTCUT_ENABLE))) {
            await register(SHORTCUT_ENABLE, () => {
                // handleEnableShortcut();
            });
        }

        if (!(await isRegistered(SHORTCUT_DISABLE))) {
            await register(SHORTCUT_DISABLE, () => {
                // handleDisableShortcut();
            });
        }

        if (!(await isRegistered(SHORTCUT_SHOW))) {
            // check if shortcuts is enabled or not 
            while (!store);
            const shortcuts = store.get("globalShortcuts");

            !shortcuts && regGlobal();
        } else {
            console.warn(`${SHORTCUT_SHOW} was already registered. Assuming control.`);
        }

        shortcutsRegistered = true;

    } catch (error) {
        console.error("Failed during global shortcut registration:", error);
        registrationSuccess = false;
        shortcutsRegistered = false;
    }


    // --- Title Bar Buttons Setup ---
    document
        .getElementById('titlebar-minimize')
        ?.addEventListener('click', () => appWindow.minimize());
    document
        .getElementById('titlebar-maximize')
        ?.addEventListener('click', () => appWindow.toggleMaximize());
    document
        .getElementById('titlebar-close')
        ?.addEventListener('click', async () => {
            // console.log("Title bar close clicked - hiding window.");
            await appWindow.hide();
            await appWindow.setSkipTaskbar(true);
        });


    // --- Tray Icon Setup ---
    if (!trayRef) { // Only create tray icon if it doesn't exist
        try {
            // console.log('Creating tray menu...');
            const menu = await Menu.new({
                items: [
                    { id: 'open', text: 'Open App', action: async () => { await appWindow.show(); await appWindow.setFocus(); await appWindow.setSkipTaskbar(false); console.log('Tray menu: Open clicked'); } },
                    { id: 'quit', text: 'Quit', action: async () => { await appWindow.close(); console.log('Tray menu: Quit clicked'); } }
                ],
            });


            const iconResult = await defaultWindowIcon();
        const options: CustomTrayIconOptions = {
            tooltip: 'If you forgot to shut it down, we\'ll do for you :)',
            menu,
            menuOnLeftClick: false,
            action: async (event: any) => {
                if (event.type === 'Click' && event.button === "Left") {
                    await appWindow.show();
                    await appWindow.setFocus();
                    await appWindow.setSkipTaskbar(false);
                }
            },
            icon: iconResult,
        };
        trayRef = await TrayIcon.new(options);
    } catch (error) {
        console.error("Failed during tray icon setup:", error);
    }

    }

    if (registrationSuccess) {
        appInitializationComplete = true;
    }
}
window.addEventListener("beforeunload", () => {

    if (trayRef) {
        trayRef.close();
        trayRef = null;
    }

});
// --- Application Cleanup Logic ---
window.addEventListener("beforeunload", async () => {

    if (shortcutsRegistered) {
        try { await unregisterAll(); shortcutsRegistered = false; } catch (error) { console.error("Error unregistering global shortcuts:", error); shortcutsRegistered = false; }
    }


    appInitializationComplete = false;
});

// --- Start the Application ---
initializeApp()
    .then(() => {
        // Only render the React App if initialization succeeded
        if (appInitializationComplete) {
            const rootElement = document.getElementById("root");
            if (rootElement) {
                ReactDOM.createRoot(rootElement).render(<Router> <App /> </Router>);
            } else {
                console.error("Fatal Error: Root element 'root' not found in HTML.");
            }
        } else {
            console.error("Skipping React rendering due to initialization errors.");
            const rootElement = document.getElementById("root");
            if (rootElement) {
                // Display error to user if init failed
                rootElement.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif;">Application initialization failed. Some features might not work. Check console (F12).</div>`;
            }
        }
    })
    .catch(error => { // Catch errors thrown during initializeApp
        console.error("Fatal Error during Application initialization:", error);
        const rootElement = document.getElementById("root");
        if (rootElement) {
            rootElement.innerHTML = `<div style="color: red; padding: 20px; font-family: sans-serif;">Failed to initialize the application. Check console (F12). Error: ${error}</div>`;
        }
    });