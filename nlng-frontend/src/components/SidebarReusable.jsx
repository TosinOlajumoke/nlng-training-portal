import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";

const SidebarReusable = ({ title, icon, menuItems }) => {
  const [isOpen, setIsOpen] = useState(window.innerWidth >= 996);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 996) setIsOpen(true);
      else setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleClose = () => {
    if (window.innerWidth < 996) setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button */}
      {!isOpen && (
        <button className="sidebar-toggle" onClick={() => setIsOpen(true)}>
          ☰
        </button>
      )}

      {/* Overlay */}
      {isOpen && window.innerWidth < 996 && (
        <div className="overlay" onClick={handleClose}></div>
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          {icon && <span className="sidebar-icon">{icon}</span>}
          <h4>{title}</h4>
          {window.innerWidth < 996 && (
            <button className="close-btn" onClick={handleClose}>
              ✕
            </button>
          )}
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item, index) => (
    <NavLink
         to={item.path}
         end
      key={index}
          className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}` }
           onClick={handleClose}>
      <span className="menu-icon">{item.icon}</span>
        <span>{item.label}</span>
    </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default SidebarReusable;

