import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter as Router } from 'react-router-dom';


import { TrayIcon } from '@tauri-apps/api/tray';
import { defaultWindowIcon } from '@tauri-apps/api/app';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Menu } from '@tauri-apps/api/menu';

let trayRef: any = null;

interface TrayIconOptions {
  tooltip: string;
  menu: Menu;
  menuOnLeftClick: boolean;
  action(event: any): void;
  icon: any;
}

async function initializeApp() {

  // Title bar buttons
  const appWindow = getCurrentWindow();

  if (appWindow.label.includes("confirmation")) return;

  document
    .getElementById('titlebar-minimize')
    ?.addEventListener('click', () => appWindow.minimize());
  document
    .getElementById('titlebar-maximize')
    ?.addEventListener('click', () => appWindow.toggleMaximize());
  document
    .getElementById('titlebar-close')
    ?.addEventListener('click', async () => {
      await appWindow.hide();
      await appWindow.setSkipTaskbar(true);
    });

  // Tray Icon Management :(
  const menu = await Menu.new({
    items: [
      {
        id: 'open',
        text: 'Open',
        action: async () => {
          await appWindow.show();
          await appWindow.setSkipTaskbar(false);
          console.log('open clicked');
        },
      },
      {
        id: 'quit',
        text: 'Quit',
        action: () => {
          console.log('quit clicked');
          appWindow.close();
        },
      }
    ],
  });

  // Create the tray icon
  const options: TrayIconOptions = {

    tooltip: 'If you forget to shut it down, we\'ll do :) ', menu,
    menuOnLeftClick: false,
    action(event: any) {
      switch (event.type) {
        case 'Click':
          if (event.button === "Left") {
            appWindow.show();
            appWindow.setSkipTaskbar(false);
          }
          break;
      }
    },
    icon: await defaultWindowIcon(),
  };


  trayRef = await TrayIcon.new(options);
}


window.addEventListener("beforeunload", () => {
  if (trayRef) {
    trayRef.close();
    trayRef = null;
  }
});
initializeApp().then(() => {
  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    // <React.StrictMode>
      <Router>
        <App />
      </Router>
    // </React.StrictMode>,
  );
});