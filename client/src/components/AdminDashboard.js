import React, { useState, useEffect } from 'react';
import { Bar, Line,  Doughnut, Chart } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, ArcElement, Title, Tooltip, PointElement, Legend } from 'chart.js';
import axios from 'axios';
 // Make sure to install and import this plugin
import {jwtDecode} from 'jwt-decode';

import * as API from "../Endpoint/Endpoint";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('category');
  const { t } = useTranslation();
  // const [map, setMap] = useState(null);
  // const [locations, setLocations] = useState([]);
  const [resolutionData, setResolutionData] = useState({ labels: [], datasets: [] });
  const [incidentTrendData, setIncidentTrendData] = useState({ labels: [], datasets: [] });
  const [incidentCategoryData, setIncidentCategoryData] = useState({ labels: [], datasets: [] });
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [totalResolutions, setTotalResolutions] = useState(0);
  const [userIncidentData, setUserIncidentData]=useState({ labels: [], datasets: [] });
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [splineChartData, setSplineChartData] = useState({ labels: [], datasets: [] });
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userId, setUserId] = useState('');
 
  useEffect(() => {
    const decodeToken = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = jwtDecode(token);
                const userId = parseInt(decoded.userId, 10);
                setUserId(userId);
                localStorage.setItem('user_id', userId);

                console.log('Decoded token:', decoded); // Debug decoded token
                console.log('User ID:', userId); // Debug user ID

                // Fetch user data to check if the user is an admin
                // try {
                //     const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
                //     console.log('User data:', response.data); // Debug user data
                   
                // } catch (error) {
                //     console.error('Error fetching user data:', error);
                // }
            }
        } catch (error) {
            console.error('Error decoding token:', error);
        }
    };

    if (isLoggedIn) {
        decodeToken();
    }
}, [isLoggedIn]);


  useEffect(() => {
    // Function to fetch incident data
    const fetchIncidentData = async () => {
      try {
        const response = await axios.get(API.GET_INCIDENT);
        const incidents = response.data || [];
    
        // Calculate total number of incidents based on the length of the array
        const totalIncidentCount = incidents.length;
    
        console.log('Fetched incidents:', incidents); // Log incidents for debugging
        console.log('Total incident count:', totalIncidentCount); // Log total count for debugging
    
        setTotalIncidents(totalIncidentCount);
    
        // Prepare data for incident trends
        const trendLabels = incidents.map(incident => incident.date || 'Unknown');
        const trendCounts = incidents.map(() => 1); // Each record is counted as 1 incident
    
        if (trendLabels.length && trendCounts.length) {
          setIncidentTrendData({
            labels: trendLabels,
            datasets: [{
              label: 'Incident Trends Over Time',
              data: trendCounts,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
            }],
          });
        }
    
      } catch (error) {
        console.error('Error fetching incident data:', error);
      }
    };
    
    
    const fetchIncidentCountByUser = async () => {
      try {
        const response = await axios.get(API.GET_INCIDENTS_COUNT_BY_USER);
        const incidentData = response.data || [];
  
        const userLabels = incidentData.map(incident => incident.email);
        const incidentCounts = incidentData.map(incident => incident.incident_count);
  
        setUserIncidentData({
          labels: userLabels,
          datasets: [{
            label: 'Incidents per User',
            data: incidentCounts,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          }],
        });
  
      } catch (error) {
        console.error('Error fetching incident count by user:', error);
      }
    };
  
    // Function to fetch incident categories separately
    const fetchIncidentCategoryData = async () => {
      try {
        const response = await axios.get(API.GET_INCIDENT_CATEGORY); // Replace with your API endpoint
        const incidents = response.data || [];
    
        // Initialize an object to hold counts for each category
        const categoryCounts = {};
    
        // Count the number of incidents per category
        incidents.forEach(incident => {
          const category = incident.incidentcategory || 'Unknown'; // Use 'Unknown' for missing categories
          if (categoryCounts[category]) {
            categoryCounts[category] += 1;
          } else {
            categoryCounts[category] = 1;
          }
        });
    
        // Convert the counts to arrays for Chart.js
        const categoryLabels = Object.keys(categoryCounts);
        const categoryCountsArray = Object.values(categoryCounts);
    
        // Update state with the chart data
        setIncidentCategoryData({
          labels: categoryLabels,
          datasets: [{
            label: 'Incident Categories',
            data: categoryCountsArray,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }],
        });
    
      } catch (error) {
        console.error('Error fetching incident category data:', error);
      }
    };
//  // Fetch locations for all users
//  const fetchLocations = async () => {
//   try {
//     const response = await fetch(API.GET_INCIDENT_LOCATION);
//     const data = await response.json();
//     setLocations(data);
//   } catch (error) {
//     console.error('Error fetching locations:', error);
//   }
// };

   
  
    const fetchResolutionData = async () => {
      try {
        const response = await axios.get(API.GET_ADMIN_RESOLUTION);
        const resolutions = response.data || [];
    
        // Group resolutions by user email
        const resolutionCountsByUser = resolutions.reduce((acc, resolution) => {
          const userEmail = resolution.user || 'Unknown'; // Default to 'Unknown' if user is not defined
          acc[userEmail] = (acc[userEmail] || 0) + 1;
          return acc;
        }, {});
    
        // Prepare chart data
        const resolutionLabels = Object.keys(resolutionCountsByUser);
        const counts = Object.values(resolutionCountsByUser);
    
        // Calculate total number of resolutions
        const totalResolutionCount = counts.reduce((sum, count) => sum + count, 0);
    
        setResolutionData({
          labels: resolutionLabels,
          datasets: [{
            label: 'Total Resolutions by User',
            data: counts,
            backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)'],
            borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
            borderWidth: 1,
          }],
        });
    
        setTotalResolutions(totalResolutionCount);
      } catch (error) {
        console.error('Error fetching resolution data:', error);
      }
    };

    //fetch incident priority data
    const fetchIncidentPriorityData = async () => {
      try {
        const response = await axios.get(API.GET_INCIDENTS_BY_PRIORITY); // Replace with your API endpoint
        const incidents = response.data || [];
    
        // Organize data for the chart
        const priorities = [...new Set(incidents.map(incident => incident.priority))];
        const users = [...new Set(incidents.map(incident => incident.user))];
    
        const datasets = users.map(user => {
          return {
            label: user,
            data: priorities.map(priority => {
              const count = incidents.filter(incident => incident.priority === priority && incident.user === user).length || 0;
              return { x: priority, y: count };
            }),
            borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
            backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
            fill: false,
            tension: 0.1, // This makes the line smooth
          };
        });
    
        setSplineChartData({
          labels: priorities,
          datasets: datasets
        });
    
      } catch (error) {
        console.error('Error fetching incident priority data:', error);
      }
    };
    
    const  fetchIncidentTrendData = async () => {
      try {
        const response = await fetch(API.GET_TRENDS);
        const data = await response.json();
  
        if (Array.isArray(data) && data.length > 0) {
          const categories = [...new Set(data.map(item => item.category))];
          const priorities = [...new Set(data.map(item => item.priority))];
  
          const datasets = priorities.map((priority, index) => ({
            label: priority,
            data: categories.map(category => {
              const count = data.find(item => item.category === category && item.priority === priority)?.count || 0;
              return count;
            }),
            type: index % 2 === 0 ? 'line' : 'bar', // Alternating types for demonstration
            borderColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 1)`,
            backgroundColor: `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.2)`,
            fill: false,
          }));
  
          setChartData({
            labels: categories,
            datasets: datasets
          });
        } else {
          setChartData({ labels: [], datasets: [] });
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };



  
    fetchIncidentData();
    fetchIncidentCategoryData(); // Call the separate fetch for incident categories
    fetchResolutionData();
    fetchIncidentCountByUser();
    fetchIncidentTrendData();
    // fetchLocations();
    fetchIncidentPriorityData();
  }, []);
  
  const { labels, datasets } = chartData;
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>
      <div className="flex flex-col md:flex-row md:space-x-4 mb-6">
  <button
    className={`w-full md:w-auto py-2 px-4 text-white font-semibold rounded-lg shadow-md ${currentView === 'category' ? 'bg-blue-500' : 'bg-blue-300'}`}
    onClick={() => setCurrentView('category')}
  >
    {t("admind.incident_categories")}
  </button>
  <button
    className={`w-full md:w-auto py-2 px-4 text-white font-semibold rounded-lg shadow-md ${currentView === 'incident' ? 'bg-blue-500' : 'bg-blue-300'}`}
    onClick={() => setCurrentView('incident')}
  >
    {t("admind.incidents")}
  </button>
  <button
    className={`w-full md:w-auto py-2 px-4 text-white font-semibold rounded-lg shadow-md ${currentView === 'resolution' ? 'bg-blue-500' : 'bg-blue-300'}`}
    onClick={() => setCurrentView('resolution')}
  >
    {t("admind.resolutions")}
  </button>
</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{t("admind.total_incidents")}</h2>
        <p className="text-3xl font-bold text-center">{totalIncidents}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{t("admind.total_resolutions")}</h2>
        <p className="text-3xl font-bold text-center">{totalResolutions}</p>
      </div>
    </div>
      <div className="space-y-6">
        {currentView === 'category' && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Incident Categories</h2>
            <Bar
        data={incidentCategoryData}
        options={{
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw}`,
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
            },
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
          </div>
        )}
        {currentView === 'incident' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Incident Trends Over Time</h2>
              <Chart
      type="bar" // Change to "bar" or "line" or "mixed" based on your needs
      data={{
        labels: labels || [],
        datasets: datasets || [],
      }}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.raw}`,
            },
          },
        },
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
          },
        },
      }}
    />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Incident Priority</h2>
              <Line
  data={splineChartData}
  options={{
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw.y}`,
        },
      },
      // Enable the 3D effect
      'chartjs-plugin-3d': {
        perspective: 100, // Adjust the perspective to achieve a 3D effect
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Priority',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Count',
        },
        beginAtZero: true,
      },
    },
  }}
