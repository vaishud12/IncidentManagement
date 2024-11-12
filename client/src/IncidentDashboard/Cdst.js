import React, { useState, useEffect } from 'react'; // Ensure useState and useEffect are imported
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend } from 'chart.js';
import * as API from "../Endpoint/Endpoint";
ChartJS.register(CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const Cdst = ({ sectorName }) => {
    const [totalIncidents, setTotalIncidents] = useState(0);
    const [totalResolutions, setTotalResolutions] = useState(0); // State for total resolutions
    const [incidents, setIncidents] = useState([]); // State to hold all incidents
    const [categories, setCategories] = useState([]);
    const [informationData, setInformationData] = useState(null); // New state for information data
    const [renderData, setRenderData] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [chartData, setChartData] = useState(null);
    const incidentsPerPage = 3;
   
    // Calculate the indices for slicing the incidents array
    const indexOfLastIncident = currentPage * incidentsPerPage;
    const indexOfFirstIncident = indexOfLastIncident - incidentsPerPage;
    const currentIncidents = incidents.slice(indexOfFirstIncident, indexOfLastIncident);

    // Determine the total number of pages
    const totalPages = Math.ceil(incidents.length / incidentsPerPage);

    // Handler functions for pagination
    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1);
        }
    };

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

const fetchIncidentDatac = async (sectorName) => {
  if (!sectorName) {
      console.error('Sector name is missing');
      return;
  }

  try {
      const response = await fetch(`${API.GET_INCIDENTRESOLVED_CHART}?sectorName=${sectorName}`);
      
      if (!response.ok) {
          throw new Error('Failed to fetch data');
      }

      const data = await response.json();

      console.log('Fetched data:', data);

      if (Array.isArray(data)) {
          const resolvedData = data.map(item => ({
              x: item.incidentcategory,
              y: item.resolved_count,
              category: item.incidentcategory
          }));

          const unresolvedData = data.map(item => ({
              x: item.incidentcategory,
              y: item.unresolved_count,
              category: item.incidentcategory
          }));

          setChartData({
              datasets: [
                  {
                      label: 'Resolved Incidents',
                      data: resolvedData,
                      backgroundColor: 'rgba(0, 255, 0, 0.6)',
                      borderColor: 'rgba(0, 255, 0, 1)',
                      borderWidth: 1
                  },
                  {
                      label: 'Unresolved Incidents',
                      data: unresolvedData,
                      backgroundColor: 'rgba(255, 0, 0, 0.6)',
                      borderColor: 'rgba(255, 0, 0, 1)',
                      borderWidth: 1
                  }
              ]
          });
      } else {
          console.error('Data is not an array:', data);
      }

  } catch (error) {
      console.error('Error fetching chart data:', error);
  }
};






// useEffect to fetch data when the component mounts or sectorName changes
useEffect(() => {
    fetchIncidentCount();
    fetchResolutionCount();
    fetchIncidents();
    fetchIncidentCategories();
    fetchIncidentDatac();
}, [sectorName]);  // Effect will run when sectorName changes
useEffect(() => {
    if (informationData) {
      // Ensure renderData is an array when informationData updates
      setRenderData(Array.isArray(informationData) ? informationData : [informationData]);
    }
  }, [informationData]);


