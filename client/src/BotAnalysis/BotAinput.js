// import React, { useState } from 'react';
// import axios from 'axios';

// const BotAinput = () => {
//   const [url, setUrl] = useState('');
//   const [description, setDescription] = useState('');
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [metaDataResults, setMetaDataResults] = useState([]);
//   const [response, setResponse] = useState("");
//   const [seoResults, setSeoResults] = useState([]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('url', url);
//       formData.append('description', description);
//       const response = await axios.post('http://localhost:8000/analyze', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//       setMetaDataResults([response.data]);
//       setError(null);
//     } catch (error) {
//       setError('Failed to analyze page. Please try again.');
//       console.error('Error analyzing page:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGenerateText = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const response = await axios.post("http://127.0.0.1:8000/generate/", {
//         prompt: description,
//         max_tokens: 800,
//       });
//       setResponse(response.data.generated_text);
//       setError(null);
//     } catch (error) {
//       setError("An error occurred while generating text.");
//       console.error("Error:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSeoAnalysis = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const formData = new FormData();
//       formData.append('url', url);
//       formData.append('description', description);
//       const response = await axios.post('http://localhost:8000/analyze-with-api', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });
//       setSeoResults([response.data]);
//       setError(null);
//     } catch (error) {
//       setError('Failed to analyze page with SEO analyzer API. Please try again.');
//       console.error('Error analyzing page with SEO analyzer API:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-lg mx-auto mt-8">
//       <h1 className="mb-4 text-3xl font-bold">Page Analyzer</h1>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label htmlFor="url" className="block mb-1">URL:</label>
//           <input
//             type="text"
//             id="url"
//             value={url}
//             onChange={(e) => setUrl(e.target.value)}
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
//             placeholder="Enter URL"
//             required
//           />
//         </div>
//         <div>
//           <label htmlFor="description" className="block mb-1">Description:</label>
//           <input
//             type="text"
//             id="description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500"
//             placeholder="Enter Description"
//             required
//           />
//         </div>
//         <button type="submit" className="w-full px-4 py-2 text-white transition duration-300 bg-blue-500 rounded-md hover:bg-blue-600">Analyze</button>
//       </form>
//       <button onClick={handleSeoAnalysis} className="w-full px-4 py-2 mt-4 text-white transition duration-300 bg-green-500 rounded-md hover:bg-green-600" disabled={loading}>
//         SEO Analyzer
//       </button>
//       <button onClick={handleGenerateText} className="w-full px-4 py-2 mt-4 text-white transition duration-300 bg-green-500 rounded-md hover:bg-green-600" disabled={loading}>
//         Generate Text
//       </button>

//       {error && <p className="mt-4 text-red-500">{error}</p>}
//       {loading && <p>Loading...</p>}

//       {metaDataResults.map((data, index) => (
//         <div key={index} className="overflow-x-auto">
//           <h2 className="mt-4">Meta Data</h2>
//           <table className="w-full border border-collapse border-gray-400 table-auto">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="px-4 py-2 border border-gray-400">Attribute</th>
//                 <th className="px-4 py-2 border border-gray-400">Value</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(data.meta_data).map(([key, value]) => (
//                 <tr key={key} className="bg-white">
//                   <td className="px-4 py-2 border border-gray-400">{key}</td>
//                   <td className="px-4 py-2 border border-gray-400">{value}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <h2 className="mt-4">Recommendations</h2>
//           <table className="w-full border border-collapse border-gray-400 table-auto">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="px-4 py-2 border border-gray-400">Recommendation</th>
//                 <th className="px-4 py-2 border border-gray-400">Example Keywords</th>
//               </tr>
//             </thead>
//             <tbody>
//               {data.recommendations.map((recommendation, idx) => (
//                 <tr key={idx} className="bg-white">
//                   <td className="px-4 py-2 border border-gray-400">{recommendation.recommendation}</td>
//                   <td className="px-4 py-2 border border-gray-400">
//                     <ul>
//                       {recommendation.example_keywords.map((keyword, i) => (
//                         <li key={i}>{keyword}</li>
//                       ))}
//                     </ul>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <h2 className="mt-4">Cascading Prompt</h2>
//           <p>{data.cascading_prompt || "No cascading prompt found"}</p>
//         </div>
//       ))}

//       {seoResults.map((data, index) => (
//         <div key={index} className="overflow-x-auto">
//           <h2 className="mt-4">SEO Analysis Results</h2>
//           <h3>Meta Data</h3>
//           <table className="w-full border border-collapse border-gray-400 table-auto">
//             <thead>
//               <tr className="bg-gray-200">
//                 <th className="px-4 py-2 border border-gray-400">Attribute</th>
//                 <th className="px-4 py-2 border border-gray-400">Value</th>
//               </tr>
//             </thead>
//             <tbody>
//               {Object.entries(data.seo_meta_data).map(([key, value]) => (
//                 <tr key={key} className="bg-white">
//                   <td className="px-4 py-2 border border-gray-400">{key}</td>
//                   <td className="px-4 py-2 border border-gray-400">{value}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <h3 className="mt-4">Recommendations</h3>
//           <ul>
//             {data.seo_recommendations.map((recommendation, idx) => (
//               <li key={idx}>{recommendation.recommendation}</li>
//             ))}
//           </ul>
//         </div>
//       ))}
      
//       {response && (
//         <div>
//           <h2 className="mt-4">Generated Text</h2>
//           <p>{response}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BotAinput;
