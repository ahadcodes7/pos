import Navbar from "@/renderer/components/dashboard/Navbar";
import Sidebar from "@/renderer/components/dashboard/Sidebar";
import { Outlet } from "react-router-dom";
import { SettingsProvider } from "./settings/SettingsProvider";

export default function Dashboard() {
  return (
    <div className="flex h-full">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto min-h-0">
          {/* Saved settings live here so they outlast visits to the Settings page. */}
          <SettingsProvider>
            <Outlet />
          </SettingsProvider>
        </main>
      </div>
    </div>
  );
}
