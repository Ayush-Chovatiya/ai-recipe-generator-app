import { Outlet } from "react-router-dom";

import Navbar from "@/components/Navbar";

function Layout() {
  return (
    <div className="app-shell">
      <div className="fixed w-full top-0">
        <Navbar />
      </div>
      <div className="mt-16 max-h-[calc(100vh-64px)] overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
