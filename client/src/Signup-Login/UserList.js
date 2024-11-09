import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Incident/Admin.css'; // Importing FTable styles
import Adduser from "./Adduser";
import * as API from "../Endpoint/Endpoint";

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chatbotVisible, setChatbotVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [isAdding, setIsAdding] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [data, setData] = useState([]);
    const [file, setFile] = useState(null);
   


    const fetchUsers = async () => {
        try {
            const response = await axios.get(API.GET_USERS, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            setUsers(response.data);
            setLoading(false);
        } catch (err) {
            setError('Error fetching users');
            setLoading(false);
        }
    };

    
    useEffect(() => {
        fetchUsers();
    }, []);


    const deleteObject = async (id) => {
        if (!id) return; // Safety check

        if (window.confirm("Are you sure you want to delete this User?")) {
            try {
                const response = await axios.delete(API.DELETE_USERID(id));
                if (response.status === 200) {
                    setSuccessMessage('User deleted successfully');
                    setData(prevData => prevData.filter(item => item.id !== id));
                }
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error("Error deleting object:", error);
            }
        }
    };
    const handleEditUserClick = (user) => {
        setEditItem(user);
        setIsAdding(false); // Set to false to indicate editing
        openModal();
    };

    const handleAddClick = () => {
        setEditItem(null);
        setIsAdding(true); // Set to true to indicate adding
        openModal();
    };

    const openModal = () => {
        setChatbotVisible(true);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setChatbotVisible(false);
        document.body.style.overflow = 'auto';
    };
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'application/vnd.ms-excel' || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            setFile(file);
        } else {
            setError('Invalid file type. Please upload an Excel file.');
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('No file selected');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(API.POST_USERS_EXCEL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Upload response:', response.data);
            setSuccessMessage('File uploaded successfully');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error uploading file: Check Email', err);
            setError('Error uploading file');
        }
    };

    if (loading) return <p>Loading users...</p>;
    if (error) return <p>{error}</p>;
    // Styles for the modal overlay and modal content
 
    return (
        <div className="user-list-container">
        <h2 className="user-list-title">All Users</h2>
        <button 
                    className="btn btn-add" 
                    style={{
                        backgroundColor: '#3385ffdf',
                        color: 'white',
                        padding: '8px 17px',
                        fontSize: '14px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
                    }} 
                    onClick={handleAddClick}
                >
                    Add User
                </button>
               {/* File upload section */}
               <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: '20px', 
   
    borderRadius: '10px', 
  
    width: '300px', 
    margin: '20px auto' 
}}>
    <input 
        type="file" 
        onChange={handleFileChange} 
        style={{
            marginBottom: '15px',
            padding: '10px',
            cursor: 'pointer',
            backgroundColor: '#fff',
            borderRadius: '5px',
            border: '1px solid #ccc'
        }}
    />
    <button 
        onClick={handleUpload}
        style={{
            padding: '10px 20px',
            backgroundColor: 'blue',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px'
        }}
    >
        Upload File
    </button>
    {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
</div>


                {chatbotVisible && (
                    < div className="modal-overlay">
                        
                            <span className="modal-close" onClick={closeModal}>&times;</span>
                            <Adduser onClose={closeModal} editItem={editItem}  />
                            
                        
                    </div>
                )}

        <table className="styled-table">
            <thead>
                <tr>
                    <th>S.No</th> {/* Serial number header */}
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Role Type</th>
                    <th>Comapny Name</th>
                    <th>Designation</th>
                    <th>Emp Code</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {users.length > 0 ? (
                    users.map((user, index) => (
                        <tr key={user.id}>
                            <td>{index + 1}</td> {/* Serial number */}
                            <td>{user.id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>{user.roletype}</td>
                            <td>{user.companyname}</td>
                            <td>{user.designation}</td>
                            <td>{user.empcode}</td>
                            <td>
                            <button className="btn btn-edit" onClick={() => handleEditUserClick(user)}>Edit</button>
                                <button className="btn btn-delete" onClick={() => deleteObject(user.id)}>Delete</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6">No users found</td> {/* Adjust colspan to match the number of columns */}
                    </tr>
                )}
            </tbody>
        </table>
    </div>
    
    );
};

export default UserList;
