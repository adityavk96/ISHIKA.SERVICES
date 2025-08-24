import React from "react";

import Breadcrumbs from "./Breadcrumbs"; // default import
import { Link } from "react-router-dom";

function Header({ setIsOpen }) {
  return (
    <header className="flex flex-col ">
      {/* Top bar with title, toggle button, and login button */}
      <div className="flex items-center justify-between px-10 py-1">
        {/* Left: Hamburger menu button - visible on mobile only */}
        
        {/* Center: Title */}
        <p className="flex-1 text-center text-2xl font-bold text-sky-300">
          Ishika GST Services
        </p>

        {/* Right: Login button */}
        <Link
          to="/login"
          className="hidden md:inline-block px-4 py-0.5 text-left px-4 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Login
        </Link>
      </div>

      {/* Breadcrumbs below */}
      <Breadcrumbs />
    </header>
  );
}

export default Header;
