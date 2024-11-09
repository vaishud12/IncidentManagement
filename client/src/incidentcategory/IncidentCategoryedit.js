import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../Incident/FAddEdit.css'; // Ensure the path is correct
import * as API from "../Endpoint/Endpoint";

const initialState = {
    sector:'',
    incidentcategory: '',
    incidentname: '',
    incidentdescription: '',
};

const IncidentCategoryedit = ({ visible, onClose, editItem, loadData }) => {
    const [state, setState] = useState(initialState);
    const { sector, incidentcategory, incidentname, incidentdescription } = state;
    const { incidentcategoryid } = useParams();
    const userId = localStorage.getItem("user_id");
    console.log(userId);
    useEffect(() => {
        if (editItem && editItem.incidentcategoryid) {
            setState(editItem);
        } else if (incidentcategoryid) {
            axios.get(API.GET_SPECIFIC_INCIDENT_CATEGORY(incidentcategoryid))
                .then(resp => {
                    console.log("Response:", resp.data);
                    setState(resp.data[0]);
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                    toast.error("Failed to fetch incident category data.");
                });
        }
    }, [editItem, incidentcategoryid]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!sector ||!incidentcategory || !incidentname || !incidentdescription) {
            toast.error("Please provide a value for each input field");
            return;
        }
        
        try {
            const updatedData = { ...state, userid: userId };

            if (editItem && editItem.incidentcategoryid) {
                // For updating an existing record
                await axios.put(API.UPDATE_SPECIFIC_INCIDENT_CATEGORY(editItem.incidentcategoryid), updatedData);
            } else {
                // For creating a new record
                await axios.post(API.POST_INCIDENT_CATEGORY, updatedData);
            }
            setState(initialState);
            toast.success(`${editItem && editItem.incidentcategoryid ? 'Incident updated' : 'Incident added'} successfully`);
            
            const message = `Sector: ${sector}\nIncident Category: ${incidentcategory}\nIncident Name: ${incidentname}\nDescription: ${incidentdescription}`;
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            
            loadData(); // Reload the data after adding or updating an incident
            onClose(); // Close the modal after successful submit
        } catch (error) {
            console.error("Error in handleSubmit:", error);
            toast.error(error.response ? error.response.data.error : "An unexpected error occurred");
        }
    };

    const handleGoBack = () => {
        onClose();
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    return (
        <div className={`modal ${visible ? 'show' : 'hide'}`} style={{ marginTop: "20px" }}>
            <div className="modal-content">
                <center><h1>{editItem && editItem.incidentcategoryid ? 'Edit Incident Category' : 'Add Incident Category'}</h1></center>
                <form onSubmit={handleSubmit}>
                <label htmlFor="themecategory">Sector</label>
                    <input
                        type="text"
                        id="sector"
                        name="sector"
                        value={sector || ""}
                        placeholder="Enter Sector"
                        onChange={handleInputChange}
                    />
                    <label htmlFor="incidentcategory">Incident Category</label>
                    <input
                        type="text"
                        id="incidentcategory"
                        name="incidentcategory"
                        value={incidentcategory || ""}
                        placeholder="Enter Incident Category"
                        onChange={handleInputChange}
                    />
                    <label htmlFor="incidentname">Incident Name</label>
                    <input
                        type="text"
                        id="incidentname"
                        name="incidentname"
                        value={incidentname || ""}
                        placeholder="Enter Incident Name"
                        onChange={handleInputChange}
                    />
                    <label htmlFor="incidentdescription">Incident Description</label>
                    <input
                        type="text"
                        id="incidentdescription"
                        name="incidentdescription"
                        value={incidentdescription || ""}
                        placeholder="Enter Incident Description"
                        onChange={handleInputChange}
                    />
                    
                    <input type="submit" value={editItem && editItem.incidentcategoryid ? "Update" : "Save"} />
                </form>
                <button onClick={handleGoBack}>Go Back</button>
            </div>
        </div>
    );
};

export default IncidentCategoryedit;
