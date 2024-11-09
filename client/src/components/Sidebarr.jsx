import React, { createContext, useContext, useState } from "react";
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Home, StickyNote, Layers, ChevronFirst, ChevronLast } from "lucide-react";
import { FaUser } from 'react-icons/fa';
const SidebarContext = createContext();


export default function Sidebarr({ setExpanded, onMenuItemClick }) {
    const [expanded, setSidebarExpanded] = useState(true);
    const { t } = useTranslation();
    const toggleSidebar = () => {
        const newState = !expanded;
        setSidebarExpanded(newState);
        setExpanded(newState); // Notify the parent component
    };

    return (
        <aside
            className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}
            style={{
                height: 'calc(100vh - 40px)',
                position: 'fixed',
                top: '50px',
                transition: 'width 0.3s ease',
                width: expanded ? '200px' : '60px',
            }}
        >
            <nav className="h-full flex flex-col bg-white border-r shadow-sm">
                <div className="p-4 pb-2 flex justify-between items-center">
                    <button onClick={toggleSidebar} className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100">
                        {expanded ? <ChevronFirst /> : <ChevronLast />}
                    </button>
                </div>

                <SidebarContext.Provider value={{ expanded }}>
                    <ul className="flex-1 px-3">
                        <SidebarItem icon={<Home size={20} />} text={t("sidebar.dashboard")} onClick={() => onMenuItemClick('dashboard')} />
                        <SidebarItem icon={<LayoutDashboard size={20} />} text={t("sidebar.incident")} onClick={() => onMenuItemClick('fTable')} />
                        <SidebarItem icon={<StickyNote size={20} />} text={t("sidebar.resolutions")} onClick={() => onMenuItemClick('rtable')} />
                        <SidebarItem icon={<FaUser size={20} />} text={t("sidebar.users")} onClick={() => onMenuItemClick('userTable')} />
                        <SidebarItem icon={<Layers size={20} />} text={t("sidebar.incidentSectors")} onClick={() => onMenuItemClick('incidentCategory')} />
                    </ul>
                </SidebarContext.Provider>
            </nav>
        </aside>
    );
}

// SidebarItem Component
export function SidebarItem({ icon, text, active, alert, onClick }) {
    const { expanded } = useContext(SidebarContext);
    return (
        <li
            onClick={onClick} // Call the onClick prop when the item is clicked
            className={`relative flex items-center py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${active ? "bg-gradient-to-tr from-indigo-200 to-indigo-100 text-indigo-800" : "hover:bg-indigo-50 text-gray-600"}`}
        >
            <span className="mr-2">{icon}</span> {/* Add margin-right to the icon */}
            <span className={`transition-all ${expanded ? "opacity-100" : "opacity-0"}`}>{text}</span>
            {alert && (
                <div className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${expanded ? "" : "top-2"}`} />
            )}
            {!expanded && (
                <div className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 text-indigo-800 text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}>
                    {text}
                </div>
            )}
        </li>
    );
}
