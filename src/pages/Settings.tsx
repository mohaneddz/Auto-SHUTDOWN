import { IconArrowBackUp, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import { Store } from '@tauri-apps/plugin-store';
import { enable, isEnabled, disable } from '@tauri-apps/plugin-autostart';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { PhysicalSize } from "@tauri-apps/api/window";

import Button from '../components/Button';

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initStore } from '../lib/store';

import { unregisterAll} from '@tauri-apps/plugin-global-shortcut';
import { regGlobal } from '../main';

// const tray = await TrayIcon.new({});

export default function Settings(): JSX.Element {
    const navigate = useNavigate();

    const [viewScale, setViewScale] = useState<number>(1);
    const [autoStart, setAutoStart] = useState<boolean>(true);
    const [systemTray, setSystemTray] = useState<boolean>(true);
    const [audio, setAudio] = useState<boolean>(true);
    const [globalShortcuts, setGlobalShortcuts] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);

    const [store, setStore] = useState<Store | null>(null);

    const [_, setEnabled] = useState<boolean>(false);

    async function EnableAutostart() {
        await enable();
        setEnabled(await isEnabled());
    }

    async function DisableAutostart() {
        await disable();
        setEnabled(await isEnabled());
    }

    async function resizeWindow() {

        const appWindow = getCurrentWindow();

        document.documentElement.style.transform = `scale(${viewScale})`;
        document.documentElement.style.transformOrigin = "top left";

        if (!viewScale) return; // Prevent errors if viewScale is undefined

        const { width, height } = { width: 800, height: 1080 };

        const newWidth = Math.round(width * viewScale);
        const newHeight = Math.round(height * viewScale);

        if (viewScale !== 1)
            await appWindow.setSize(new PhysicalSize(newWidth, newHeight));
    }

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const storeInstance = await initStore();
                if (!storeInstance) {
                    console.error("Store initialization failed!");
                    setLoading(false);
                    return;
                }

                setStore(storeInstance);

                const [
                    scaleSetting,
                    autoStartSetting,
                    traySetting,
                    audioSetting,
                    shortcutsSetting
                ] = await Promise.all([
                    storeInstance.get<{ viewScale: number }>('viewScale'),
                    storeInstance.get<{ autoStart: boolean }>('autoStart'),
                    storeInstance.get<{ systemTray: boolean }>('systemTray'),
                    storeInstance.get<{ audio: boolean }>('audio'),
                    storeInstance.get<{ globalShortcuts: boolean }>('globalShortcuts')
                ]);

                setViewScale(scaleSetting?.viewScale ?? 1);
                setAutoStart(autoStartSetting?.autoStart ?? true);
                setSystemTray(traySetting?.systemTray ?? true);
                setAudio(audioSetting?.audio ?? true);
                setGlobalShortcuts(shortcutsSetting?.globalShortcuts ?? true);

                autoStartSetting?.autoStart ? EnableAutostart() : DisableAutostart();

            } catch (error) {
                console.error("Error loading settings:", error);
            } finally {
                setLoading(false);
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const goHome = () => {
        navigate('/');
    };

    const incrementScale = useCallback(() => {
        setViewScale((prevScale) =>
            prevScale < 1.5 ? Number((prevScale + 0.1).toFixed(1)) : prevScale
        );
    }, []);

    const decrementScale = useCallback(() => {
        setViewScale((prevScale) => Math.max(0.5, Number((prevScale - 0.1).toFixed(1))));
    }, []);

    async function saveStore() {
        if (!store) {
            console.error("Store not initialized, cannot save.");
            return;
        }
        console.log("Saving settings with values:", { viewScale, autoStart, systemTray, audio, globalShortcuts });
        try {
            resizeWindow();
            await store.set('viewScale', { viewScale });
            await store.set('autoStart', { autoStart });
            await store.set('systemTray', { systemTray });
            await store.set('audio', { audio });
            await store.set('globalShortcuts', { globalShortcuts });

            await store.save();

            // console.log('Settings Saved Successfully.');
            
            await unregisterAll();
            if (globalShortcuts) {
                regGlobal();
            } else {
                // console.log("Global shortcuts disabled.");
            }
            
            window.location.reload();
        } catch (error) {
            console.error("Error saving settings:", error);
        }
    };

    return (
        <div className=''>

            <button onClick={goHome} title="Go Back Home">
                <IconArrowBackUp
                    size={48}
                    className="absolute top-3 md:top-8 left-3 md:left-8 w-12 md:w-16 h-12 md:h-16 p-2 text-bglight/70 bg-slate-500 rounded-full hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
                />
            </button>

            <h1 className="font-black text-5xl font-title text-center pt-8 pb-4">Settings</h1>

            {loading && <div className="text-center text-white py-10">Loading settings...</div>}

            {!loading && (
                <>
                    <div
                        className="grid bg-accept/10 w-[95vw] max-w-2xl rounded-xl shadow-lg mx-auto my-8 px-8 py-8 space-y-6 items-center"
                        style={{ gridTemplateColumns: "1fr auto" }}
                    >
                        <label htmlFor="autoStartCheck" className="text-white text-2xl font-button">Auto-Start</label>
                        <input
                            id="autoStartCheck"
                            type="checkbox"
                            className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                            checked={autoStart}
                            onChange={(e) => setAutoStart(e.target.checked)}
                        />

                        <label htmlFor="systemTrayCheck" className="text-white text-2xl font-button">System Tray</label>
                        <input
                            id="systemTrayCheck"
                            type="checkbox"
                            className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                            checked={systemTray}
                            onChange={(e) => setSystemTray(e.target.checked)}
                        />

                        <label htmlFor="audioCheck" className="text-white text-2xl font-button">Audio</label>
                        <input
                            id="audioCheck"
                            type="checkbox"
                            className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                            checked={audio}
                            onChange={(e) => setAudio(e.target.checked)}
                        />

                        <label htmlFor="shortcutsCheck" className="text-white text-2xl font-button">Global Shortcuts</label>
                        <input
                            id="shortcutsCheck"
                            type="checkbox"
                            className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                            checked={globalShortcuts}
                            onChange={(e) => setGlobalShortcuts(e.target.checked)}
                        />

                        <label htmlFor="viewScaleInput" className="text-white text-2xl font-button">View Scale</label>
                        <div className="relative justify-self-end flex items-center">
                            <input
                                id="viewScaleInput"
                                type="number"
                                step="0.1"
                                min={0.5}
                                max={1.5}
                                value={viewScale}
                                className={`input-no-spinner w-16 h-8 text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${viewScale >= 0.5 ? 'border-emerald-500 text-white' : 'border-gray-500 text-gray-600'}`}
                                onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val)) {
                                        setViewScale(Math.max(0.5, Math.min(1.5, Number(val.toFixed(1)))));
                                    } else if (e.target.value === '') {
                                        setViewScale(0.5);
                                    }
                                }}
                            />
                            <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                                <button
                                    type="button"
                                    className="focus:outline-none h-1/2 flex items-center"
                                    onClick={incrementScale}
                                    aria-label="Increase view scale"
                                >
                                    <IconChevronUp size={16} className="text-emerald-500" />
                                </button>
                                <button
                                    type="button"
                                    className="focus:outline-none h-1/2 flex items-center"
                                    onClick={decrementScale}
                                    aria-label="Decrease view scale"
                                >
                                    <IconChevronDown size={16} className="text-emerald-500" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center w-[95vw] max-w-2xl mx-auto items-center pb-8">
                        <Button onClick={saveStore} text='Save' bg="bg-unique" bgHover='hover:bg-unique-light' />
                    </div>
                </>
            )}
        </div>
    );
}