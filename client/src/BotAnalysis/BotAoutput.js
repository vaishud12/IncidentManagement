// import React, { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';

// const BotAoutput = () => {
//   const location = useLocation();
//   const [results, setResults] = useState(null);

//   useEffect(() => {
//     if (location.state && location.state.results) {
//       setResults(location.state.results);
//     }
//   }, [location]);

//   return (
//     <div>
//       <h1>Analysis Results</h1>
//       {results && (
//         <div>
//           <h2>Meta Data</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>Attribute</th>
//                 <th>Value</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(results.meta_data).map(([key, value]) => (
//                 <tr key={key}>
//                   <td>{key}</td>
//                   <td>{value}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <h2>Recommendations</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>Recommendation</th>
//                 <th>Example Keywords</th>
//               </tr>
//             </thead>
//             <tbody>
//               {results.recommendations.map((recommendation, index) => (
//                 <tr key={index}>
//                   <td>{recommendation.recommendation}</td>
//                   <td>
//                     <ul>
//                       {recommendation.example_keywords.map((keyword, index) => (
//                         <li key={index}>{keyword}</li>
//                       ))}
//                     </ul>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BotAoutput;
