import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as API from "../Endpoint/Endpoint";

const UFview = ({ isOpen, closeModal, incident }) => {
    const [isImageModalOpen, setImageModalOpen] = useState(false);

    if (!isOpen) return null; // If not open, return null to avoid rendering

    const handleImageClick = () => {
        setImageModalOpen(true);
    };

    const handleCloseImageModal = () => {
        setImageModalOpen(false);
    };

    

    // const closeButtonStyle = {
    //     position: 'absolute',
    //     top: '10px',
    //     right: '10px',
    //     fontSize: '24px',
    //     color: '#555',
    //     cursor: 'pointer',
    //     transition: 'color 0.2s',
    // };

    // const closeButtonHoverStyle = {
    //     color: '#f44336',
    // };

    const titleStyle = {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '20px',
        textAlign: 'center',
        color: '#333',
    };

    const detailStyle = {
        fontSize: '14px',
        marginBottom: '10px',
        color: '#555',
    };

    const imageStyle = {
        maxWidth: '100%',
        height: 'auto',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    };

    const imageHoverStyle = {
        opacity: '0.8',
    };

    const fullscreenImageStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 60,
    };

    const fullscreenImageContentStyle = {
        maxWidth: '90%',
        maxHeight: '90%',
        objectFit: 'contain',
    };

    const fullscreenCloseButtonStyle = {
        position: 'absolute',
        top: '10px',
        right: '20px',
        fontSize: '36px',
        color: 'white',
        cursor: 'pointer',
    };

    return (
        <div className={`modal `} style={{ marginTop: "18px" }}>
            <div >
                {/* <span
                    style={closeButtonStyle}
                    onMouseOver={(e) => (e.currentTarget.style.color = closeButtonHoverStyle.color)}
                    onMouseOut={(e) => (e.currentTarget.style.color = closeButtonStyle.color)}
                    onClick={closeModal}
                >
                    &times;
                </span> */}
                <h2 style={titleStyle}>Incident Details</h2>
                <div style={detailStyle}>
                    <p><strong>Incident Name:</strong> {incident.incidentname}</p>
                    <p><strong>Category:</strong> {incident.incidentcategory}</p>
                    <p><strong>Description:</strong> {incident.description}</p>
                    <p><strong>Date:</strong> {incident.date}</p>
                    <p><strong>Current Address:</strong> {incident.currentaddress}</p>
                    <p><strong>GPS:</strong> {incident.gps}</p>
                    <p><strong>Owner:</strong> {incident.incidentowner}</p>
                    <p><strong>Raised To User:</strong> {incident.raisedtouser}</p>
                    <p><strong>Priority:</strong> {incident.priority || 'N/A'}</p>
                    <p><strong>Tags:</strong> {incident.tagss?.length ? incident.tagss.join(', ') : 'None'}</p>
                    <p><strong>Remarks:</strong> {incident.remarks || 'No remarks provided'}</p>
                    <p><strong>Status:</strong> {incident.status || 'Unknown'}</p>
                </div>

                {incident.photo && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <img
                            src={API.GET_IMAGE_URL(incident.photo)}
                            alt="Incident"
                            style={imageStyle}
                            onMouseOver={(e) => (e.currentTarget.style.opacity = imageHoverStyle.opacity)}
                            onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                            onClick={handleImageClick}
                        />
                    </div>
                )}

                {isImageModalOpen && (
                    <div style={fullscreenImageStyle}>
                        <div style={{ position: 'relative' }}>
                            <span
                                style={fullscreenCloseButtonStyle}
                                onClick={handleCloseImageModal}
                            >
                                &times;
                            </span>
                            <img
                                src={API.GET_IMAGE_URL(incident.photo)}
                                alt="Full Screen"
                                style={fullscreenImageContentStyle}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

UFview.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    incident: PropTypes.shape({
        incidentname: PropTypes.string,
        incidentcategory: PropTypes.string,
        description: PropTypes.string,
        date: PropTypes.string,
        currentaddress: PropTypes.string,
        gps: PropTypes.string,
        incidentowner: PropTypes.string,
        raisedtouser: PropTypes.string,
        priority: PropTypes.string,
        tagss: PropTypes.arrayOf(PropTypes.string),
        photo: PropTypes.string,
        remarks: PropTypes.string,
        status: PropTypes.string,
    }).isRequired,
};

export default UFview;