/>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg col-span-1 md:col-span-2 w-full max-w-4xl mx-auto">
  <Bar
    data={userIncidentData}
    options={{
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: 'User Email',
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Incident Count',
          },
          ticks: {
            stepSize: 5, // Show every number at an interval of 5
            // Optionally add this to ensure no ticks are skipped:
            callback: (value) => value, // This shows every tick without modification
          },
          // Optional: You can define a max value if you want to limit the Y-axis
          // max: <some maximum value>, 
        },
      },
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.dataset.label}: ${context.raw}`,
          },
        },
      },
    }}
  />
</div>


        
          </div>
        )}
        {currentView === 'resolution' && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Resolution Statuses</h2>
            <Bar
  data={{
    labels: resolutionData.labels, // Use the labels from your state
    datasets: [{
      label: 'Total Resolutions by User',
      data: resolutionData.datasets[0].data, // Use the data from your dataset
      backgroundColor: 'rgba(54, 162, 235, 0.5)', // Adjust the color as needed
      borderColor: 'rgba(54, 162, 235, 1)', // Border color
      borderWidth: 1,
    }],
  }}
  options={{
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw}`,
        },
      },
    },
    scales: {
      x: {
        stacked: true, // Enable stacking for the x-axis
      },
      y: {
        stacked: true, // Enable stacking for the y-axis
        beginAtZero: true,
      },
    },
  }}
/>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
