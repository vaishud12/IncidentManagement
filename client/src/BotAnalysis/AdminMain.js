import React, { useState } from 'react';
import FTable from '../Incident/FTable';
import ResolutionTable from '../Resolve/ResolutionTable';
import UserList from '../Signup-Login/UserList';
import IncidentCategory from '../incidentcategory/IncidentCategory';
import Admin from '../Incident/Admin';
import Navbar from '../Navbar';
import Sidebarr from '../components/Sidebarr';
import "./MainContent.css";
import AdminDashboard from '../components/AdminDashboard';

const AdminMain = () => {
    const [visibleComponent, setVisibleComponent] = useState('dashboard'); // Default to dashboard
    const [isAdmin, setIsAdmin] = useState(true);
    const [sidebarExpanded, setSidebarExpanded] = useState(true);

    const handleTable = (component) => {
        setVisibleComponent(component);
    };

    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-1">
                <Sidebarr setExpanded={setSidebarExpanded} onMenuItemClick={handleTable} />
                <div
                    className={`main-content flex-1 p-6 overflow-auto transition-all ${sidebarExpanded ? 'bg-gray-100' : 'bg-white'}`}
                    style={{ marginLeft: sidebarExpanded ? '200px' : '60px' }}
                >
                    <div className="header text-center mb-6"> <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                       
                    </div>
                    {/* Conditional rendering based on visibleComponent */}
                    {visibleComponent === 'dashboard' && <AdminDashboard />}
                    {visibleComponent === 'incidentCategory' && <IncidentCategory />}
                    {visibleComponent === 'fTable' && (isAdmin ? <Admin /> : <FTable />)}
                    {visibleComponent === 'rtable' && <ResolutionTable />}
                    {visibleComponent === 'userTable' && <UserList />}
                </div>
            </div>
        </div>
    );
};

export default AdminMain;
