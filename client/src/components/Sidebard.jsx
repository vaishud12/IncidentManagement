import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Layers, ChevronFirst, ChevronLast, Home} from "lucide-react";
import * as API from "../Endpoint/Endpoint";

const SidebarContext = createContext();

export default function Sidebard({ setExpanded, onMenuItemClick }) {
    const [expanded, setSidebarExpanded] = useState(true);
    const { t } = useTranslation();
    const [sectors, setSectors] = useState([]); // State to hold sector names
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state

    const toggleSidebar = () => {
        const newState = !expanded;
        setSidebarExpanded(newState);
        setExpanded(newState); // Notify the parent component
    };

    // Fetch sectors from the database
    // Fetching from the API, assuming the endpoint returns distinct sectors
useEffect(() => {
    const fetchSectors = async () => {
        try {
            const response = await fetch(API.GET_DISTINCT_SECTOR);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            setSectors(data);  // This should now contain only distinct sector names
        } catch (error) {
            console.error("Error fetching sectors:", error);
            setError(error.message);  // Set the error message
        } finally {
            setLoading(false);  // Stop loading regardless of success or failure
        }
    };
    fetchSectors();
}, []);


    return (
        <aside
            className={`sidebar ${expanded ? 'expanded' : 'collapsed'}`}
            style={{
                height: 'calc(100vh - 40px)',
                position: 'fixed',
                top: '50px',
                transition: 'width 0.3s ease',
                width: expanded ? '300px' : '60px',
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
        {/* Static Home Section */}
        <SidebarItem 
            key="home" 
            icon={<Home size={20} />}  // Using Lucide React Home icon
            text="Home" 
            onClick={() => onMenuItemClick("Home")}  // Handle click for Home section
        />

        {/* Handle loading and error states */}
        {loading && <li>Loading sectors...</li>}
        {error && <li>Error loading sectors: {error}</li>}

        {/* Render dynamic sector items */}
        {!loading && !error && sectors.map((sector, index) => (
            <SidebarItem 
                key={index} 
                icon={<Layers size={20} />} 
                text={sector.sector}  // Access the 'sector' property
                onClick={() => onMenuItemClick(sector.sector)}  // Handle clicks based on sector name
            />
        ))}
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
