import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Settings from './pages/Settings';
import Mode from './pages/Modes';
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
    
    const store = await initStore();
    while (!store);
    
    const enable: boolean|undefined = await store.get("enable");
    // console.log("enable", enable);
    if (!enable) return;

    console.log("getConfirmationWindow called");
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

    setInterval(() => {
      checkTime();
    }, 60000);

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
