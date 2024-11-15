import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import Sidebard from '../components/Sidebard';
import "../BotAnalysis/MainContent.css";

// Import sector-specific components
import Posh from './Posh';
import Crft from './Crft';
import InformationMaster from './InformationMaster';
import Cdst from './Cdst';
import Ccfd from './Ccfd';
import Ints from './Ints';
import Omfr from './Omfr';
import Cist from './Cist';
import Sisp from './Sisp';

const Dashboard = () => {
    const [sidebarExpanded, setSidebarExpanded] = useState(true);
    const [visibleComponent, setVisibleComponent] =  useState('Home');// Default to Home section

    const handleSectorClick = (sectorName) => {
        console.log("Selected Sector:", sectorName);
        setVisibleComponent(sectorName);
    };

    const renderComponent = () => {
        // Render different components based on the sector clicked
        switch (visibleComponent) {
            case 'POSH - Prevention of Sexual Harassment':
                return <Posh sectorName={visibleComponent} />;

            case 'INTS – International Scam Scenarios':
                return <Ints sectorName={visibleComponent} />;

            case 'OMFR – Online Marketplace Fraud Risks':
                return <Omfr sectorName={visibleComponent} />;
            
            case 'CCFD – Charity and Crowdfunding Deception':
                return <Ccfd sectorName={visibleComponent} />;
                
            case 'CIST – Cyber and Identity Support Threats':
                return <Cist sectorName={visibleComponent} />;

            case 'SISP - Social Influence and Scam Prevention':
                return <Sisp sectorName={visibleComponent} />;
            
            case 'CDST – Courier and Delivery Scam Threats':
                return <Cdst sectorName={visibleComponent} />;

            case 'CRFT – Cryptocurrency Fraud and Threats':
                
                return <Crft sectorName={visibleComponent} />;

            case 'Home':
                return <InformationMaster />;
            default:
                return <div>Select a sector to view details.</div>;
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-1">
                {/* Pass handleSectorClick to Sidebard for handling clicks */}
                <Sidebard setExpanded={setSidebarExpanded} onMenuItemClick={handleSectorClick} />
                <div
                    className={`main-content flex-1 p-6 overflow-auto transition-all ${sidebarExpanded ? 'bg-gray-100' : 'bg-white'}`}
                    style={{ marginLeft: sidebarExpanded ? '300px' : '60px' }}
                >
                    <div className="header text-center mb-6">
                        <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
                    </div>

                    {/* Render the sector-specific component */}
                    <div className="sector-content">
                        {renderComponent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
