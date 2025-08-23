import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom'; // No BrowserRouter import here
import Breadcrumbs from './my components/Breadcrumbs';
import Header from './my components/header';
import Main from './my components/main';
import Services from './my components/Services';
import SideMenu from './my components/SideMenu';
import Login from './my components/login';
import GSTReco from './my components/GstReco';
import Gst2B from './my components/Gst2B';
import Gst from './my components/gst';
import { Menu } from "lucide-react";


function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 ">
      <SideMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex-1 flex flex-col widh-90%">
        <Header setIsOpen={setIsOpen} />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/services" element={<Services />} />
          <Route path="/login" element={<Login />} />
          <Route path="/Gst-Reco" element={<GSTReco />} />
          <Route path="/gst-2B" element={<Gst2B />} />
          <Route path="/gst" element={<Gst />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;