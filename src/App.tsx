import { Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Settings from './pages/Settings';
import Mode from './pages/Mode';

// import { invoke } from "@tauri-apps/api/core";
// import { listen } from '@tauri-apps/api/event';


function App() {

  // const shutdown = async () => {
  //   await invoke("shutdown");
  // };

  return (
    <div className="App h-screen w-screen flex justify-center items-center flex-col bg-gradient-to-b from-bglight to-bgdark/100 text-white overflow-x-hidden">

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/mode" element={<Mode />} />
      </Routes>

    </div>
  );
}

export default App;
