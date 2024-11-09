// // import React, { useState, useEffect } from 'react';
// // import {jwtDecode} from 'jwt-decode'; // Correct named import for jwt-decode
// // import BotAinput from './BotAinput';
// // import axios from 'axios';
// // import FTable from '../Incident/FTable'; // Import FTable component
// // import UserIncidents from '../Incident/UserIncidents'; // Import UserIncidents component
// // import ResolutionTable from '../Resolve/ResolutionTable';
// // import Admin from '../Incident/Admin'; // Import Admin component

// // const Main = () => {
// //     const [fTableVisible, setFTableVisible] = useState(false);
// //     const [botAInputVisible, setBotAInputVisible] = useState(false);
// //     const [rTableVisible, setRTableVisible] = useState(false);
// //     const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
// //     const [userId, setUserId] = useState('');
// //     const [isAdmin, setIsAdmin] = useState(false);
    

// //     useEffect(() => {
// //         // Decode the token to get the user ID
// //         const decodeToken = () => {
// //             try {
// //                 const token = localStorage.getItem('token');
// //                 if (token) {
// //                     const decoded = jwtDecode(token);
// //                     console.log(decoded); // Log the decoded token to inspect its structure
// //                     //setUserId(decoded.userId); // Set userId from decoded token
// //                     setUserId(parseInt(decoded.userId, 10)); // Parse as integer
// //                     localStorage.setItem("user_id",userId)

// //                     axios.get(`http://localhost:5000/api/users/${decoded.userId}`)
// //                         .then(response => {
// //                             setIsAdmin(response.data.isAdmin); // Set isAdmin based on user data
// //                         })
// //                         .catch(error => {
// //                             console.error('Error fetching user data:', error);
// //                         });
// //              }
// //             } catch (error) {
// //                 console.error('Error decoding token:', error);
// //             }
// //         };

// //         if (isLoggedIn) {
// //             decodeToken();
// //         }
// //     }, [isLoggedIn]);



// //     const handleTable = (component) => {
// //         if (component === 'fTable') {
// //             setFTableVisible(true);
// //             setBotAInputVisible(false);
// //             setRTableVisible(false);
// //         } else if (component === 'botAInput') {
// //             setBotAInputVisible(true);
// //             setFTableVisible(false);
// //             setRTableVisible(false);
// //         } else if (component === 'rtable') {
// //             setRTableVisible(true);
// //             setFTableVisible(false);
// //             setBotAInputVisible(false);
// //         }
// //     };

// //     return (
// //         <div>
// //             <button
// //                 className="w-full px-4 py-2 mt-4 text-white transition duration-300 bg-green-500 rounded-md hover:bg-green-600"
// //                 onClick={() => handleTable('botAInput')}
// //             >
// //                 Page Analyzer
// //             </button>
// //             <div className="flex justify-between space-x-4 mt-4">
// //                 <button
// //                     className="w-full px-4 py-2 text-white transition duration-300 bg-green-500 rounded-md hover:bg-green-600"
// //                     onClick={() => handleTable('fTable')}
// //                     disabled={!isLoggedIn} // Disable button if not logged in
// //                 >
// //                     Incident
// //                 </button>
// //                 <button
// //                     className="w-full px-4 py-2 text-white transition duration-300 bg-green-500 rounded-md hover:bg-green-600"
// //                     onClick={() => handleTable('rtable')}
// //                 >
// //                     Resolution
// //                 </button>
// //             </div>

// //             {botAInputVisible && <BotAinput userId={userId}/>}
// //             {fTableVisible && isAdmin ? <Admin /> : <FTable userId={userId} />}
// //             {/* {fTableVisible && <FTable userId={userId}/>} */}
// //             {rTableVisible && <ResolutionTable userId={userId}/>}

// //             {/* Render UserIncidents component if user is logged in */}
// //             {isLoggedIn && userId && (
// //                 <UserIncidents userId={userId} />
// //             )}
// //         </div>
// //     );
// // };

// // export default Main;

// import React, { useState, useEffect } from 'react';
// import {jwtDecode} from 'jwt-decode'; // Correct named import for jwt-decode
// import axios from 'axios';
// import BotAinput from './BotAinput';
// import FTable from '../Incident/FTable'; // Import FTable component
// import UserIncidents from '../Incident/UserIncidents'; // Import UserIncidents component
// import ResolutionTable from '../Resolve/ResolutionTable';


// const Main = () => {
//     const [fTableVisible, setFTableVisible] = useState(false);
//     const [botAInputVisible, setBotAInputVisible] = useState(false);
//     const [rTableVisible, setRTableVisible] = useState(false);
//     const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
//     const [userId, setUserId] = useState('');
//     const [isAdmin, setIsAdmin] = useState(false);

//     useEffect(() => {
//         const decodeToken = async () => {
//             try {
//                 const token = localStorage.getItem('token');
//                 if (token) {
//                     const decoded = jwtDecode(token);
//                     console.log(decoded); // Log the decoded token to inspect its structure
//                     const userId = parseInt(decoded.userId, 10); // Parse as integer
//                     setUserId(userId);
//                     localStorage.setItem('user_id', userId);

