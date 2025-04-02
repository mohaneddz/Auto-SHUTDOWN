import { initStore } from '../lib/store';
import { invoke } from '@tauri-apps/api/core';

export default async function isTime(): Promise<boolean> {

	type shutdownData = {
		scheduleTime: string;
	};

	const store = await initStore();

	// SCHEDULE HANDLING SECTION ---------------------------------------------------------

	const date = new Date();
	const [currentHour, currentMin] = [date.getHours(), date.getMinutes()];

	if (!store) return false;

	const shutdownData: shutdownData = await store.get('scheduleTime') ?? { scheduleTime: "11:00" };

	// IDLE HANDLING SECTION ---------------------------------------------------------

	const canIdle = await store.get<{ idle: boolean }>('idle');
	const idleHoursData = await store.get<{ idleHours: number }>('idleHours');
	const idleMinutesData = await store.get<{ idleMinutes: number }>('idleMinutes');

	const isIdleEnabled: boolean = canIdle?.idle ?? false;
	const idleHours: number = idleHoursData?.idleHours ?? 0;
	const idleMinutes: number = idleMinutesData?.idleMinutes ?? 0;

	const maxIdleTime: number = (idleHours * 3600) + idleMinutes * 60;

	let currIdle: number = await invoke("get_system_idle_time");
	currIdle = Number(currIdle);

	if (!shutdownData || !shutdownData.scheduleTime) return false;

	// TIMER HANDLING SECTION ---------------------------------------------------------

	const timerOffData = await store.get<{ timer: boolean }>('timer');
	const timerHoursData = await store.get<{ timerHours: number }>('timerHours');
	const timerMinutesData = await store.get<{ timerMinutes: number }>('timerMinutes');

	const isTimerEnabled: boolean = timerOffData?.timer ?? false;
	const timerHours: number = timerHoursData?.timerHours ?? 0;
	const timerMinutes: number = timerMinutesData?.timerMinutes ?? 0;

	// get time since launch
	let timeSinceLaunch: number = await invoke("get_uptime");
	// Convert to seconds if the value is in milliseconds
	timeSinceLaunch = Number(timeSinceLaunch) / 60000;

	const maxTime: number = (timerHours * 3600) + timerMinutes * 60;

	// Only evaluate timer condition if timer is enabled
	let passed: boolean = isTimerEnabled && timeSinceLaunch >= maxTime;

	// console.log("TIMER ENABLED:", isTimerEnabled);
	// console.log("Time since launch (seconds):", timeSinceLaunch);
	// console.log("Max time (seconds):", maxTime);
	// console.log("Timer condition passed:", passed);
	// console.log("--------------------------------");

	// Parse stored time
	const [shutdownHour, shutdownMin] = shutdownData.scheduleTime.split(":").map(Number);
	const isTime = passed || (currentHour === shutdownHour && currentMin === shutdownMin) || (isIdleEnabled && currIdle >= maxIdleTime)
	console.log("IS TIME? ", isTime);
	// Return true if any of the conditions are met
	return isTime;
}