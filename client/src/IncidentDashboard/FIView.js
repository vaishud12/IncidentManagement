import React, { useState } from 'react';
import PropTypes from 'prop-types';
import * as API from "../Endpoint/Endpoint";

const FIView = ({ isOpen, closeModal, item = {} }) => {
    const [isImageModalOpen, setImageModalOpen] = useState(false);

    if (!isOpen) return null;

    const handleImageClick = () => {
        setImageModalOpen(true);
    };

    const handleCloseModal = () => {
        setImageModalOpen(false);
    };

    // Function to style the href links in blue
    const styleLinksInContent = (content) => {
        return content.replace(/<a([^>]*)href="([^"]*)"([^>]*)>(.*?)<\/a>/g, (match, p1, p2, p3, p4) => {
            return `<a href="${p2}" ${p1} style="color: blue; text-decoration: underline;" target="_blank" rel="noopener noreferrer">${p4}</a>`;
        });
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full relative max-h-[80vh] overflow-y-auto">
                <button
                    className="absolute top-3 right-4 text-2xl text-gray-700 cursor-pointer hover:text-red-600 transition-colors"
                    onClick={closeModal}
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">Information Master Details</h2>

                <div className="space-y-2 mb-6">
                    <p className="text-lg"><strong>Sector:</strong> {item?.sector ?? 'No sector available'}</p>
                    <p className="text-lg"><strong>Incident Category:</strong> {item?.incidentcategory ?? 'N/A'}</p>
                    <p className="text-lg"><strong>Incident Name:</strong> {item?.incidentname ?? 'N/A'}</p>
                    <p className="text-lg"><strong>Information Type:</strong> {item?.informationmastertype ?? 'N/A'}</p>
                    <p className="text-lg"><strong>Information Description:</strong></p>
                    
                    {/* Render Content and style links */}
                    <div className="text-lg">
                        {item.informationdescription?.content ? (
                            <div 
                                dangerouslySetInnerHTML={{ 
                                    __html: styleLinksInContent(item.informationdescription.content) 
                                }} 
                            />
                        ) : (
                            <div>No description available</div>
                        )}
                    </div>
                </div>

                {/* Render Image */}
                {item.informationdescription?.image && (
                    <div>
                        <strong>Image:</strong>
                        <img 
                            src={API.GET_IMAGE_URL(item.informationdescription.image)}
                            alt="Uploaded content" 
                            style={{ maxWidth: '30%', maxHeight: '40%', objectFit: 'cover' }}
                            className="rounded-lg shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={handleImageClick}
                        />
                    </div>
                )}

                {/* Image Modal */}
                {isImageModalOpen && (
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 flex items-center justify-center z-60">
                        <div className="relative flex items-center justify-center">
                            <button
                                className="absolute top-2 right-2 text-3xl text-white cursor-pointer hover:text-red-600"
                                onClick={handleCloseModal}
                            >
                                ×
                            </button>
                            <img
                                src={API.GET_IMAGE_URL(item.informationdescription.image)}
                                alt="Full Screen"
                                style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                                className="rounded-lg shadow-md"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

FIView.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    closeModal: PropTypes.func.isRequired,
    item: PropTypes.shape({
        sector: PropTypes.string,
        incidentcategory: PropTypes.string,
        incidentname: PropTypes.string,
        informationmastertype: PropTypes.string,
        informationdescription: PropTypes.shape({
            content: PropTypes.string,
            image: PropTypes.string,
        }),
    }).isRequired,
};

export default FIView;
