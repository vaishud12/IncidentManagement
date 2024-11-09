import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Incident/Admin.css'; // Ensure this CSS file is created for styling
import IncidentCategoryedit from './IncidentCategoryedit';
import * as API from "../Endpoint/Endpoint";
import * as XLSX from 'xlsx';
import { useTranslation } from 'react-i18next';

const IncidentCategory = () => {
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

    const loadData = async () => {
        try {
            const response = await axios.get(API.GET_INCIDENT_CATEGORY);
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

    const deleteObject = async (incidentcategoryid) => {
        if (!incidentcategoryid) return; // Safety check

        if (window.confirm("Are you sure you want to delete this object?")) {
            try {
                const response = await axios.delete(API.DELETE_INCIDENT_CATEGORY(incidentcategoryid));
                if (response.status === 200) {
                    setSuccessMessage('Incident category deleted successfully');
                    setData(prevData => prevData.filter(item => item.incidentcategoryid !== incidentcategoryid));
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
                (item.incidentdescription && item.incidentdescription.toLowerCase().includes(searchQuery.toLowerCase())) 
                : true;
            return matchesSearch;
        });
    };

    const filteredData = filterData(data);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleEditUserClick = (item) => {
        setEditItem(item);
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

    const groupBySectorAndCategory = (data) => {
        const groupedData = {};
        data.forEach(item => {
            if (!groupedData[item.sector]) {
                groupedData[item.sector] = {};
            }
            if (!groupedData[item.sector][item.incidentcategory]) {
                groupedData[item.sector][item.incidentcategory] = [];
            }
            groupedData[item.sector][item.incidentcategory].push(item);
        });
        return groupedData;
    };

    const groupedData = groupBySectorAndCategory(currentItems);


    const handleUpload = async () => {
        if (!file) {
            alert("Please upload an Excel file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetNames = workbook.SheetNames;
            const sheet = workbook.Sheets[sheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            try {
                const response = await axios.post(API.POST_INCIDENT_CATEGORY_EXCEL, jsonData);
                if (response.status === 200) {
                    alert('Data uploaded successfully!');
                }
            } catch (error) {
                console.error("Error uploading data:", error);
                alert("Error uploading data.");
            }
        };
        reader.readAsArrayBuffer(file);
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
        {t("sectord.select_excel_file")}
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
                        <div className="modal-content">
                            <span className="modal-close" onClick={closeModal}>&times;</span>
                            <IncidentCategoryedit 
                                onClose={closeModal} 
                                editItem={editItem} 
                                isAdding={isAdding} 
                                loadData={loadData} 
                            />
                        </div>
                    </div>
                )}

                {successMessage && (
                    <div className="success-message">{successMessage}</div>
                )}

                {data.length === 0 ? (
                    <p>No incidents found.</p>
                ) : (
                    <table className="styled-table">
                        <thead>
                            <tr>
                               
                                <th>{t("sectord.sector")}</th>
                                <th>{t("sectord.incident_category")}</th>
                                <th>{t("sectord.incident_name")}</th>
                                
                                <th>{t("sectord.incident_description")}</th>
                                <th>{t("sectord.action")}</th>
                            </tr>
                        </thead>
                        <tbody>
                        {Object.keys(groupedData).map(sector => (
                            Object.keys(groupedData[sector]).map((category, categoryIndex) => (
                                groupedData[sector][category].map((item, itemIndex) => (
                                    <tr key={item.incidentcategoryid}>
                                        {categoryIndex === 0 && itemIndex === 0 && (
                                            <td rowSpan={Object.keys(groupedData[sector]).reduce((acc, cat) => acc + groupedData[sector][cat].length, 0)}>
                                                {sector}
                                            </td>
                                        )}
                                        {itemIndex === 0 && (
                                            <td rowSpan={groupedData[sector][category].length}>
                                                {category}
                                            </td>
                                        )}
                                        <td>{item.incidentname}</td>
                                        <td>{item.incidentdescription}</td>
                                        <td>
                                            <button className="btn btn-edit" onClick={() => handleEditUserClick(item)}>{t("sectord.edit")}</button>
                                            <button className="btn btn-delete" onClick={() => deleteObject(item.incidentcategoryid)}>{t("sectord.delete")}</button>
                                        </td>
                                    </tr>
                                ))
                            ))
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

export default IncidentCategory;
