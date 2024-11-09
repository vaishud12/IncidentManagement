import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../Incident/FAddEdit.css'; // Ensure the path is correct
import * as API from "../Endpoint/Endpoint";

const initialState = {
    name:'',
    email: '',
    password:'',
    role: '',
    roletype:'',
    companyname:'',
    designation:'',
    empcode:'',

};

const Adduser = ({ visible, onClose, editItem, loadData }) => {
    const [state, setState] = useState(initialState);
    const { name,
        email,
        password,
        role,
        roletype,
        companyname,
        designation,
        empcode
     } = state;
    const { id } = useParams();
    const [showPassword, setShowPassword] = useState(false);
    const userId = localStorage.getItem("user_id");
    console.log(userId);
    useEffect(() => {
        if (editItem && editItem.id) {
            setState(editItem);
        } else if (id) {
            axios.get(API.GET_USERID(id))
                .then(resp => {
                    console.log("Response:", resp.data);
                    setState(resp.data[0]);
                })
                .catch(error => {
                    console.error("Error fetching data:", error);
                    toast.error("Failed to fetch incident category data.");
                });
        }
    }, [editItem, id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!name || !email || !password || !role || !roletype || !companyname || !designation || !empcode) {
            alert("Please provide a value for each input field");
            return;
        }
    
        try {
            const updatedData = { ...state };
    
            if (editItem && editItem.id) {
                // Update an existing record
                await axios.put(API.PUT_USER_BY_ID(editItem.id), updatedData);
            } else {
                // Create a new record
                await axios.post(API.POST_USERS, updatedData);
            }
            setState(initialState);
            toast.success(`${editItem && editItem.id ? 'User updated' : 'User added'} successfully`);
    
            loadData(); // Reload the data after adding or updating
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
                <center><h1>{editItem && editItem.id ? 'Edit User' : 'Add User'}</h1></center>
                <form onSubmit={handleSubmit}>
                <label htmlFor="themecategory">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name || ""}
                        placeholder="Enter Name"
                        onChange={handleInputChange}
                    />
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email || ""}
                        placeholder="Enter Email"
                        onChange={handleInputChange}
                    />
                    <label htmlFor="password">Password</label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={password || ""}
                        placeholder="Enter Password"
                        onChange={handleInputChange}
                    />
                    <div className="mt-2">
        <label className="text-gray-700 text-sm">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={() => setShowPassword(!showPassword)}
            className="mr-2"
          />
          Show Password
        </label>
      </div>
                    <label htmlFor="role">Role</label>
                    <input
                        type="text"
                        id="role"
                        name="role"
                        value={role || ""}
                        placeholder="Enter Role"
                        onChange={handleInputChange}
                    />
                    <label htmlFor="roletype">Role Type</label>
                    <select
                        id="roletype"
                        name="roletype"
                        value={roletype || ""}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Role Type</option>
                        <option value="current_organization">Current Organization</option>
                        <option value="self_organization">Self Organization</option>
                        <option value="vendor">Vendor</option>
                        
                    </select>

<label htmlFor="companyname">Comapny Name</label>
                    <input
                        type="text"
                        id="companyname"
                        name="companyname"
                        value={companyname || ""}
                        placeholder="Enter Comapny name"
                        onChange={handleInputChange}
                    />

<label htmlFor="designation">Designation</label>
                    <input
                        type="text"
                        id="designation"
                        name="designation"
                        value={designation || ""}
                        placeholder="Enter Designation"
                        onChange={handleInputChange}
                    />

<label htmlFor="empcode">Emp code</label>
                    <input
                        type="text"
                        id="empcode"
                        name="empcode"
                        value={empcode || ""}
                        placeholder="Enter Company name"
                        onChange={handleInputChange}
                    />
                    





                    
                    <input type="submit" value={editItem && editItem.id ? "Update" : "Save"} />
                </form>
                <button onClick={handleGoBack}>Go Back</button>
            </div>
        </div>
    );
};

export default Adduser;
