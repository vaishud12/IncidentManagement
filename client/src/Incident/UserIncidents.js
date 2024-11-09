import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserIncidents = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserIncidents = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5014/incident-api/user-incidents', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setIncidents(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching incidents:', error);
                setError('Error fetching incidents. Please try again later.'); // Set error message
                setLoading(false);
            }
        };

        fetchUserIncidents();
    }, []);

    if (loading) {
        return <p>Loading...</p>; // Consider using a spinner or more detailed loading indicator
    }

    if (error) {
        return <p>{error}</p>; // Display error message if fetching incidents fails
    }

    return (
        <div>
            <h2>Your Incidents</h2>
            {incidents.length === 0 ? (
                <p>No incidents found.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Incident Name</th>
                            <th>Category</th>
                            <th>Description</th>
                            <th>Date</th>
                            {/* Add more table headers as needed */}
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.map((incident) => (
                            <tr key={incident.incidentid}>
                                <td>{incident.incidentname}</td>
                                <td>{incident.incidentcategory}</td>
                                <td>{incident.description}</td>
                                <td>{incident.date}</td>
                                {/* Add more table data cells as needed */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserIncidents;
