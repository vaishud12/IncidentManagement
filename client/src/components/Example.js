// import React, { useCallback, useState } from 'react';
// import './Example.css'; // Add any additional styles for your Example component

// const Example = () => {
//   const [tags, setTags] = useState([]);
//   const [query, setQuery] = useState('');

//   // Constant variable for tag names
//   const tagNames = tags.map(tag => tag.name);

//   // Handle tag addition
//   const onAddition = useCallback(
//     (newTag) => {
//       if (newTag && !tags.find((tag) => tag.name === newTag.name)) {
//         setTags((prevTags) => [...prevTags, newTag]);
//       }
//     },
//     [tags]
//   );

//   // Handle tag deletion
//   const onDelete = useCallback((tagIndex) => {
//     setTags((prevTags) => prevTags.filter((_, i) => i !== tagIndex));
//   }, []);

//   // Handle input changes
//   const onInput = useCallback((query) => {
//     setQuery(query);
//   }, []);

//   // Handle input key press to add tag
//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && query.trim()) {
//       e.preventDefault(); // Prevent default form submission or other behavior
//       onAddition({ id: tags.length + 1, name: query.trim() });
//       setQuery(''); // Clear input after adding
//     }
//   };

//   // Handle input blur event to create tag if input is not empty
//   const handleBlur = () => {
//     if (query.trim()) {
//       onAddition({ id: tags.length + 1, name: query.trim() });
//       setQuery(''); // Clear input after adding
//     }
//   };

//   // Handle form submission
//   const handleSubmit = () => {
//     // Convert tagNames to a plain array format
//     const plainArray = tagNames;
  
//     // Posting data as plain array
//     fetch('/api/tags', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(plainArray), // Send the plain array directly
//     })
//       .then(response => response.json())
//       .then(data => {
//         console.log('Success:', data);
//       })
//       .catch(error => {
//         console.error('Error:', error);
//       });
//   };
  

//   return (
//     <div>
//       <p>Select or add tags below:</p>
//       <div className="tag-input-container">
//         {tags.map((tag, index) => (
//           <span key={index} className="tag">
//             {tag.name}
//             <button
//               type="button"
//               onClick={() => onDelete(index)}
//               className="tag-remove-button"
//             >
//               ×
//             </button>
//           </span>
//         ))}
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => onInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           onBlur={handleBlur}
//           placeholder="Add new tag"
//           className="tag-input"
//         />
//       </div>
//       <p><b>Tag Names:</b></p>
//       <pre><code>{JSON.stringify(tagNames, null, 2)}</code></pre>
//       <button onClick={handleSubmit}>Submit</button>
//     </div>
//   );
// };

// export default Example;
//  // const handleSubmit = async (e) => {
//     //     e.preventDefault();
//     //     if (!incidentcategory || !incidentname || !incidentowner || !incidentdescription || !date || !currentaddress || !gps || !raisedtouser) {
//     //         toast.error("Please provide a value for each input field");
//     //     } else {
//     //         try {
//     //             // Fetch the user ID based on the raisedtouser email
//     //             const response = await axios.get(`http://localhost:5000/api/getUserByEmail/${raisedtouser}`);
//     //             const raisedToUserId = response.data.userid; // Assign response to the correct variable name
//     //             const tagss = tagNames;
  
//     //             // Combine the fetched raisedtouserid with the other form data and assign it to userid
//     //             const updatedData = { ...state, userid: raisedToUserId, raisedtouserid: raisedToUserId, id: userId, tagss};
    
//     //             if (!incidentid) {
//     //                 await axios.post("http://localhost:5000/api/incidentpost", updatedData);
//     //             } else {
//     //                 await axios.put(`http://localhost:5000/api/incidentupdate/${incidentid}`, updatedData);
//     //             }
//     //             setState(initialState);
//     //             toast.success(`${incidentid ? 'Incident updated' : 'Incident added'} successfully`);
    
//     //             // Sending email and opening WhatsApp link
//     //             const emailPayload = {
//     //                 email1: raisedtouser,
//     //                 from: incidentowner,
//     //                 incidentcategory,
//     //                 incidentname,
//     //                 incidentowner,
//     //                 incidentdescription,
//     //                 date,
//     //                 currentaddress,
//     //                 gps,
//     //                 raisedtouser,
//     //                 status,
//     //                 tagss,
//     //                 timeFrame: selectedTime
//     //             };
//     //             await axios.post("http://localhost:5000/api/send-emailfour/ids", emailPayload);
//     //             toast.success('Email sent successfully');
//     //             setEmailSent(true);
    
//     //             const message = ` This Incident ${incidentname} Should be Resolved within ${selectedTime} !!!
//     //             Incident Category: ${incidentcategory}\nIncident Name: ${incidentname}\nIncident Owner: ${incidentowner}\nIncident Description: ${incidentdescription}\nDate: ${date}\nCurrent Address: ${currentaddress}\nGPS: ${gps}\nRaised to User: ${raisedtouser}\nStatus: ${status}`;
//     //             const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
//     //             window.open(whatsappUrl, '_blank');
    
//     //             loadData(); // Reload the data after adding or updating an incident
//     //         } catch (error) {
//     //             toast.error(error.response.data.error);
//     //         }
//     //     }
//     // };