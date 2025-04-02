import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Settings from './pages/Settings';
import Mode from './pages/Mode';
import Confirmation from './confirmation';

import Titlebar from './components/Titlebar';

import { initStore } from './lib/store';
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { getCurrentWindow } from '@tauri-apps/api/window';
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

import isTime from './functions/isTime';

function App() {
  
  async function checkTime() {
    try {
      const isShutdownTime = await isTime();

      if (isShutdownTime) {
        // console.log("Shutdown time reached!");
        getConfirmationWindow();
      } else {
        // console.log("Not shutdown time yet!");
      }
    } catch (error) {
      console.error("Error checking time:", error);
    }
  }

  async function getConfirmationWindow() {
    const uniqueLabel = `confirmation`;

    const example = new WebviewWindow(uniqueLabel, {
      url: "/confirmation",
      title: "confirmation",
      decorations: false,
      transparent: true,
      width: 800,
      height: 600,
      resizable: true,

    });

    example.once("tauri://created", async () => {
      console.log("Window successfully created!");

    });

    example.once("tauri://error", (err) => {
      console.error("Error creating window:", err);
    });

  }

  useEffect(() => {
    async () => {

      // TIMER HANDLING SECTION ---------------------------------------------------------

      const store = await initStore();

      if (!store) return false;

      const timerOffData = await store.get<{ timerOff: boolean }>('timerOff');
      const timerHoursData = await store.get<{ timerHours: number }>('timerHours');
      const timerMinutesData = await store.get<{ timerMinutes: number }>('timerMinutes');
      
      const isTimerEnabled: boolean = timerOffData?.timerOff ?? false;
      const timerHours: number = timerHoursData?.timerHours ?? 0;
      const timerMinutes: number = timerMinutesData?.timerMinutes ?? 0;
      
      console.log("PC WILL SHUTDOWN IN: ", timerHours, " hours and ", timerMinutes, " minutes");

      if (isTimerEnabled) {
        
        const timer = setTimeout(() => {
          if (!isTimerEnabled) {
            clearInterval(timer);
          }
          getConfirmationWindow();
        }, timerHours * 3600000 + timerMinutes * 60000);
      }

    }

    // SCHEDULE & IDLE HANDLING SECTION ---------------------------------------------------------

    setInterval(() => {
      checkTime();
    }, 1000);

  }, []);

  const appWindow = getCurrentWindow();

  const navigate = useNavigate();

  useEffect(() => {
    async function setupListener() {
      const winLabel = await appWindow.label;
      if (winLabel === "confirmation") navigate('/confirmation');;

    }

    setupListener();
  }, [navigate]);

  return (

    <div className="App h-screen w-screen flex justify-center items-center flex-col bg-gradient-to-b from-bglight/50 to-bgdark/50 text-white overflow-x-hidden">
      <Titlebar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/mode" element={<Mode />} />
        <Route path="/confirmation" element={<Confirmation />} />
      </Routes>

    </div>
  );
}

export default App;
