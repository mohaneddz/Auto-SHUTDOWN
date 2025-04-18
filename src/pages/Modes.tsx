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
    const [timer, settimer] = useState<boolean>(true);
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
                    timerSetting,
                    timerHoursSetting,
                    timerMinutesSetting,
                ] = await Promise.all([
                    storeInstance.get<{ idle: boolean }>('idle'),
                    storeInstance.get<{ idleHours: number }>('idleHours'),
                    storeInstance.get<{ idleMinutes: number }>('idleMinutes'),
                    
                    storeInstance.get<{ scheduleOff: boolean }>('scheduleOff'),
                    storeInstance.get<{ scheduleTime: string }>('scheduleTime'),

                    storeInstance.get<{ timer: boolean }>('timer'),
                    storeInstance.get<{ timerHours: number }>('timerHours'),
                    storeInstance.get<{ timerMinutes: number }>('timerMinutes'),
                ]);

                setIdle(idleSetting?.idle ?? true);
                setIdleHours(idleHoursSetting?.idleHours ?? 0);
                setIdleMinutes(idleMinutesSetting?.idleMinutes ?? DEFAULT_IDLE_MINUTES);
                setScheduleOff(scheduleOffSetting?.scheduleOff ?? false);
                setScheduleTime(scheduleTimeSetting?.scheduleTime ?? defaultShutdownTime);
                settimer(timerSetting?.timer ?? true);
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
            timer,
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
                store.set('timer', { timer }),
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
        <div className="max-w-full overflow-x-hidden">
            <button 
                onClick={goHome} 
                title="Go Back Home"
                className="fixed h-max top-2 sm:top-3 md:top-8 left-2 sm:left-3 md:left-8 z-10"
            >
                <IconArrowBackUp
                    size={36}
                    className="w-12 h-12 sm:w-12 sm:h-12 md:w-16 md:h-16 p-2 text-bglight/70 bg-slate-500 rounded-full hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer"
                />
            </button>

            <h1 className="font-black text-3xl sm:text-4xl md:text-5xl font-title text-center pt-6 sm:pt-8 pb-2 sm:pb-4">Mode Selection</h1>

            {loading && <div className="text-center text-white py-10">Loading modes...</div>}

            {!loading && (
                <>
                    <div
                        className="grid bg-accept/10 w-[92%] sm:w-[85%] max-w-2xl rounded-xl shadow-lg mx-auto my-4 sm:my-6 md:my-8 px-3 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 gap-x-2 sm:gap-x-4 gap-y-3 sm:gap-y-4 md:gap-y-6 items-center"
                        style={{ gridTemplateColumns: "1fr auto" }}
                    >
                        {/* --- Idle Settings --- */}
                        <label htmlFor="idleCheck" className="text-white text-lg sm:text-xl md:text-2xl font-button">Idle-Off</label>
                        <input
                            id="idleCheck"
                            type="checkbox"
                            className="w-5 h-5 sm:w-6 sm:h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                            checked={idle}
                            onChange={(e) => setIdle(e.target.checked)}
                        />

                        <label htmlFor="idleHoursInput" className={`text-base sm:text-lg md:text-xl font-button ${!idle ? 'text-gray-disabled' : 'text-gray-400'}`}>Maximum Idle Time</label>
                        <div className="justify-self-end space-x-2 sm:space-x-4 flex items-center">
                            <div className="relative">
                                <input
                                    id="idleHoursInput"
                                    type="number"
                                    placeholder="H"
                                    min={0}
                                    value={idle ? idleHours : ""}
                                    className={`input-no-spinner w-12 sm:w-14 h-7 sm:h-8 text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!idle ? 'border-gray-500 text-gray-600 bg-gray-700' : 'border-emerald-500 text-white'}`}
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
                                        <IconChevronUp size={14} className={!idle ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!idle ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => decrementIdleHour(idleHours, -1)}
                                        disabled={!idle}
                                        aria-label="Decrease idle hours"
                                    >
                                        <IconChevronDown size={14} className={!idle ? 'text-gray-500' : 'text-emerald-500'} />
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
                                    className={`input-no-spinner w-12 sm:w-14 h-7 sm:h-8 text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!idle ? 'border-gray-500 text-gray-600 bg-gray-700' : 'border-emerald-500 text-white'}`}
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
                                        <IconChevronUp size={14} className={!idle ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!idle ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => decrementIdleMinute(idleMinutes, -1)}
                                        disabled={!idle}
                                        aria-label="Decrease idle minutes"
                                    >
                                        <IconChevronDown size={14} className={!idle ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* --- Schedule Settings --- */}
                        <label htmlFor="scheduleCheck" className="text-white text-lg sm:text-xl md:text-2xl font-button">Schedule-Off</label>
                        <input
                            id="scheduleCheck"
                            type="checkbox"
                            className="w-5 h-5 sm:w-6 sm:h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                            checked={scheduleOff}
                            onChange={(e) => setScheduleOff(e.target.checked)}
                        />
                        <label htmlFor="scheduleTimeInput" className={`text-base sm:text-lg md:text-xl font-button ${!scheduleOff ? 'text-gray-disabled' : 'text-gray-400'}`}>Time To Turn Off</label>
                        <div className="justify-self-end">
                            <input
                                id="scheduleTimeInput"
                                className={`w-24 sm:w-28 h-7 sm:h-8 px-2 text-center appearance-none border-2 rounded-md focus:outline-none ${!scheduleOff ? 'border-gray-500 text-gray-600 bg-gray-700' : 'border-emerald-500 text-white'}`}
                                type="time"
                                value={scheduleOff ? scheduleTime : " "}
                                onChange={(e) => setScheduleTime(e.target.value)}
                                disabled={!scheduleOff}
                            />
                        </div>

                        {/* --- Timer Settings --- */}
                        <label htmlFor="timerCheck" className="text-white text-lg sm:text-xl md:text-2xl font-button">Timer-Off</label>
                        <input
                            id="timerCheck"
                            type="checkbox"
                            className="w-5 h-5 sm:w-6 sm:h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 cursor-pointer"
                            checked={timer}
                            onChange={(e) => settimer(e.target.checked)}
                        />

                        <label htmlFor="timerHoursInput" className={`text-base sm:text-lg md:text-xl font-button ${!timer ? 'text-gray-disabled' : 'text-gray-400'}`}>Countdown Timer</label>
                        <div className="justify-self-end space-x-2 sm:space-x-4 flex items-center">
                            <div className="relative">
                                <input
                                    id="timerHoursInput"
                                    type="number"
                                    placeholder="H"
                                    min={0}
                                    max={23}
                                    value={timer ? timerHours : ""}
                                    className={`input-no-spinner w-12 sm:w-14 h-7 sm:h-8 text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!timer ? 'border-gray-500 text-gray-600 bg-gray-700' : 'border-emerald-500 text-white'}`}
                                    onChange={(e) => handleNumberChange(e, setTimerHours, 23)}
                                    disabled={!timer}
                                />

                                <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!timer ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => incrementTimerHour(timerHours, 1)}
                                        disabled={!timer}
                                        aria-label="Increase timer hours"
                                    >
                                        <IconChevronUp size={14} className={!timer ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!timer ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => decrementTimerHour(timerHours, -1)}
                                        disabled={!timer}
                                        aria-label="Decrease timer hours"
                                    >
                                        <IconChevronDown size={14} className={!timer ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                </div>
                            </div>
                            <span className={`font-bold ${!timer ? 'text-gray-600' : 'text-white'}`}>:</span>
                            <div className="relative">
                                <input
                                    id="timerMinutesInput"
                                    type="number"
                                    placeholder="M"
                                    min={0}
                                    max={59}
                                    value={timer ? timerMinutes : ""}
                                    className={`input-no-spinner w-12 sm:w-14 h-7 sm:h-8 text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!timer ? 'border-gray-500 text-gray-600 bg-gray-700' : 'border-emerald-500 text-white'}`}
                                    onChange={(e) => handleNumberChange(e, setTimerMinutes, 59)}
                                    disabled={!timer}
                                />
                                <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!timer ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => incrementTimerMinute(timerMinutes, 1)}
                                        disabled={!timer}
                                        aria-label="Increase timer minutes"
                                    >
                                        <IconChevronUp size={14} className={!timer ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                    <button
                                        type="button"
                                        className={`focus:outline-none h-1/2 flex items-center ${!timer ? 'cursor-not-allowed' : ''}`}
                                        onClick={() => decrementTimerMinute(timerMinutes, -1)}
                                        disabled={!timer}
                                        aria-label="Decrease timer minutes"
                                    >
                                        <IconChevronDown size={14} className={!timer ? 'text-gray-500' : 'text-emerald-500'} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center w-[92%] sm:w-[85%] max-w-2xl mx-auto items-center pb-4 sm:pb-6 md:pb-8">
                        <Button onClick={saveStore} text="Save" bg="bg-unique" bgHover="hover:bg-unique-light" />
                    </div>
                </>
            )}
        </div>
    );
}
