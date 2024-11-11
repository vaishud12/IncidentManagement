import React, { useState, useEffect } from 'react'; // Ensure useState and useEffect are imported

import * as API from "../Endpoint/Endpoint";
const Crft = ({ sectorName }) => {
    const [totalIncidents, setTotalIncidents] = useState(0);
    const [totalResolutions, setTotalResolutions] = useState(0); // State for total resolutions
    const [incidents, setIncidents] = useState([]); // State to hold all incidents
    const [categories, setCategories] = useState([]);
    const [informationData, setInformationData] = useState(null); // New state for information data
    const [renderData, setRenderData] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const notifications = [
        { id: 1, message: "Incident #1025 is resolved.", date: "2024-11-07" },
        { id: 2, message: "New incident reported in 'Fire Safety'.", date: "2024-11-06" },
        { id: 3, message: "High priority incident in 'Network Security'.", date: "2024-11-05" },
    ];
    console.log("Sector Name:", sectorName);
   // Fetch incident count data
   const fetchIncidentCount = async () => {
    try {
        const response = await fetch(`${API.GET_INCIDENTCOUNT_CATEGORYCASE}?sectorName=${sectorName}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setTotalIncidents(data.count);
    } catch (error) {
        console.error("Error fetching incident count:", error);
        setTotalIncidents(0);
    }
};

// Fetch resolution count data
const fetchResolutionCount = async () => {
    try {
        const response = await fetch(`${API.GET_RESOLUTIONCOUNT_CATEGORYCASE}?sectorName=${sectorName}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setTotalResolutions(data.count);
    } catch (error) {
        console.error("Error fetching resolution count:", error);
        setTotalResolutions(0);
    }
};

// Fetch incidents data
const fetchIncidents = async () => {
    try {
        const response = await fetch(`${API.GET_INCIDENT_DETAIL_SECTOR}?sectorName=${sectorName}`);
        if (!response.ok) throw new Error("Network response was not ok");

        const data = await response.json();
        setIncidents(data); // Set incidents state
    } catch (error) {
        console.error("Error fetching incidents:", error);
        setIncidents([]); // Handle error gracefully
    }
};

// Fetch incident categories data
const fetchIncidentCategories = async () => {
    try {
        const response = await fetch(`${API.GET_INCIDENTCATEGORIES_SECTOR}?sectorName=${sectorName}`);
        if (!response.ok) throw new Error("Failed to fetch incident categories.");

        const data = await response.json();
        setCategories(data.categories); // Assuming categories are in data.categories
    } catch (error) {
        console.error("Error fetching incident categories:", error.message);
        setCategories([]); // Set to an empty array on error
    }
};

// Fetch information data for the selected category
const fetchInformationData = async (category) => {
    try {
        const response = await fetch(`${API.GET_SECTOR_CATEGORY_DATA}?category=${category}&sectorName=${sectorName}`);
        if (!response.ok) throw new Error("Failed to fetch information data.");

        const data = await response.json();
        setInformationData(data); // Set the information data for the selected category
        console.log('information data',informationData);
    } catch (error) {
        console.error("Error fetching information data:", error.message);
        setInformationData(null); // Set to null if there's an error
    }
};

// Handle category click event
const handleCategoryClick = (category) => {
    setSelectedCategory(category); // Set the selected category
    fetchInformationData(category); // Fetch the data for that category
};

// useEffect to fetch data when the component mounts or sectorName changes
useEffect(() => {
    fetchIncidentCount();
    fetchResolutionCount();
    fetchIncidents();
    fetchIncidentCategories();
}, [sectorName]);  // Effect will run when sectorName changes
useEffect(() => {
    if (informationData) {
      // Ensure renderData is an array when informationData updates
      setRenderData(Array.isArray(informationData) ? informationData : [informationData]);
    }
  }, [informationData]);

console.log('information data',informationData); // Log to check the structure of the data

    return (
        <div className="sector-page">
            <p>Welcome to the {sectorName} sector page!</p>
            <div className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
    <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Total Incidents</h2>
        <p className="text-3xl font-bold text-center">{totalIncidents}</p>
    </div>
    <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Total Resolutions</h2>
        <p className="text-3xl font-bold text-center">{totalResolutions}</p>
    </div>

    {/* Video Information Section */}
    <div className="bg-white p-6 rounded-lg shadow-lg mt-6 col-span-1 md:col-span-2"> {/* Make it span both columns */}
        <h2 className="text-xl font-semibold mb-4">Video Information</h2>
        <div className="flex flex-col md:flex-row md:space-x-6"> {/* Use flexbox for layout */}
            {/* Video Section */}
            <div className="flex-1">
            <iframe width="560" style={{height:'300px'}} src="https://www.youtube.com/embed/OhNA3INl5oM?si=78xxr4xTZIrfBZa8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

            {/* Description Section */}
            <div className="flex-1">
                <p className="text-gray-700">
                Cryptocurrency Fraud and Threats (CRFT) refer to the various scams and security risks in the digital currency space, such as Ponzi schemes, phishing attacks, fake ICOs, rug pulls, and SIM swap attacks. As the popularity of cryptocurrencies grows, so do the tactics used by malicious actors to exploit vulnerabilities. These threats can lead to significant financial losses, damage to reputations, and increased regulatory scrutiny. To mitigate the risks, it is crucial for investors to remain vigilant, utilize secure wallets, enable two-factor authentication, and stay informed about potential scams and emerging threats in the cryptocurrency market.
                </p>
            </div>
        </div>
    </div>
</div>


    {/* New Video Section */}
    
</div>

<div className="flex">
      {/* Incident Categories */}
      <div className="w-1/2">
        <h2 className="text-2xl font-bold mb-4">Incident Categories for {sectorName}</h2>
        {categories.length > 0 ? (
          <ul className="list-disc list-inside">
            {categories.map((category, index) => (
              <li
                key={index}
                className="py-2 px-4 border-b hover:bg-gray-100 cursor-pointer"
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500">No incident categories found for this sector.</p>
        )}
      </div>

      {/* Incident Information */}
      {selectedCategory && renderData.length > 0 && (
        <div className="w-1/2 pl-4">
          <h3 className="text-xl font-semibold mb-4">{selectedCategory} Information</h3>

          {/* Map over renderData array */}
          {renderData.map((data, index) => (
            <div key={index} className="mb-6">
              <p className="text-gray-700 font-bold">
                Incident Name: {data.incidentname || 'N/A'}
              </p>
              <p className="text-gray-500">City: {data.city || 'N/A'}</p>

              {/* Image */}
              {data.informationdescription?.image ? (
                <img
                  src={API.GET_IMAGE_URL(data.informationdescription.image)}
                  alt={data.incidentname}
                  className="w-full max-w-md my-4"
                />
              ) : (
                <p>No image available.</p>
              )}

              {/* Description */}
              

              {/* Tags */}
              {data.tagss && data.tagss.length > 0 ? (
                <div className="my-4">
                  <span className="font-semibold">Tags: </span>
                  {data.tagss.join(', ')}
                </div>
              ) : (
                <p>No tags available.</p>
              )}

              <p><b>Information Description:</b>{data.informationdescription?.content ? (
                <div
                  className="content-text"
                  dangerouslySetInnerHTML={{ __html: data.informationdescription.content }}
                />
              ) : (
                <p>No content available.</p>
              )}</p>{/* Content */}
              
            </div>
          ))}
        </div>
      )}
    </div>


            {/* Table for displaying incidents */}
            <div className="flex space-x-8 p-4">
    {/* Incident Table */}
    <div className="overflow-x-auto" style={{ width: '60%' }}>
        <h2 className="text-xl font-semibold mb-4 text-dark-blue">Incident List</h2>
        <table className="min-w-full border border-gray-200 rounded-lg shadow-lg mx-auto" style={{ width: '100%' }}>
            <thead>
                <tr style={{ backgroundColor: '#3386ff', color: 'white' }}>
                    <th className="py-3 px-4 border-b font-bold text-left">Incident ID</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Category</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Incident Name</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Incident Description</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Date</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Current Address</th>
                    <th className="py-3 px-4 border-b font-bold text-left">GPS</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Raised To User</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Status</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Priority</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Incident Status</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Photo</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Remark</th>
                </tr>
            </thead>
            <tbody>
                {incidents.map((incident) => (
                    <tr key={incident.id} className="hover:bg-light-blue transition duration-200">
                        <td className="py-2 px-4 border-b">{incident.incidentid}</td>
                        <td className="py-2 px-4 border-b">{incident.incidentcategory}</td>
                        <td className="py-2 px-4 border-b">{incident.incidentname}</td>
                        <td className="py-2 px-4 border-b">{incident.incidentdescription}</td>
                        <td className="py-2 px-4 border-b">{new Date(incident.date).toLocaleDateString()}</td>
                        <td className="py-2 px-4 border-b">{incident.currentaddress}</td>
                        <td className="py-2 px-4 border-b">{incident.gps}</td>
                        <td className="py-2 px-4 border-b">{incident.raisedtouser}</td>
                        <td className="py-2 px-4 border-b">{incident.status}</td>
                        <td className="py-2 px-4 border-b">{incident.priority}</td>
                        <td className="py-2 px-4 border-b" style={{ color: incident.resolved ? 'red' : 'green', fontWeight: 'bold' }}>
                            {incident.resolved ? 'Inactive (Resolved)' : 'Active (Unresolved)'}
                        </td>
                        <td className="py-2 px-4 border-b">
                            {incident.photo ? (
                                <img
                                    src={API.GET_IMAGE_URL(incident.photo)}
                                    alt={incident.incidentname}
                                    style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '5px' }}
                                />
                            ) : (
                                <p>No Image</p>
                            )}
                        </td>
                        <td className="py-2 px-4 border-b">{incident.remark}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>

    {/* Notification Table */}
    <div  style={{ width: '30%' }}>
        <h2 className="text-xl font-semibold mb-4 text-dark-blue">Notifications</h2>
        <table className="min-w-full border border-gray-200 rounded-lg shadow-lg mx-auto" style={{ width: '100%' }}>
            <thead>
                <tr style={{ backgroundColor: '#3386ff', color: 'white' }}>
                    <th className="py-3 px-4 border-b font-bold text-left">Notification ID</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Message</th>
                    <th className="py-3 px-4 border-b font-bold text-left">Date</th>
                </tr>
            </thead>
            <tbody>
                {notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-light-blue transition duration-200">
                        <td className="py-2 px-4 border-b">{notification.id}</td>
                        <td className="py-2 px-4 border-b">{notification.message}</td>
                        <td className="py-2 px-4 border-b">{new Date(notification.date).toLocaleDateString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
</div>

        </div>

        
    );
};

export default Crft;
