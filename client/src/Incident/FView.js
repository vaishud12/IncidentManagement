import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as API from "../Endpoint/Endpoint";

const FView = ({ isOpen, closeModal, incident }) => {
    const [isImageModalOpen, setImageModalOpen] = useState(false);

    if (!isOpen) return null; // If not open, return null to avoid rendering

    const handleImageClick = () => {
        setImageModalOpen(true);
    };

    const handleCloseModal = () => {
        setImageModalOpen(false);
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full relative overflow-y-auto">
                <button
                    className="absolute top-3 right-4 text-2xl text-gray-700 cursor-pointer hover:text-red-600 transition-colors"
                    onClick={closeModal}
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">Incident Details</h2>

                <div className="space-y-2 mb-6">
                    <p className="text-lg"><strong>Incident Name:</strong> {incident.incidentname}</p>
                    <p className="text-lg"><strong>Category:</strong> {incident.incidentcategory}</p>
                    <p className="text-lg"><strong>Description:</strong> {incident.description}</p>
                    <p className="text-lg"><strong>Date:</strong> {incident.date}</p>
                    <p className="text-lg"><strong>Current Address:</strong> {incident.currentaddress}</p>
                    <p className="text-lg"><strong>GPS:</strong> {incident.gps}</p>
                    <p className="text-lg"><strong>Owner:</strong> {incident.incidentowner}</p>
                    <p className="text-lg"><strong>Raised To User:</strong> {incident.raisedtouser}</p>
                    <p className="text-lg"><strong>Priority:</strong> {incident.priority || 'N/A'}</p>
                    <p className="text-lg"><strong>Tags:</strong> {incident.tagss?.length ? incident.tagss.join(', ') : 'None'}</p>
                    <p className="text-lg"><strong>Remarks:</strong> {incident.remarks || 'No remarks provided'}</p>
                    <p className="text-lg"><strong>Status:</strong> {incident.status || 'Unknown'}</p>
                </div>

                {incident.photo && (
                    <div className="flex justify-center mb-6">
                        <img
                            src={API.GET_IMAGE_URL(incident.photo)}
                            alt="Incident"
                            style={{ maxWidth: '25%', maxHeight: '70px', objectFit: 'cover' }}
                            className="rounded-lg shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={handleImageClick}
                        />
                    </div>
                )}

                {isImageModalOpen && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center z-60">
                        <div className="relative max-w-full max-h-full">
                            <button
                                className="absolute top-2 right-2 text-3xl text-white cursor-pointer hover:text-red-600"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                            <img
                                src={API.GET_IMAGE_URL(incident.photo)}
                                alt="Full Screen"
                                style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                                className="rounded-lg shadow-md"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

FView.propTypes = {
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

export default FView;
