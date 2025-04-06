import { useState, useEffect, useRef } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { initStore } from '../lib/store';

export default function Titlebar() {

    const appWindow = getCurrentWindow();
    const [tray, setTray] = useState<boolean>(false);
    const trayRef = useRef(tray);

    useEffect(() => {
        trayRef.current = tray;
    }, [tray]);

    const closeWindow = async () => {
        const currentTraySetting = trayRef.current;
        console.log("closeWindow called, current tray setting from ref:", currentTraySetting);

        if (appWindow.label.includes("confirmation") || !currentTraySetting)
            await appWindow.close();
        else {
            await appWindow.hide();
            await appWindow.setSkipTaskbar(true);
            // console.log("Closing window...");
        }
    };

    useEffect(() => {
        (async () => {
            // @ts-ignore
            let isMounted = await loadSettings();
            return () => {
                isMounted = false;
            };
        })();
    }, []);

    const loadSettings = async () => {
        let isMounted = true;
        try {
            const store = await initStore();
            if (store) {
                const setting = await store.get<{ systemTray: boolean }>('systemTray') ?? { systemTray: false };
                const trayEnabled = setting.systemTray;
                if (isMounted) {
                    setTray(trayEnabled);
                    // console.log("Tray setting loaded:", trayEnabled);
                }
            } else {
                console.warn("Store initialization failed.");
                if (isMounted) setTray(false);
            }
        } catch (error) {
            console.error("Error loading settings:", error);
            if (isMounted) setTray(false);
        }
        return isMounted;
    };

    return (
        <div data-tauri-drag-region className="titlebar -z-20">

            <button onClick={() => appWindow.minimize()} className="titlebar-button" id="titlebar-minimize">
                <img src="https://api.iconify.design/mdi:window-minimize.svg" alt="minimize" />
            </button>

            <button onClick={() => appWindow.toggleMaximize()} className="titlebar-button" id="titlebar-maximize">
                <img src="https://api.iconify.design/mdi:window-maximize.svg" alt="maximize" />
            </button>

            <button onMouseEnter={loadSettings} onClick={closeWindow} className="titlebar-button" id="titlebar-close">
                <img src="https://api.iconify.design/mdi:close.svg" alt="close" />
            </button>

        </div>
    );
}