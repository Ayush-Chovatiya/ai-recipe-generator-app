import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  ChefHat,
  Home,
  LogOut,
  Menu,
  Settings,
  UtensilsCrossed,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
    navigate("/login");
  };

  const navItems = [
    {
      to: "/dashboard",
      icon: <Home className="h-4 w-4" />,
      label: "Dashboard",
    },
    {
      to: "/pantry",
      icon: <UtensilsCrossed className="h-4 w-4" />,
      label: "Pantry",
    },
    {
      to: "/generate",
      icon: <ChefHat className="h-4 w-4" />,
      label: "Generate",
    },
    {
      to: "/recipes",
      icon: <UtensilsCrossed className="h-4 w-4" />,
      label: "Recipes",
    },
    {
      to: "/meal-plan",
      icon: <Calendar className="h-4 w-4" />,
      label: "Meal Plan",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          className="flex min-w-0 items-center gap-2 text-lg font-semibold text-gray-900 sm:text-xl"
          onClick={() => setIsMenuOpen(false)}
        >
          <ChefHat className="h-7 w-7 shrink-0 text-emerald-500" />
          <span className="truncate">AI Recipe Generator</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="max-w-40 truncate text-sm text-gray-600 lg:max-w-56">
            {user?.name || user?.email}
          </span>
          <Link
            to="/settings"
            className="tap-target flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
          <button
            onClick={handleLogout}
            className="tap-target flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="tap-target flex items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 md:hidden"
          aria-controls="mobile-navigation"
          aria-expanded={isMenuOpen}
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
        >
          {isMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {isMenuOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-gray-200 bg-white px-4 py-4 shadow-lg md:hidden"
        >
          <div className="mb-3 truncate rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            {user?.name || user?.email}
          </div>
          <div className="grid gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                {...item}
                className="tap-target px-3 py-3"
                onClick={() => setIsMenuOpen(false)}
              />
            ))}
            <NavLink
              to="/settings"
              icon={<Settings className="h-4 w-4" />}
              label="Settings"
              className="tap-target px-3 py-3"
              onClick={() => setIsMenuOpen(false)}
            />
            <button
              onClick={handleLogout}
              className="tap-target flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  );
}

function NavLink({ to, icon, label, className = "", onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-emerald-50 hover:text-emerald-600 ${className}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

export default Navbar;
