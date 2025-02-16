// import { invoke } from "@tauri-apps/api/core";

import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';

function App() {

  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  return (
    <Router>
      <main className="">
        <Routes>
          <Route path="/home" element={<Home/>} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
