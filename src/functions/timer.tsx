import { invoke } from '@tauri-apps/api/core';

type Time = {
	min: number;
	hour: number;
};

// export default function isTime(time: Time): Promise<string> {
export default async function isTime(): Promise<string> {
	const now: Date = new Date();
	// if (now.getHours() === time.hour && now.getMinutes() === time.min) {
	const st: & string = "Mohaned";
	// const hello: string = await invoke('greet', {st});
	// return hello;
	// }

	return "Hello World!";
}
