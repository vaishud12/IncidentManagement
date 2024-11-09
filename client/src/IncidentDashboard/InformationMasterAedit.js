import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../Incident/FAddEdit.css'; // Ensure the path is correct
import * as API from "../Endpoint/Endpoint";
import PlainTextQuillEditor from "../components/PlainTextQuillEditor";
import { useTranslation } from 'react-i18next';
import { WithContext as ReactTags } from "react-tag-input";
const initialState = {
    sector: '',
    incidentcategory: '',
    incidentname: '',
    city:'',
    tagss: [],
    informationmastertype: '',
    informationdescription: {},
};

const InformationMasterAedit = ({ visible, onClose, editItem, loadData }) => {
    const [state, setState] = useState(initialState);
    const { sector, incidentcategory, incidentname, city, informationmastertype, informationdescription } = state;
    const { informationmasterid } = useParams();
    const [remark, setRemark] = useState(''); // for PlainTextQuillEditor value
    const { t } = useTranslation();
    const [imageFile, setImageFile] = useState(null);
    const [sectors, setSectors] = useState([]);
    const [incidentCategories, setIncidentCategories] = useState([]);
    const [incidentNames, setIncidentNames] = useState([]);
    const quillRef = useRef(); // Create a ref to the PlainTextQuillEditor
    const [tags, setTags] = useState(initialState);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (sectors.length === 0) {
                    const sectorRes = await axios.get(API.GET_DISTINCT_SECTOR);
                    setSectors(sectorRes.data);
                }

                if (sector) {
                    const categoryRes = await axios.get(`${API.GET_DISTINCT_INCIDENT_CATEGORY}?sector=${sector}`);
                    setIncidentCategories(categoryRes.data);
                    setIncidentNames([]); 
                } else {
                    setIncidentCategories([]);
                    setIncidentNames([]);
                }

                if (incidentcategory) {
                    const nameRes = await axios.get(`${API.GET_INCIDENT_NAME_BASEDON_INCIDENTCATEGORY}?incidentcategory=${incidentcategory}`);
                    setIncidentNames(nameRes.data);
                } else {
                    setIncidentNames([]);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [sector, incidentcategory, sectors.length]);

    useEffect(() => {
        if (editItem) {
            axios.get(API.GET_SPECIFIC_INFORMATION_MASTER(editItem))
                .then(resp => {
                    const data = resp.data[0];
                    setState({
                        ...data,
                        informationdescription: data.informationdescription || {},
                    });
                    if (data.tagss && Array.isArray(data.tagss)) {
                        const auditeesTags = data.tagss.map((tag, index) => ({
                            id: tag, // Ideally use a unique ID
                            text: tag.trim(),
                        }));
    
                        setTags({ tagss: auditeesTags }); // Ensure you're setting the tags properly
                    }
                    if (quillRef.current) {
                        // Set editor content using the method exposed via ref
                        quillRef.current.setEditorContents(data.informationdescription.text || ""); 
                    }
                })
                .catch(error => {
                    toast.error("Failed to fetch incident category data.");
                });
        }
    }, [editItem]);
    
    const handleDelete = (i) => {
        const newTags = tags.tagss.filter((tag, index) => index !== i);
        setTags((prevState) => ({ ...prevState, tagss: newTags }));
      };
    
      const handleAddition = (tag) => {
       setTags((prevState) => ({
          ...prevState,
         tagss: [...prevState.tagss, tag],
        }));
      };

      const KeyCodes = {
        comma: 188,
        enter: 13,
      };
    
      const delimiters = [KeyCodes.comma, KeyCodes.enter];
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file || null);
    };

    const handleRemarkChange = (informationDescription) => {
        setState(prevState => ({
            ...prevState,
            informationdescription: informationDescription,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
      
        console.log("Before Submission - Sector:", state.sector);
      
        // Check if sector is provided
        if (!state.sector) {
          toast.error("Sector is required");
          return; // Stop submission
        }
      
        // Check if other required fields are provided
        if (!state.incidentcategory || !state.incidentname || !state.city) {
          toast.error("All fields are required");
          return; // Stop submission
        }
      
        // Prepare the form data
        const formData = new FormData();
      
        // Append basic form fields
        formData.append('sector', state.sector || "");
        formData.append('incidentcategory', state.incidentcategory || "");
        formData.append('incidentname', state.incidentname || "");
        formData.append('city', state.city || "");
      
        // Append tags as a comma-separated string
        formData.append("tagss", tags.tagss.map((tag) => tag.text).join(","));
        formData.append('informationmastertype', state.informationmastertype || "");
      
        // Prepare the description data
        const descriptionData = {
          content: informationdescription.htmlContent || "", // Raw HTML content
          image: imageFile ? imageFile.name : "" // Store image name if there's an image file
        };
      
        formData.append('informationdescription', JSON.stringify(descriptionData)); // Add HTML content and image name
      
        // If there's an image file, append it to the form data
        if (imageFile) {
          formData.append('image', imageFile); // This will send the image file
        }
      
        console.log("Form Data Before Submission:");
        for (let [key, value] of formData.entries()) {
          // Don't log sensitive data (like image files)
          if (key !== 'image') {
            console.log(`${key}: ${value}`);
          }
        }
      
        try {
          // Make the API request based on whether we're editing or creating
          const apiEndpoint = editItem ? API.UPDATE_SPECIFIC_INFORMATION_MASTER(editItem) : API.POST_INFORMATION_MASTER;
          const method = editItem ? 'put' : 'post';
      
          await axios[method](apiEndpoint, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });
      
          // Reset state and notify the user of success
          setState(initialState);
          toast.success(`${editItem ? 'Information updated' : 'Information added'} successfully`);
          loadData();
          onClose();
        } catch (error) {
          console.error("Submission Error:", error);
      
          // Improved error handling
          const errorMessage = error.response ? error.response.data.error : "An unexpected error occurred";
          toast.error(errorMessage);
        }
      };
      
   
    // Function to handle "Go Back" action
    const handleGoBack = () => {
        onClose();
    };
    


    return (
        <div className={`modal ${visible ? 'show' : 'hide'}`} style={{ marginTop: "20px" }}>
            <div className="modal-content">
                <center><h1>{editItem ? 'Edit Information' : 'Add Information'}</h1></center>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label>Sector</label>
                        <select
                            style={{ fontFamily: "Poppins" }}
                            name="sector"
                            value={sector || ""}
                            onChange={handleInputChange}
                        >
                            <option value="">{t("addincident.select_sector")}</option>
                            {sectors.map((sectory) => (
                                <option key={sectory.sector} value={sectory.sector}>
                                    {sectory.sector}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>Incident category</label>
                        <select
                            style={{ fontFamily: "Poppins" }}
                            name="incidentcategory"
                            value={incidentcategory || ""}
                            onChange={handleInputChange}
                        >
                            <option value="">{t("addincident.select_incident_category")}</option>
                            {incidentCategories.map((category) => (
                                <option key={category.incidentcategoryid} value={category.incidentcategory}>
                                    {category.incidentcategory}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label>incident Name</label>
                        <select
                            style={{ fontFamily: "Poppins" }}
                            name="incidentname"
                            value={incidentname || ""}
                            onChange={handleInputChange}
                        >
                            <option value="">{t("addincident.select_incident_name")}</option>
                            {incidentNames.map((name) => (
                                <option key={name.incidentnameid} value={name.incidentname}>
                                    {name.incidentname}
                                </option>
                            ))}
                        </select>
                    </div>
                    <label htmlFor="city">{t("addincident.current_address")}</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={city || ""}
                        placeholder="Enter city"
                        onChange={handleInputChange}
                    />

<div>
                  <label className="add-edit-project-label" htmlFor="tags">
                    Tags
                  </label>
                  <div>
                    <ReactTags
                      tags={tags.tagss}
                      handleDelete={handleDelete}
                      handleAddition={handleAddition}
                      delimiters={delimiters}
                      placeholder="Add Tags"
                    />
                  </div>
                </div>
                    <label htmlFor="informationmastertype">Information Type</label>
                    <select
                        id="informationmastertype"
                        name="informationmastertype"
                        value={informationmastertype || ""}
                        onChange={handleInputChange}
                    >
                        <option value="">Select Information Type</option>
                        <option value="casestudy">Case Study</option>
                        <option value="videorecommendation">Video Recommendation</option>
                        <option value="researchpaper">Research Paper</option>
                        <option value="startups">Startups</option>
                        <option value="undiscoveredinnovation">Undiscovered Innovation</option>
                    </select>
                    <label htmlFor="informationdescription">Information Description</label>
                    <PlainTextQuillEditor 
                         ref={quillRef}
                        onChange={handleRemarkChange} 
                    />
                   <div>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                        
                    </div>
                    <input type="submit" value={editItem? "Update" : "Save"} />
                    
                </form>
                <button onClick={handleGoBack}>Go Back</button>
            </div>
        </div>
    );
};

export default InformationMasterAedit;