//                     // Fetch user data to check if the user is an admin
//                     try {
//                         const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
//                         setIsAdmin(response.data.isAdmin); // Set isAdmin based on user data
//                     } catch (error) {
//                         console.error('Error fetching user data:', error);
//                     }
//                 }
//             } catch (error) {
//                 console.error('Error decoding token:', error);
//             }
//         };

//         if (isLoggedIn) {
//             decodeToken();
//         }
//     }, [isLoggedIn]);

//     const handleTable = (component) => {
//         if (component === 'fTable') {
//             setFTableVisible(true);
//             setBotAInputVisible(false);
//             setRTableVisible(false);
//         } else if (component === 'botAInput') {
//             setBotAInputVisible(true);
//             setFTableVisible(false);
//             setRTableVisible(false);
//         } else if (component === 'rtable') {
//             setRTableVisible(true);
//             setFTableVisible(false);
//             setBotAInputVisible(false);
//         }
//     };

//     return (
//         <div>
//             <button
//                 className="w-full px-4 py-2 mt-4 text-white transition duration-300 bg-green-500 rounded-md hover:bg-green-600"
//                 onClick={() => handleTable('botAInput')}
//             >
//                 Page Analyzer
//             </button>
//             <div className="flex justify-between space-x-4 mt-4">
//                 <button
//                     className="w-full px-4 py-2 text-white transition duration-300 bg-green-500 rounded-md hover:bg-green-600"
//                     onClick={() => handleTable('fTable')}
//                     disabled={!isLoggedIn} // Disable button if not logged in
//                 >
//                     Incident
//                 </button>
//                 <button
//                     className="w-full px-4 py-2 text-white transition duration-300 bg-green-500 rounded-md hover:bg-green-600"
//                     onClick={() => handleTable('rtable')}
//                 >
//                     Resolution
//                 </button>
//             </div>

//             {botAInputVisible && <BotAinput userId={userId}/>}
//             {fTableVisible &&   <FTable userId={userId} />}
//             {rTableVisible && <ResolutionTableu userId={userId}/>}

//             {isLoggedIn && userId && (
//                 <UserIncidents userId={userId} />
//             )}
//         </div>
//     );
// };

// export default Main;
import React, { useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode'; // Correct named import for jwt-decode
import axios from 'axios';

import FTable from '../Incident/FTable'; // Import FTable component
// import UserIncidents from '../Incident/UserIncidents'; // Import UserIncidents component
import ResolutionTableu from '../Resolve/ResolutionTableu';

const Main = () => {
    const [fTableVisible, setFTableVisible] = useState(false);
    
    const [rTableVisible, setRTableVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
    const [userId, setUserId] = useState('');
   
    useEffect(() => {
        const decodeToken = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const decoded = jwtDecode(token);
                    const userId = parseInt(decoded.userId, 10);
                    const email = decoded.email;
                    setUserId(userId);
                    localStorage.setItem('user_id', userId);
                    localStorage.setItem('email', email);

                    console.log('Decoded token:', decoded); // Debug decoded token
                    console.log('User ID:', userId); // Debug user ID
                    console.log('Email:', email);
                    // Fetch user data to check if the user is an admin
                    // try {
                    //     const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
                    //     console.log('User data:', response.data); // Debug user data
                       
                    // } catch (error) {
                    //     console.error('Error fetching user data:', error);
                    // }
                }
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        };

        if (isLoggedIn) {
            decodeToken();
        }
    }, [isLoggedIn]);

    const handleTable = (component) => {
        if (component === 'fTable') {
            setFTableVisible(true);
            
            setRTableVisible(false);
        // } else if (component === 'botAInput') {
        //     setBotAInputVisible(true);
        //     setFTableVisible(false);
        //     setRTableVisible(false);
        } else if (component === 'rtable') {
            setRTableVisible(true);
            setFTableVisible(false);
           
        }
    };

    return (
        <div>
            {/* <button
                className="w-full px-4 py-2 mt-4 text-white transition duration-300 bg-green-500 rounded-md hover:bg-green-600"
                onClick={() => handleTable('botAInput')}
            >
                Page Analyzer
            </button> */}
            <div className="flex justify-between space-x-3 mt-2">
                <button
                    className="w-full px-4 py-2 text-white transition duration-300 bg-green-500 rounded-md hover:bg-green-600"
                    onClick={() => handleTable('fTable')}
                     // Disable button if not logged in
                >
                    Incident
                </button>
                <button
                    className="w-full px-4 py-2 text-white transition duration-300 bg-green-500 rounded-md hover:bg-green-600"
                    onClick={() => handleTable('rtable')}
                >
                    Resolution
                </button>
            </div>

            
            {fTableVisible && <FTable userId={userId} />}
            {rTableVisible && <ResolutionTableu userId={userId}/>}

            {/* {isLoggedIn && userId && (
                <UserIncidents userId={userId} />
            )} */}
        </div>
    );
};
export default Main;