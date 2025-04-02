import { TrayIcon } from '@tauri-apps/api/tray';

type TrayIconOptions = {
    type: string;
    button: string;
    buttonState: string;
    rect: {
        position: {
            x: number;
            y: number;
        }
    }
}

const options = {
    action: (event: TrayIconOptions) => {
        switch (event.type) {
            case 'Click':
                console.log(
                    `mouse ${event.button} button pressed, state: ${event.buttonState}`
                );
                break;
            case 'DoubleClick':
                console.log(`mouse ${event.button} button pressed`);
                break;
            case 'Enter':
                console.log(
                    `mouse hovered tray at ${event.rect.position.x}, ${event.rect.position.y}`
                );
                break;
            case 'Move':
                console.log(
                    `mouse moved on tray at ${event.rect.position.x}, ${event.rect.position.y}`
                );
                break;
            case 'Leave':
                console.log(
                    `mouse left tray at ${event.rect.position.x}, ${event.rect.position.y}`
                );
                break;
        }
    },
};

// @ts-ignore
await TrayIcon.new(options);