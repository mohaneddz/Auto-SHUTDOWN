import Button from '../components/Button';

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowBackUp, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
// import { useEffect } from 'react'
// import {invoke} from "@tauri-apps/api/core"
// import { isTauri } from '@tauri-apps/api/core';
import { initStore } from '../lib/store';

export default function Settings(): JSX.Element {
    const navigate = useNavigate();

    const [viewScale, setViewScale] = useState<number>(1);
    const [autoStart, setAutoStart] = useState<boolean>(true);
    const [systemTray, setSystemTray] = useState<boolean>(true);
    const [audio, setAudio] = useState<boolean>(true);
    const [globalShortcuts, setGlobalShortcuts] = useState<boolean>(true);

    const [store, setStore] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            setStore(await initStore());
        };
        init();
    }, []);

    const goHome = () => {
        navigate('/');
    };

    const incrementScale = useCallback(() => {
        setViewScale((prevScale) =>
            prevScale < 1.5 ? Number((prevScale + 0.1).toFixed(1)) : prevScale
        );
    }, [setViewScale]);

    const decrementScale = useCallback(() => {
        setViewScale((prevScale) => Math.max(0.5, Number((prevScale - 0.1).toFixed(1))));
    }, [setViewScale]);

    const saveStore = useCallback(async () => {
        await store.set('viewScale', { viewScale });
        await store.set('autoStart', { autoStart });
        await store.set('systemTray', { systemTray });
        await store.set('audio', { audio });
        await store.set('globalShortcuts', { globalShortcuts });
        console.log('Settings Saved:', await store.get('viewScale'), await store.get('autoStart'), await store.get('systemTray'), await store.get('audio'), await store.get('globalShortcuts'));
    }, [viewScale, autoStart, systemTray, audio, globalShortcuts]);

    useEffect(() => {
        saveStore();
    }, [saveStore]);

    return (
        <div className=''>

            <button onClick={goHome}>
                <IconArrowBackUp
                    size={48}
                    className="top-8 left-8 absolute w-16 h-16 text-bglight bg-white rounded-full hover:scale-105 active:scale-95 transition-transform duration-200"
                />
            </button>

            <h1 className="font-black text-5xl font-title text-center">Settings</h1>

            <div
                className="grid h-min bg-accept/10 w-[95vw] rounded-xl shadow-lg mx-4 my-8 px-8 py-8 space-y-6"
                style={{ gridTemplateColumns: "auto auto" }}
            >
                <label className="text-white text-2xl font-button">Auto-Start</label>
                <input
                    type="checkbox"
                    className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none"
                    checked={autoStart}
                    onChange={(e) => setAutoStart(e.target.checked)}
                />

                <label className="text-white text-2xl font-button">System Tray</label>
                <input
                    type="checkbox"
                    className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none"
                    checked={systemTray}
                    onChange={(e) => setSystemTray(e.target.checked)}
                />

                <label className="text-white text-2xl font-button">Audio</label>
                <input
                    type="checkbox"
                    className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none"
                    checked={audio}
                    onChange={(e) => setAudio(e.target.checked)}
                />

                <label className="text-white text-2xl font-button">Global Shortcuts</label>
                <input
                    type="checkbox"
                    className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none"
                    checked={globalShortcuts}
                    onChange={(e) => setGlobalShortcuts(e.target.checked)}
                />

                <label className="text-white text-2xl font-button">View Scale</label>
                <div className="relative justify-self-end flex items-center">
                    <input
                        type="number"
                        placeholder="1"
                        min={0}
                        max={1.5}
                        value={viewScale}
                        className={`input-no-spinner w-16 h-8 text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${viewScale >= 0 ? 'border-emerald-500' : 'border-gray-500 text-gray-600'}`}
                        onChange={(e) => setViewScale(Number(e.target.value))}
                    />
                    <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                        <button
                            type="button"
                            className="focus:outline-none"
                            onClick={incrementScale}
                        >
                            <IconChevronUp size={16} color="green" />
                        </button>
                        <button
                            type="button"
                            className="focus:outline-none"
                            onClick={decrementScale}
                        >
                            <IconChevronDown size={16} color="green" />
                        </button>
                    </div>
                </div>

            </div>
            <div className="flex justify-center w-screen items-center " >
                <Button onClick={saveStore} text='Save' bg="bg-unique" bgHover='hover:bg-unique-light text-2xl' />
            </div>
        </div>

    );
}