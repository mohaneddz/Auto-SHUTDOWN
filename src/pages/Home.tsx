import Button from "../components/Button";
import { useState } from "react";

import { useNavigate } from 'react-router-dom';
import { IconSettingsFilled } from '@tabler/icons-react'
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export default function Home(): JSX.Element {

  const navigate = useNavigate();
  const [enable, setEnable] = useState<boolean>(false);

  const goSettings = () => {
    navigate('/settings');
  };

  const goMode = () => {
    navigate('/mode');
  };

  async function goTest() {
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

  return (
    <div className="h-screen w-screen flex justify-center items-center flex-col">

      <button onClick={goSettings}>
        <IconSettingsFilled size={48} className="top-3 md:top-8 left-3 md:left-8 absolute w-12 md:w-16 h-12 md:h-16 hover:scale-105 active:scale-95 transition-transform text-bglighter duration-200" />
      </button>

      <h1 className={"font-black text-5xl font-title text-center" + (enable ? " " : " text-gray-600 stroke-1")} >
        Auto-Shutdown
      </h1>

      <div className="flex space-y-4 flex-col m-8 justify-center items-center w-[95vw] max-w-2xl ">

        <div className="flex space-y-4 flex-col m-8">

          <div className="flex justify-center w-[95vw] max-w-2xl mx-auto items-center ">
            <Button enabled={!enable} onClick={() => { setEnable(true) }} text="Enable" textColor={enable ? "w-full text-gray-400 text-2xl font-button" : "white text-2xl font-button"} bgHover={enable ? "hover:bg-neutral-light" : "hover:bg-accept-light"} bg={enable ? "bg-accept-dark" : "bg-accept"} />
          </div>
          <div className="flex justify-center w-[95vw] max-w-2xl mx-auto items-center pb-8">
            <Button enabled={enable} onClick={() => { setEnable(false) }} text="Disable" textColor={!enable ? "w-full text-gray-400 text-2xl font-button" : "white text-2xl font-button"} bgHover={!enable ? "" : "hover:bg-decline-light"} bg={!enable ? "bg-decline-dark" : "bg-decline"} />
          </div>

        </div>
        <div className="flex justify-center w-[95vw] max-w-2xl mx-auto items-center ">
          <Button enabled={true} onClick={goMode} text="Modes" textColor="white text-2xl font-button" bgHover="hover:bg-unique-light" bg="bg-unique justify-center items-center" />
        </div>

        <div className="flex justify-center w-[95vw] max-w-2xl mx-auto items-center ">
          <Button onClick={goTest} text="Test" textColor="white text-2xl font-button" bgHover="hover:bg-zinc-500" bg="bg-zinc-700 justify-center items-center"></Button>
        </div>

      </div>

    </div>
  );
};