useEffect(() => {
    if (sectorName) {
        fetchIncidentDatac(sectorName);
    }
}, [sectorName]);  // Trigger the fetch when sectorName changes

  if (!chartData) return <p>Loading chart...</p>;
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
              <div className="bg-white p-6 rounded-lg shadow-lg mt-6 col-span-1 md:col-span-2">
                  <h2 className="text-xl font-semibold mb-4">Video Information</h2>
                  <div className="flex flex-col md:flex-row md:space-x-6">
                      {/* Video Section */}
                      <div className="flex-1 mb-4 md:mb-0">
                          <iframe
                              width="100%"
                              height="300"
                              src="https://www.youtube.com/embed/2peuMoHUjao?si=1FQzyx0__JKlOijU"
                              title="YouTube video player"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              referrerPolicy="strict-origin-when-cross-origin"
                              allowFullScreen
                          ></iframe>
                      </div>
  
                      {/* Description Section */}
                      <div className="flex-1">
                          <p className="text-gray-700">
                          Courier and Delivery Scam Threats (CDST) exploit the increased volume of online shopping by posing as legitimate delivery services. Scammers send fake notifications regarding “pending” or “undelivered” packages, asking victims to pay a fee or submit personal information to complete delivery. These schemes create a sense of urgency and rely on the expectation of parcel arrivals, especially during peak shopping seasons. Victims may experience financial loss and identity theft, while legitimate delivery companies face reputational damage.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  
      {/* Incident Categories and Selected Category Info */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0">
          {/* Incident Categories */}
          <div className="w-full md:w-1/2">
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
  
          {/* Selected Category Information */}
          {selectedCategory && renderData && renderData.length > 0 && (
              <div className="w-full md:w-1/2 pl-0 md:pl-4">
                  <h3 className="text-xl font-semibold mb-4">{selectedCategory} Information</h3>
                  <div className="bg-white rounded-lg shadow-md p-4 md:p-8 max-h-[400px] md:max-h-[780px] overflow-y-auto">
                      {renderData.map((data, index) => (
                          <div key={index} className="mb-6 border-b pb-4">
                              <p className="text-gray-700 font-bold">Incident Name: {data.incidentname || 'N/A'}</p>
                              <p className="text-gray-500">City/Country: {data.city || 'N/A'}</p>
                              {data.informationdescription?.image ? (
                                  <img
                                      src={API.GET_IMAGE_URL(data.informationdescription.image)}
                                      alt={data.incidentname}
                                      className="w-full max-w-md my-4"
                                  />
                              ) : (
                                  <p>No image available.</p>
                              )}
                              {data.tagss && data.tagss.length > 0 ? (
                                  <div className="my-4">
                                      <span className="font-semibold">Tags: </span>
                                      {data.tagss.join(', ')}
                                  </div>
                              ) : (
                                  <p>No tags available.</p>
                              )}
                              <p>
                                  <b>Information Description:</b>
                                  {data.informationdescription?.content ? (
                                      <div className="content-text">
                                          <style>
                                              {`
                                                  .content-text a {
                                                      color: blue;
                                                      text-decoration: underline;
                                                  }
                                              `}
                                          </style>
                                          <div
                                              dangerouslySetInnerHTML={{ __html: data.informationdescription.content }}
                                          />
                                      </div>
                                  ) : (
                                      <p>No content available.</p>
                                  )}
                              </p>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
  
    {/* Incident Table and Notifications */}
<div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-8 p-4">
    <div className="overflow-x-auto w-full md:w-3/5">
        <h2 className="text-xl font-semibold mb-4 text-dark-blue">Incident List</h2>
        <table className="min-w-full border border-gray-200 rounded-lg shadow-lg">
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
                {currentIncidents.map((incident) => (
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
                                    className="w-full max-w-xs"
                                />
                            ) : (
                                <p>No photo available.</p>
                            )}
                        </td>
                        <td className="py-2 px-4 border-b">{incident.remark}</td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center mt-4">
            <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-300 text-blue-500 rounded disabled:opacity-50"
            >
                <FaArrowLeft />
            </button>
            <span className="mx-4 text-dark-blue">Page {currentPage} of {totalPages}</span>
            <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-300 text-blue-500 rounded disabled:opacity-50"
            >
                <FaArrowRight />
            </button>
        </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-lg w-full overflow-x-auto md:w-2/5">
    <h2 className="text-xl font-semibold mb-4">Notifications</h2>
    <table className="min-w-full border border-gray-200 rounded-lg shadow-lg mx-auto table-auto">
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
                    <td className="py-2 px-4 border-b text-sm sm:text-base">{notification.id}</td>
                    <td className="py-2 px-4 border-b text-sm sm:text-base break-words">{notification.message}</td>
                    <td className="py-2 px-4 border-b text-sm sm:text-base">{new Date(notification.date).toLocaleDateString()}</td>
                </tr>
            ))}
        </tbody>
    </table>

    {/* Incident Resolution Scatter Graph */}
    <div className="mt-4">
        <h2 className="text-xl font-semibold mb-4 text-dark-blue">Incident Categories Resolved vs Unresolved</h2>
        <div className="w-full mx-auto" style={{ height: '500px', padding: '1px' }}>
            <Scatter
                data={chartData}
                options={{
                    responsive: true,
                    scales: {
                        x: {
                            type: 'category',
                            title: {
                                display: true,
                                text: 'Incident Category'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Incident Count'
                            },
                            min: 0
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: `Incidents Resolution Data for ${sectorName}`
                        },
                        tooltip: {
                            callbacks: {
                                label: function (tooltipItem) {
                                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw.y} incidents`;
                                }
                            }
                        }
                    }
                }}
                style={{ width: '100%', height: '100%' }} // Ensures the graph takes full width and height of the container
            />
        </div>
    </div>
</div>

</div>

        {/* Graph Section inside Notifications */}
        </div>
       
    


  
  
        
    );
};

export default Cdst;
