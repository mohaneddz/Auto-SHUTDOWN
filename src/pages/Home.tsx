import Button from "../components/Button";
import { useEffect, useState } from "react";
// import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { useNavigate } from 'react-router-dom';
import { IconSettingsFilled } from '@tabler/icons-react'

import { initStore } from '../lib/store';

export default function Home(): JSX.Element {

  useEffect(() => {
    (async () => {
      init();
    })();
  }, []);

  // event listener for keyboard shortcuts ctrl+shift+n
  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.key === 'l' || event.key === ';') {
  //       console.log("ctrl+shift+n or m pressed");
  //       init();
  //     }
  //   };
  //   window.removeEventListener('keyup', handleKeyDown);
  //   window.addEventListener('keyup', handleKeyDown);
  // }, []);


  // async function goTest() {
  //   const uniqueLabel = `confirmation`;

  //   const example = new WebviewWindow(uniqueLabel, {
  //     url: "/confirmation",
  //     title: "confirmation",
  //     decorations: false,
  //     transparent: true,
  //     width: 800,
  //     height: 600,
  //     resizable: true,

  //   });

  //   example.once("tauri://created", async () => {
  //     console.log("Window successfully created!");

  //   });

  //   example.once("tauri://error", (err) => {
  //     console.error("Error creating window:", err);
  //   });
  // };

  async function init() {
    const store = await initStore();
    store && setStore(store);

    while (!store);

    let enable: any = await store.get("enable");

    setEnabled(enable);
    store && setLoaded(true);
  }

  const navigate = useNavigate();

  const [enabled, setEnabled] = useState<boolean>(false);
  const [store, setStore] = useState<any>(null);
  const [loaded, setLoaded] = useState<boolean>(false);

  const goSettings = () => {
    navigate('/settings');
  };

  const goMode = () => {
    navigate('/mode');
  };

  async function setAutoShutdown(bool: boolean) {

    if (!store) return;
    await store.set("enable", bool);
    setEnabled(bool);

  }

  return (
    <>
      {
        loaded &&
        <div className="h-screen w-screen flex justify-center items-center flex-col">

          <button onClick={goSettings}>
            <IconSettingsFilled size={48} className="hover:cursor-pointer top-3 md:top-8 left-3 md:left-8 absolute w-12 md:w-16 h-12 md:h-16 hover:scale-105 active:scale-95 transition-transform text-bglighter duration-200" />
          </button>

          <h1 className={"font-black text-3xl sm:text-5xl font-title text-center" + (enabled ? " " : " text-gray-600 stroke-1")} >
            Auto-Shutdown
          </h1>

          <div className="flex space-y-4 flex-col m-8 justify-center items-center  w-[95vw] max-w-lg sm:max-w-2xl ">

            <div className="flex space-y-4 flex-col m-8 justify-center items-center content-center">

              <div className="flex justify-center w-[95vw] max-w-2xl mx-auto items-center ">
                <Button enabled={!enabled} onClick={() => setAutoShutdown(true)} text="Enabled" textColor={enabled ? "w-full text-gray-400 font-button" : "white font-button"} bgHover={enabled ? "hover:bg-neutral-light" : "hover:bg-accept-light"} bg={enabled ? "bg-accept-dark" : "bg-accept"} />
              </div>
              <div className="flex justify-center w-[95vw] max-w-2xl mx-auto items-center pb-8">
                <Button enabled={enabled} onClick={() => setAutoShutdown(false)} text="Disable" textColor={!enabled ? "w-full text-gray-400 font-button" : "white font-button"} bgHover={!enabled ? "" : "hover:bg-decline-light"} bg={!enabled ? "bg-decline-dark" : "bg-decline"} />
              </div>

              <div className="flex justify-center w-[95vw] max-w-2xl mx-auto items-center ">
                <Button enabled={true} onClick={goMode} text="Modes" textColor="white font-button" bgHover="hover:bg-unique-light" bg="bg-unique justify-center items-center" />
              </div>

              {/* <div className="flex justify-center w-[95vw] max-w-2xl mx-auto items-center ">
            <Button onClick={goTest} text="Test" textColor="white font-button" bgHover="hover:bg-zinc-500" bg="bg-zinc-700 justify-center items-center"></Button>
            </div> */}

              {/* <div className="flex justify-center w-[95vw] max-w-2xl mx-auto items-center ">
                <Button onClick={goTest} text="Test" textColor="white text-2xl font-button" bgHover="hover:bg-zinc-500" bg="bg-zinc-700 justify-center items-center"></Button>
              </div> */}


            </div>

          </div>
        </div>
      }
    </>
  );
};