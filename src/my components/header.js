import React from "react";
import { Menu } from "lucide-react";
import Breadcrumbs from "./Breadcrumbs"; // default import
import { Link } from "react-router-dom";

function Header({ setIsOpen }) {
  return (
    <header className="flex flex-col border-b border-blue-300">
      {/* Top bar with title, toggle button, and login button */}
      <div className="flex items-center justify-between p-4">
        {/* Left: Hamburger menu button - visible on mobile only */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden p-2 rounded bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Center: Title */}
        <p className="flex-1 text-center text-2xl font-bold text-blue-600">
          Ishika GST
        </p>

        {/* Right: Login button */}
        <Link
          to="/login"
          className="hidden md:inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
