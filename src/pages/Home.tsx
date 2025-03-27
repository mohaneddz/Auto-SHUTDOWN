import Button from "../components/Button";
import { useState, useEffect, useCallback } from "react";

import { useNavigate } from 'react-router-dom';
import { IconSettingsFilled } from '@tabler/icons-react'
import { initStore } from "../lib/store";

import isTime from "../functions/timer"

export default function Home(): JSX.Element {

  async function testfn(): Promise<string> {
    return await isTime();
  }

  const navigate = useNavigate();
  const [store, setStore] = useState<any>(null);
  const [enable, setEnable] = useState<boolean>(false);

  const [test, setTest] = useState<string>("");

  useEffect(() => {
    const init = async () => {
      setStore(await initStore());
      setTest(await testfn());
    };
    init();
  }, []);

  const goSettings = () => {
    navigate('/settings');
  };

  const saveStore = useCallback(async () => {
    await store.set("enable", { enable });
  }, [enable, store])

  const goMode = () => {
    navigate('/mode');
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center flex-col">

      <button onClick={goSettings}>
        <IconSettingsFilled size={48} className="top-8 left-8 absolute w-16 h-16 hover:scale-105 active:scale-95 transition-transform duration-200" />
      </button>

      <h1 className={"font-black text-5xl font-title text-center" + (enable ? " glow" : "")} >
        Auto-Shutdown
      </h1>

      <div className="flex space-y-4 flex-col m-8 justify-center items-center">

        <div className="flex space-y-4 flex-col m-8">
          <Button onClick={() => { setEnable(true) }} text="Enable" textColor={enable ? "text-gray-400 text-2xl font-button" : "white text-2xl font-button"} bgHover={enable ? "hover:bg-neutral-light" : "hover:bg-accept-light"} bg={enable ? "bg-accept-dark" : "bg-accept"} />
          <Button onClick={() => { setEnable(false) }} text="Disable" textColor={!enable ? "text-gray-400 text-2xl font-button" : "white text-2xl font-button"} bgHover={!enable ? "hover:bg-neutral-light" : "hover:bg-decline-light"} bg={!enable ? "bg-decline-dark" : "bg-decline"} />
        </div>
        <Button onClick={goMode} text="Modes" textColor="white text-2xl font-button" bgHover="hover:bg-unique-light" bg="bg-unique justify-center items-center" />

      </div>

      <h1>{test}</h1>

    </div>
  );
};
