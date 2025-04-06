import { getCurrentWindow } from '@tauri-apps/api/window';
import { useEffect, useState, useRef } from 'react'; // Import useRef
import { invoke } from "@tauri-apps/api/core";
import { initStore } from './lib/store'; // Assuming this correctly initializes your store

import startSoundPath from "/sound start.mp3"; 
import tickSoundPath from "/sound tick.mp3"
import endSoundPath from "/sound end.mp3";   

export default function ConfirmationWindow() {

    // Use useRef for Audio objects to prevent recreation on every render
    const start_sound = useRef(new Audio(startSoundPath));
    const end_sound = useRef(new Audio(endSoundPath));
    const tick_sound = useRef(new Audio(tickSoundPath)); // Added tick sound

    let ticking_sound_interval = useRef<NodeJS.Timeout | null>(null);

    const [count, setCount] = useState<number>(60);
    const [stopped, setStopped] = useState<boolean>(false);
    // Initialize sounds state to null or undefined to indicate loading state
    const [soundsEnabled, setSoundsEnabled] = useState<boolean | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [initialSetupDone, setInitialSetupDone] = useState<boolean>(false); // Track if async setup finished

    const appWindow = getCurrentWindow(); // Okay to call here, likely cheap

    // Store the interval ID in a ref to safely clear it in cleanup/logic
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

    // Effect for initialization (fetching settings, playing start sound)
    useEffect(() => {
        let isMounted = true; // Flag to prevent state updates if unmounted

        const initialize = async () => {
            let useSounds = true; // Default assumption
            try {
                const store = await initStore();
                if (store) {
                    // Inside the try block, within if (store) { ... }

                    // 1. Get the setting object (or null/undefined)
                    //    Make 'sounds' optional in the type assertion for safety
                    const settingObj = await store.get<{ audio?: boolean }>('audio');

                    useSounds = settingObj?.audio ?? false;

                    // Add more detailed logging for debugging if needed:
                    console.log("Raw value from store for 'audio':", settingObj);
                    console.log("Determined useSounds:", useSounds);

                    // The rest of the 'if (store)' block can be removed if it only contained the old lines
                } else {
                    console.warn("Store initialization failed. Defaulting to sounds enabled.");
                }
            } catch (error) {
                console.error("Error fetching sound settings:", error);
                // Keep default useSounds = true in case of error
            } finally {
                // --- Critical Section ---
                // This block runs whether fetch succeeded or failed
                if (isMounted) {
                    setSoundsEnabled(useSounds); // Update state *after* async operation
                    // Play start sound *after* setting is determined and if component still mounted
                    if (useSounds) {
                        start_sound.current.play().catch((error) => {
                            // Don't log error if it's an abort error (e.g., component unmounted quickly)
                            if (error.name !== 'AbortError') {
                                console.error("Start sound playback failed:", error);
                            }
                        });
                        tick_sound_play(); // Start the tick sound loop if sounds are enabled
                    }
                    setInitialSetupDone(true); // Mark setup as complete
                }
                // --- End Critical Section ---
            }
        };

        initialize();

        // Cleanup function for the initialization effect
        return () => {
            isMounted = false;
            // Optional: Stop sound if it was playing, especially important if it looped
            start_sound.current.pause();
            start_sound.current.currentTime = 0; // Reset playback position
        };
    }, []); // Empty dependency array: Run only once on mount

    async function tick_sound_play() {
        ticking_sound_interval.current = setInterval(() => {
            tick_sound.current.play().catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error("Tick sound playback failed:", error);
                }
            });
        }, 1000);
    }

    function tick_sound_stop() {
        if (ticking_sound_interval.current) {
            clearInterval(ticking_sound_interval.current);
            ticking_sound_interval.current = null;
        }
    }

    // Effect for managing the countdown timer
    useEffect(() => {
        // Only start the timer *after* initial setup (including sound setting fetch) is done
        // and if not already closing/stopped.
        if (!initialSetupDone || isClosing || stopped) {
            // If timer was running, clear it
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
            return; // Don't start a new interval
        }

        // Start the interval
        intervalIdRef.current = setInterval(() => {
            setCount((prevCount) => {
                const newCount = prevCount - 1;

                if (newCount <= 0) {
                    if (intervalIdRef.current) clearInterval(intervalIdRef.current); // Clear interval
                    intervalIdRef.current = null;
                    setStopped(true); // Mark as stopped
                    shutdown();       // Initiate shutdown
                    return 0;         // Set count to 0
                }
                return newCount; // Continue countdown
            });
        }, 1000);

        // Cleanup function for the timer effect
        return () => {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        };
        // Dependencies: Start/stop timer based on these flags
    }, [initialSetupDone, isClosing, stopped]);

    function shutdown() {
        if (isClosing) return; // Prevent shutdown if already closing

        // No need to set isClosing here unless you want the UI disabled *during* shutdown invoke
        invoke("shutdown", {})
            .then(() => console.log("Shutdown command sent"))
            .catch((err) => console.error("Failed to invoke shutdown:", err));
    }

    function close() {
        if (isClosing) return; // Prevent multiple close calls

        // 1. Set flags immediately
        setIsClosing(true); // Disables buttons, changes text
        setStopped(true);   // Stops the timer via the useEffect dependency
        tick_sound_stop();

        // 2. Play end sound (check the state *after* it was set in useEffect)
        if (soundsEnabled === true) { // Explicit check for true
            end_sound.current.play().catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error("End sound playback failed:", error);
                }
            });
        }

        // 3. Schedule window close
        setTimeout(() => {
            appWindow.close().catch(err => console.error("Failed to close window:", err));
        }, soundsEnabled ? 2000 : 50); // Shorter delay if no sound is playing
    }

    // Loading state while fetching settings
    if (soundsEnabled === null) {
        return (
            <div className="h-screen w-screen flex justify-center items-center flex-col">
                <p className="text-white text-xl">Loading settings...</p>
                {/* Optional: Add a spinner here */}
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex justify-center items-center flex-col bg-gray-800/80 text-white">
            <h1 className="font-black text-3xl sm:text-4xl md:text-5xl font-title text-center mb-2 sm:mb-4">
                Warning!
            </h1>
            <div className="flex space-y-3 sm:space-y-4 flex-col mx-3 sm:m-6 md:m-8 justify-center items-center w-[95vw] max-w-2xl p-3 sm:p-4 md:p-6 bg-gray-700 rounded-lg shadow-md">
                <div className="flex flex-col justify-center w-full items-center">
                    <div className='text-xl sm:text-2xl my-4 sm:my-6 md:m-8 text-center px-2'>
                        {isClosing
                            ? "Closing..."
                            : (stopped ? "Shutdown Initiated" : `${count} Seconds before Shutdown`)
                        }
                    </div>
                    <div className="grid gap-3 sm:gap-4 md:gap-8 grid-cols-1 sm:grid-cols-2 w-full">
                        <button
                            onClick={close}
                            disabled={isClosing}
                            className={`
                                font-bold py-2 sm:py-3 px-4 sm:px-6 rounded text-base sm:text-lg w-full
                                ${isClosing
                                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }
                                transition-colors duration-200 ease-in-out
                            `}
                        >
                            Close
                        </button>
                        <button
                            onClick={shutdown}
                            disabled={isClosing}
                            className={`
                                font-bold py-2 sm:py-3 px-4 sm:px-6 rounded text-base sm:text-lg w-full
                                ${isClosing
                                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                                    : 'bg-emerald-500 hover:bg-emerald-700 text-white'
                                }
                                transition-colors duration-200 ease-in-out
                            `}
                        >
                            Shutdown Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}