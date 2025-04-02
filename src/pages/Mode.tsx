import Button from '../components/Button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowBackUp, IconChevronUp, IconChevronDown } from '@tabler/icons-react';
import { initStore } from '../lib/store';
import { Store } from '@tauri-apps/plugin-store';

// Sensible defaults
const DEFAULT_IDLE_MINUTES = 15;
const DEFAULT_TIMER_MINUTES = 30;

export default function Modes(): JSX.Element {
    const navigate = useNavigate();
    const defaultShutdownTime = "00:00";
    // State for mode settings
    const [idle, setIdle] = useState<boolean>(true);
    const [idleHours, setIdleHours] = useState<number>(0);
    const [idleMinutes, setIdleMinutes] = useState<number>(DEFAULT_IDLE_MINUTES);
    const [scheduleOff, setScheduleOff] = useState<boolean>(false);
    const [scheduleTime, setScheduleTime] = useState<string>(defaultShutdownTime);
    const [timerOff, setTimerOff] = useState<boolean>(true);
    const [timerHours, setTimerHours] = useState<number>(0);
    const [timerMinutes, setTimerMinutes] = useState<number>(DEFAULT_TIMER_MINUTES);
    const [loading, setLoading] = useState<boolean>(true);
    const [store, setStore] = useState<Store | null>(null);

    // Load settings from the store on mount
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
                    idleSetting,
                    idleHoursSetting,
                    idleMinutesSetting,
                    scheduleOffSetting,
                    scheduleTimeSetting,
                    timerOffSetting,
                    timerHoursSetting,
                    timerMinutesSetting,
                ] = await Promise.all([
                    storeInstance.get<{ idle: boolean }>('idle'),
                    storeInstance.get<{ idleHours: number }>('idleHours'),
                    storeInstance.get<{ idleMinutes: number }>('idleMinutes'),
                    storeInstance.get<{ scheduleOff: boolean }>('scheduleOff'),
                    storeInstance.get<{ scheduleTime: string }>('scheduleTime'),
                    storeInstance.get<{ timerOff: boolean }>('timerOff'),
                    storeInstance.get<{ timerHours: number }>('timerHours'),
                    storeInstance.get<{ timerMinutes: number }>('timerMinutes'),
                ]);

                setIdle(idleSetting?.idle ?? true);
                setIdleHours(idleHoursSetting?.idleHours ?? 0);
                setIdleMinutes(idleMinutesSetting?.idleMinutes ?? DEFAULT_IDLE_MINUTES);
                setScheduleOff(scheduleOffSetting?.scheduleOff ?? false);
                setScheduleTime(scheduleTimeSetting?.scheduleTime ?? defaultShutdownTime);
                setTimerOff(timerOffSetting?.timerOff ?? true);
                setTimerHours(timerHoursSetting?.timerHours ?? 0);
                setTimerMinutes(timerMinutesSetting?.timerMinutes ?? DEFAULT_TIMER_MINUTES);
            } catch (error) {
                console.error("Error loading mode settings:", error);
            } finally {
                setLoading(false);
            }
        };

        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Function to save all settings to the store
    const saveStore = async () => {
        if (!store) {
            console.error("Store not initialized, cannot save.");
            return;
        }
        console.log('Saving mode settings:', {
            idle,
            idleHours,
            idleMinutes,
            scheduleOff,
            scheduleTime,
            timerOff,
            timerHours,
            timerMinutes,
        });
        try {
            await Promise.all([
                store.set('idle', { idle }),
                store.set('idleHours', { idleHours }),
                store.set('idleMinutes', { idleMinutes }),
                store.set('scheduleOff', { scheduleOff }),
                store.set('scheduleTime', { scheduleTime }),
                store.set('timerOff', { timerOff }),
                store.set('timerHours', { timerHours }),
                store.set('timerMinutes', { timerMinutes }),
            ]);
            await store.save();
            console.log('Mode Settings Saved Successfully.');
        } catch (error) {
            console.error("Error saving mode settings:", error);
        }
    };

    const goHome = () => {
        navigate('/');
    };

    // Utility for creating time setters for hours and minutes
    const createTimeSetter = (
        setter: React.Dispatch<React.SetStateAction<number>>,
        max?: number,
        min: number = 0
    ) => {
        return (currentValue: number, delta: number) => {
            let newValue = currentValue + delta;
            if (max !== undefined) {
                newValue = Math.min(newValue, max);
            }
            newValue = Math.max(newValue, min);
            setter(newValue);
        };
    };

    const incrementIdleHour = createTimeSetter(setIdleHours);
    const decrementIdleHour = createTimeSetter(setIdleHours);
    const incrementIdleMinute = createTimeSetter(setIdleMinutes, 59);
    const decrementIdleMinute = createTimeSetter(setIdleMinutes, 59);

    const incrementTimerHour = createTimeSetter(setTimerHours, 23);
    const decrementTimerHour = createTimeSetter(setTimerHours, 23);
    const incrementTimerMinute = createTimeSetter(setTimerMinutes, 59);
    const decrementTimerMinute = createTimeSetter(setTimerMinutes, 59);

    // Handle number input changes with validation
    const handleNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<number>>,
        max?: number,
        min: number = 0
    ) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value)) {
            value = min;
        }
        if (max !== undefined) {
            value = Math.min(value, max);
        }
        value = Math.max(value, min);
        setter(value);
    };

    return (
        <div>
            <button onClick={goHome} title="Go Back Home">
                <IconArrowBackUp
                    size={48}
                    className="absolute top-3 md:top-8 left-3 md:left-8 w-12 md:w-16 h-12 md:h-16 p-2 text-bglight/70 bg-slate-500 rounded-full hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
                />
            </button>

            <h1 className="font-black text-5xl font-title text-center pt-8 pb-4">Mode Selection</h1>

            {loading && <div className="text-center text-white py-10">Loading modes...</div>}

            {!loading && (
                <>
                    <div
                        className="grid bg-accept/10 w-[95vw] max-w-2xl rounded-xl shadow-lg mx-auto my-8 px-8 py-8 items-center gap-x-4 gap-y-6"
                        style={{ gridTemplateColumns: "1fr auto" }}
                    >
                        {/* --- Idle Settings --- */}
                        <label htmlFor="idleCheck" className="text-white text-2xl font-button">Idle-Off</label>
                        <input
                            id="idleCheck"
                            type="checkbox"
                            className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                            checked={idle}
                            onChange={(e) => setIdle(e.target.checked)}
                        />

                        <label htmlFor="idleHoursInput" className={`text-xl font-button ${!idle ? 'text-gray-disabled' : 'text-gray-400'}`}>  Maximum Idle Time</label>
                        <div className="justify-self-end space-x-4 flex items-center">
                            <div className="relative">
                                <input
                                    id="idleHoursInput"
                                    type="number"
                                    placeholder="H"
                                    min={0}
                                    value={idle ? idleHours : ""}
                                    className={`input-no-spinner w-14 h-8 text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!idle ? 'border-gray-500 text-gray-600 bg-gray-700' : 'border-emerald-500 text-white'}`}
                                    onChange={(e) => handleNumberChange(e, setIdleHours)}
                                    disabled={!idle}
                                />

                                <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!idle ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => incrementIdleHour(idleHours, 1)}
                                        disabled={!idle}
                                        aria-label="Increase idle hours"
                                    >
                                        <IconChevronUp size={16} className={!idle ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!idle ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => decrementIdleHour(idleHours, -1)}
                                        disabled={!idle}
                                        aria-label="Decrease idle hours"
                                    >
                                        <IconChevronDown size={16} className={!idle ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                </div>
                            </div>
                            <span className={`font-bold ${!idle ? 'text-gray-600' : 'text-white'}`}>:</span>
                            <div className="relative">
                                <input
                                    id="idleMinutesInput"
                                    type="number"
                                    placeholder="M"
                                    min={0}
                                    max={59}
                                    value={idle ? idleMinutes : ""}
                                    className={`input-no-spinner w-14 h-8 text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!idle ? 'border-gray-500 text-gray-600 bg-gray-700' : 'border-emerald-500 text-white'}`}
                                    onChange={(e) => handleNumberChange(e, setIdleMinutes, 59)}
                                    disabled={!idle}
                                />
                                <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!idle ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => incrementIdleMinute(idleMinutes, 1)}
                                        disabled={!idle}
                                        aria-label="Increase idle minutes"
                                    >
                                        <IconChevronUp size={16} className={!idle ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!idle ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => decrementIdleMinute(idleMinutes, -1)}
                                        disabled={!idle}
                                        aria-label="Decrease idle minutes"
                                    >
                                        <IconChevronDown size={16} className={!idle ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* --- Schedule Settings --- */}
                        <label htmlFor="scheduleCheck" className="text-white text-2xl font-button">Schedule-Off</label>
                        <input
                            id="scheduleCheck"
                            type="checkbox"
                            className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                            checked={scheduleOff}
                            onChange={(e) => setScheduleOff(e.target.checked)}
                        />
                        <label htmlFor="scheduleTimeInput" className={`text-xl font-button ${!scheduleOff ? 'text-gray-disabled' : 'text-gray-400'}`}>  Time To Turn Off</label>
                        <div className="justify-self-end">
                            <input
                                id="scheduleTimeInput"
                                className={`w-28 h-8 px-2 text-center appearance-none border-2 rounded-md focus:outline-none ${!scheduleOff ? 'border-gray-500 text-gray-600 bg-gray-700' : 'border-emerald-500 text-white'}`}
                                type="time"
                                value={scheduleOff ? scheduleTime : " "}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                disabled={!scheduleOff}
                            />
                        </div>

                        {/* --- Timer Settings --- */}
                        <label htmlFor="timerCheck" className="text-white text-2xl font-button">Timer-Off</label>
                        <input
                            id="timerCheck"
                            type="checkbox"
                            className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                            checked={timerOff}
                            onChange={(e) => setTimerOff(e.target.checked)}
                        />

                        <label htmlFor="timerHoursInput" className={`text-xl font-button ${!timerOff ? 'text-gray-disabled' : 'text-gray-400'}`}>  Countdown Timer</label>
                        <div className="justify-self-end space-x-4 flex items-center">
                            <div className="relative">
                                <input
                                    id="timerHoursInput"
                                    type="number"
                                    placeholder="H"
                                    min={0}
                                    max={23}
                                    value={timerOff ? timerHours : ""}
                                    className={`input-no-spinner w-14 h-8 text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!timerOff ? 'border-gray-500 text-gray-600 bg-gray-700' : 'border-emerald-500 text-white'}`}
                                    onChange={(e) => handleNumberChange(e, setTimerHours, 23)}
                                    disabled={!timerOff}
                                />

                                <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!timerOff ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => incrementTimerHour(timerHours, 1)}
                                        disabled={!timerOff}
                                        aria-label="Increase timer hours"
                                    >
                                        <IconChevronUp size={16} className={!timerOff ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!timerOff ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => decrementTimerHour(timerHours, -1)}
                                        disabled={!timerOff}
                                        aria-label="Decrease timer hours"
                                    >
                                        <IconChevronDown size={16} className={!timerOff ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                </div>
                            </div>
                            <span className={`font-bold ${!timerOff ? 'text-gray-600' : 'text-white'}`}>:</span>
                            <div className="relative">
                                <input
                                    id="timerMinutesInput"
                                    type="number"
                                    placeholder="M"
                                    min={0}
                                    max={59}
                                    value={timerOff ? timerMinutes : ""}
                                    className={`input-no-spinner w-14 h-8 text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!timerOff ? 'border-gray-500 text-gray-600 bg-gray-700' : 'border-emerald-500 text-white'}`}
                                    onChange={(e) => handleNumberChange(e, setTimerMinutes, 59)}
                                    disabled={!timerOff}
                                />
                                <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!timerOff ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => incrementTimerMinute(timerMinutes, 1)}
                                        disabled={!timerOff}
                                        aria-label="Increase timer minutes"
                                    >
                                        <IconChevronUp size={16} className={!timerOff ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!timerOff ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => decrementTimerMinute(timerMinutes, -1)}
                                        disabled={!timerOff}
                                        aria-label="Decrease timer minutes"
                                    >
                                        <IconChevronDown size={16} className={!timerOff ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center w-[95vw] max-w-2xl mx-auto items-center pb-8">
                        <Button onClick={saveStore} text="Save" bg="bg-unique" bgHover="hover:bg-unique-light" />
                    </div>
                </>
            )}
        </div>
    );
}
