// Sidemenu.jsx

import React from "react";
import { Home, Building2, Settings, LogIn } from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidemenu = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { name: "Home", icon: <Home size={18} />, path: "/" },
    { name: "Services", icon: <Building2 size={18} />, path: "/services" },
    { name: "About", icon: <Settings size={18} />, path: "/about" },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden "
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <aside
        className={`fixed top-0 left-0 p-4 h-full w-40 bg-white shadow-md flex flex-col z-40 transform transition-transform duration-300 
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static`}
      >
        <div className="p-4 text-xl font-bold text-blue-600 flex justify-between items-center">
          
          <button
            className="md:hidden text-gray-600"
            onClick={() => setIsOpen(false)}
          >
            ✕
          </button>
        </div>

        <nav className="flex-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center w-full px-4 py-2 text-sm font-medium hover:bg-blue-50 transition ${
                  isActive
                    ? "bg-blue-100 text-blue-600 border-r-4 border-blue-500"
                    : "text-gray-700"
                }`
              }
              end={item.path === "/"}
            >
              {item.icon}
              <span className="ml-2">{item.name}</span>
            </NavLink>
          ))}

          {/* Add the new Login Link here with the md:hidden class */}
          <NavLink
            to="/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center w-full px-4 py-2 text-sm font-medium hover:bg-blue-50 transition text-gray-700 mt-4 md:hidden"
          >
            <LogIn size={18} />
            <span className="ml-2">Login</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
};

export default Sidemenu;