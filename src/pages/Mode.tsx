import Button from '../components/Button';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconArrowBackUp, IconChevronUp, IconChevronDown } from '@tabler/icons-react';

import { initStore } from '../lib/store';

export default function Modes(): JSX.Element {
    const navigate = useNavigate();

    const [idle, setIdle] = useState(true);
    const [idleHours, setIdleHours] = useState(0);
    const [idleMinutes, setIdleMinutes] = useState(0);

    const [scheduleOff, setScheduleOff] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");

    const [timerOff, setTimerOff] = useState(true);
    const [timerHours, setTimerHours] = useState(0);
    const [timerMinutes, setTimerMinutes] = useState(0);

    const [store, setStore] = useState<any>(null);

    useEffect(() => {
        const init = async () => {
            setStore(await initStore());
        };
        init();
    }, []);

    const saveStore = async () => {
        await store.set('idle', { idle });
        await store.set('idleHours', { idleHours });
        await store.set('idleMinutes', { idleMinutes });
        await store.set('scheduleOff', { scheduleOff });
        await store.set('scheduleTime', { scheduleTime });
        await store.set('timerOff', { timerOff });
        await store.set('timerHours', { timerHours });
        await store.set('timerMinutes', { timerMinutes });
        console.log('Settings Saved:', await store.get('idle'), await store.get('idleHours'), await store.get('idleMinutes'), await store.get('scheduleOff'), await store.get('scheduleTime'), await store.get('timerOff'), await store.get('timerHours'), await store.get('timerMinutes'));
    };

    const goHome = () => {
        navigate('/');
    };

    const incrementHour = (
        setter: React.Dispatch<React.SetStateAction<number>>,
        currentValue: number
    ): void => {
        setter(currentValue + 1);
    };

    const decrementHour = (
        setter: React.Dispatch<React.SetStateAction<number>>,
        currentValue: number
    ): void => {
        if (currentValue > 0) {
            setter(currentValue - 1);
        }
    };

    const incrementMinute = (
        setter: React.Dispatch<React.SetStateAction<number>>,
        currentValue: number
    ): void => {
        setter(currentValue + 1);
    };

    const decrementMinute = (
        setter: React.Dispatch<React.SetStateAction<number>>,
        currentValue: number
    ): void => {
        if (currentValue > 0) {
            setter(currentValue - 1);
        }
    };

    useEffect(() => {
        if (timerHours === 24) {
            setTimerMinutes(0);
        }
    }, [timerHours, timerMinutes]);

    return (
        <div>
            <button onClick={goHome}>
                <IconArrowBackUp
                    size={48}
                    className="top-8 left-8 absolute w-16 h-16 text-bglight bg-white rounded-full hover:scale-105 active:scale-95 transition-transform duration-200"
                />
            </button>

            <h1 className="font-black text-5xl font-title text-center">Mode Selection
            </h1>

            <div
                className="grid h-min bg-accept/10 w-[95vw] rounded-xl shadow-lg mx-4 my-8 px-8 py-8 grid-cols-2 gap-y-6"
            >

                {/* IDLE SETTINGS! */}

                <label className="text-white text-2xl font-button">IDLE-Off</label>
                <input
                    type="checkbox"
                    className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none"
                    checked={idle}
                    onChange={(e) => setIdle(e.target.checked)}
                />

                <label className={`text-xl font-button ${!idle ? 'text-gray-disabled' : 'text-gray-400'}`}>  Maximum IDLE</label>
                <div className="justify-self-end space-x-4 flex items-center">
                    <div className="relative">
                        <input
                            type="number"
                            placeholder='H'
                            min={0}
                            value={idleHours}
                            className={`input-no-spinner w-12 h-8 justify-self-end text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!idle ? 'border-gray-500 text-gray-600' : 'border-emerald-500'}`}
                            onChange={(e) => setIdleHours(parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0)}
                            disabled={!idle}
                        />
                        <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                            <button
                                type="button"
                                className="focus:outline-none"
                                onClick={() => incrementHour(setIdleHours, idleHours)}
                                disabled={!idle}
                            >
                                <IconChevronUp size={16} color="green" />
                            </button>
                            <button
                                type="button"
                                className="focus:outline-none"
                                onClick={() => decrementHour(setIdleHours, idleHours)}
                                disabled={!idle}
                            >
                                <IconChevronDown size={16} color="green" />
                            </button>
                        </div>
                    </div>
                    <div className="relative ">
                        <input
                            type="number"
                            placeholder='M'
                            min={0}
                            value={idleMinutes}
                            className={`input-no-spinner w-12 h-8 justify-self-end text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!idle ? 'border-gray-500 text-gray-600' : 'border-emerald-500'}`}
                            onChange={(e) => setIdleMinutes(parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0)}
                            disabled={!idle}
                        />
                        <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                            <button
                                type="button"
                                className="focus:outline-none"
                                onClick={() => incrementMinute(setIdleMinutes, idleMinutes)}
                                disabled={!idle}
                            >
                                <IconChevronUp size={16} color="green" />
                            </button>
                            <button
                                type="button"
                                className="focus:outline-none"
                                onClick={() => decrementMinute(setIdleMinutes, idleMinutes)}
                                disabled={!idle}
                            >
                                <IconChevronDown size={16} color="green" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Schedule SETTINGS! */}

                <label className="text-white text-2xl font-button">Schedule-Off</label>
                <input
                    type="checkbox"
                    className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none"
                    checked={scheduleOff}
                    onChange={(e) => setScheduleOff(e.target.checked)}
                />
                <label className={`text-xl font-button ${!scheduleOff ? 'text-gray-disabled' : 'text-gray-400'}`}>  Time To Turn Off</label>
                <div className="justify-self-end space-x-4">
                    <input
                        className={`w-24 h-8 justify-self-end text-center appearance-none border-2 rounded-md focus:outline-none ${!scheduleOff ? 'border-gray-500 text-gray-600' : 'border-emerald-500'}`}
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        disabled={!scheduleOff}
                    >
                    </input>
                </div>

                {/* Timer SETTINGS! */}

                <label className="text-white text-2xl font-button">Timer-Off</label>
                <input
                    type="checkbox"
                    className="w-6 h-6 justify-self-end appearance-none border-2 border-emerald-500 rounded-md checked:bg-emerald-500 focus:outline-none"
                    checked={timerOff}
                    onChange={(e) => setTimerOff(e.target.checked)}
                    defaultChecked
                />
                <label className={`text-xl font-button ${!timerOff ? 'text-gray-disabled' : 'text-gray-400'}`}>  Countdown</label>
                <div className="justify-self-end space-x-4">
                    <div className="justify-self-end space-x-4 flex items-center">
                        <div className="relative">
                            <input
                                type="number"
                                placeholder='H'
                                min={0}
                                max={24}
                                value={timerHours}
                                className={`input-no-spinner w-12 h-8 justify-self-end text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!timerOff ? 'border-gray-500 text-gray-600' : 'border-emerald-500'}`}
                                onChange={(e) => setTimerHours(parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0)}
                                disabled={!timerOff}
                            />
                            <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                                <button
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => incrementHour(setTimerHours, timerHours)}
                                    disabled={!timerOff}
                                >
                                    <IconChevronUp size={16} color="green" />
                                </button>
                                <button
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => decrementHour(setTimerHours, timerHours)}
                                    disabled={!timerOff}
                                >
                                    <IconChevronDown size={16} color="green" />
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <input
                                type="number"
                                placeholder='M'
                                min={0}
                                max={59}
                                value={timerMinutes}
                                className={`input-no-spinner w-12 h-8 justify-self-end text-center appearance-none border-2 rounded-md focus:outline-none pr-6 ${!timerOff ? 'border-gray-500 text-gray-600' : 'border-emerald-500'}`}
                                onChange={(e) => setTimerMinutes(parseInt(e.target.value) >= 0 ? parseInt(e.target.value) : 0)}
                                disabled={!timerOff}
                            />
                            <div className="absolute right-1 top-0 h-full flex flex-col justify-center">
                                <button
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => incrementMinute(setTimerMinutes, timerMinutes)}
                                    disabled={!timerOff}
                                >
                                    <IconChevronUp size={16} color="green" />
                                </button>
                                <button
                                    type="button"
                                    className="focus:outline-none"
                                    onClick={() => decrementMinute(setTimerMinutes, timerMinutes)}
                                    disabled={!timerOff}
                                >
                                    <IconChevronDown size={16} color="green" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center w-screen items-center" >
                <Button onClick={saveStore} text='Save' bg="bg-unique" bgHover='hover:bg-unique-light' />
            </div>

        </div>

    );
}