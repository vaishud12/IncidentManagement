import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Incident/Admin.css'; // Ensure this CSS file is created for styling
import InformationMasterAedit from './InformationMasterAedit';
import * as API from "../Endpoint/Endpoint";
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';
import FIView from './FIView';

const InformationMaster = () => {
    const [data, setData] = useState([]);
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [filteredDatal, setFilteredDatal] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [successMessage, setSuccessMessage] = useState('');
    const itemsPerPage = 25;
    const [chatbotVisible, setChatbotVisible] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [isAdding, setIsAdding] = useState(true); // Track if we are adding or editing
    const [file, setFile] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [selectedInformation, setSelectedInformation] = useState(null);
    const [hoveredItemId, setHoveredItemId] = useState(null);
    const [fViewVisible, setFViewVisible] = useState(false);
    const openFViewModal = (item) => {
        setSelectedInformation(item);
        setFViewVisible(true);
    };

    const closeFViewModal = () => {
        setFViewVisible(false);
    };

    const loadData = async () => {
        try {
            const response = await axios.get(API.GET_INFORMATION_MASTER);
            console.log("Fetched data:", response.data); // Debugging line
            setData(response.data);
            setLoading(false);
        } catch (error) {
            setError("Error fetching data");
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const deleteObject = async (informationmasterid) => {
        if (!informationmasterid) return; // Safety check

        if (window.confirm("Are you sure you want to delete this object?")) {
            try {
                const response = await axios.delete(API.DELETE_INFORMATION_MASTER(informationmasterid));
                if (response.status === 200) {
                    setSuccessMessage('Incident category deleted successfully');
                    setData(prevData => prevData.filter(item => item.informationmasterid !== informationmasterid));
                }
                setTimeout(() => setSuccessMessage(''), 3000);
            } catch (error) {
                console.error("Error deleting object:", error);
            }
        }
    };

    const filterData = (data) => {
        return data.filter(item => {
            const matchesSearch = searchQuery ? 
                (item.incidentname && item.incidentname.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.informationdescription && item.informationdescription.toLowerCase().includes(searchQuery.toLowerCase())) 
                : true;
            return matchesSearch;
        });
    };

    const filteredData = filterData(data);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleEditUserClick = (informationmasterid) => {
        setEditItem(informationmasterid);
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

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

   


    const handleUpload = async () => {
      if (!file) {
          alert("Please upload an Excel file.");
          return;
      }
  
      const formData = new FormData();
      formData.append('file', file); // Append the file to FormData
  
      try {
          const response = await axios.post(API.POST_INFORMATION_EXCEL_MASTER, formData, {
              headers: {
                  'Content-Type': 'multipart/form-data', // Ensure the content type is set
              },
          });
          if (response.status === 200) {
              alert('Data uploaded successfully!');
          }
      } catch (error) {
          console.error("Error uploading data:", error);
          alert("Error uploading data.");
      }
  };
  

    return (
        <>
            <div className="admin-container">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center', // Center horizontally
                    marginBottom: '12px' // Space below the input field
                }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search..."
                        style={{
                            width: '300px',  // Fixed width for smaller size
                            maxWidth: '100%', // Responsive width
                            padding: '8px',
                            fontSize: '14px',
                            border: '1px solid #ccc', // Light border
                            borderRadius: '4px', // Rounded corners
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Slight shadow for depth
                            fontFamily: 'Poppins'
                        }}
                    />
                </div>
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
                    {t("sectord.add_incident_category")}
                </button>

                <div style={{
    display: 'flex',
    flexDirection: 'column', // Arrange elements vertically
    alignItems: 'center', // Center elements horizontally
    gap: '10px', // Space between elements
    marginTop: '20px' // Space above the container
}}>
    <p style={{
        fontSize: '16px',
        fontFamily: 'Poppins',
        margin: '0 0 10px 0', // Space below the text
        color: '#333' // Dark text color
    }}>
        Select Excel file only to upload all the Informations
    </p>
    <input 
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFileChange} 
        style={{
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            padding: '8px', 
            fontSize: '14px', 
            fontFamily: 'Poppins', 
            width: '100%', 
            maxWidth: '300px'
        }} 
    />
    <button 
        onClick={handleUpload} 
        style={{
            backgroundColor: '#3385ffdf', 
            color: 'white', 
            padding: '10px 20px', 
            fontSize: '16px', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            transition: 'background-color 0.3s', 
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom:'4px',
        }}
    >
        {t("sectord.upload")}
    </button>
</div>


                {chatbotVisible && (
                    <div className="modal-overlay">
                        
                            <span className="modal-close" onClick={closeModal}>&times;</span>
                            <InformationMasterAedit
                                onClose={closeModal} 
                                editItem={editItem} 
                                isAdding={isAdding} 
                                loadData={loadData} 
                            />
                        
                    </div>
                )}

                {successMessage && (
                    <div className="success-message">{successMessage}</div>
                )}

                {data.length === 0 ? (
                    <p>No Information found.</p>
                ) : (
                    <table className="styled-table">
                        <thead>
                            <tr>
                               
                                
                                <th>Incident Sector</th>
                                <th>Incident Category</th>
                                <th>Incident Name</th>
                              
                               <th>City</th>
                               <th>Tags</th>
                               <th>Information Type</th>
                                <th>Information Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
    {currentItems.map((item) => (
        <tr key={item.informationmasterid}>
            <td>{item.sector}</td>
            <td>{item.incidentcategory}</td>
            <td>{item.incidentname}</td>
            <td>{item.city}</td>
            <td>{Array.isArray(item.tagss) ? item.tagss.join(', ') : 'No Tags'}</td>
            <td>{item.informationmastertype}</td>

            <td style={{ position: 'relative', overflow: 'visible' }}>
                {/* Render content as HTML but make sure links are blue */}
                {item.informationdescription?.content && (
                    <div>
                        <strong>Description:</strong>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: item.informationdescription.content.replace(
                                    /<a([^>]+)>(.*?)<\/a>/g,
                                    (match, p1, p2) => {
                                        return `<a${p1} style="color: blue; text-decoration: underline;">${p2}</a>`;
                                    }
                                ),
                            }}
                        />
                    </div>
                )}

                {/* Display image if available */}
                {item.informationdescription?.image && (
                    <div>
                        <strong>Image:</strong>
                        <img
                            src={API.GET_IMAGE_URL(item.informationdescription.image)} // Assuming the function returns a full URL
                            alt="Uploaded content"
                            style={{ maxWidth: '30%', height: 'auto' }}
                        />
                    </div>
                )}

                {/* Fallback if no content or image */}
                {(!item.informationdescription?.content &&
                    !item.informationdescription?.image) && (
                    <div>No information available</div>
                )}
            </td>

            <td>
                <button 
                    onClick={() => openFViewModal(item)}
                    className="btn btn-view"
                >
                    {t("incidentd.view")}
                </button>
                {fViewVisible && selectedInformation && (
                    <div className="backdrop">
                        <div className="modal-body">
                            <FIView 
                                isOpen={fViewVisible} 
                                closeModal={closeFViewModal} 
                                item={selectedInformation} 
                            />
                        </div>
                    </div>
                )}

                <button 
                    className="btn btn-edit" 
                    onClick={() => handleEditUserClick(item.informationmasterid)}
                >
                    {t("sectord.edit")}
                </button>
                
                <button 
                    className="btn btn-delete" 
                    onClick={() => deleteObject(item.informationmasterid)}
                >
                    {t("sectord.delete")}
                </button>
            </td>
        </tr>
    ))}
</tbody>

                    </table>
                )}

<center>
  <div className="pagination">
    <button
      onClick={() => paginate(currentPage - 1)}
      disabled={currentPage === 1}
    >
      &#x2039; {/* Left arrow */}
    </button>

    {Array.from(
      { length: Math.ceil(filteredDatal.length / itemsPerPage) },
      (_, i) => (
        <button
          key={i + 1}
          onClick={() => paginate(i + 1)}
          className={currentPage === i + 1 ? "active" : ""}
        >
          {i + 1}
        </button>
      )
    )}

    <button
      onClick={() => paginate(currentPage + 1)}
      disabled={
        currentPage === Math.ceil(filteredDatal.length / itemsPerPage)
      }
    >
      &#x203A; {/* Right arrow */}
    </button>
  </div>
</center>
            </div>
        </>
    );
};

export default InformationMaster;
