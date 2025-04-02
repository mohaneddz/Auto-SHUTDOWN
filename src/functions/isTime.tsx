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

	// Parse stored time
	const [shutdownHour, shutdownMin] = shutdownData.scheduleTime.split(":").map(Number);

	return (currentHour === shutdownHour && currentMin === shutdownMin) || (isIdleEnabled && currIdle >= maxIdleTime);
}
