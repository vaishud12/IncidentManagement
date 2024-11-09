import React from 'react'
import { BrowserRouter as  Router, Route, Routes } from 'react-router-dom'
import FAddEdit from './Incident/FAddEdit';
import FTable from './Incident/FTable';
import FView from './Incident/FView'

const Incident = () => {
  return (
    <Router>
      <Routes> 
      <Route exact path="/" element={<FTable />} />
      <Route path="/incident/incidentaddedit" element={<FAddEdit />} />
      <Route path="/incident/update/:incidentid" element={<FAddEdit />} />
      <Route path="/incident/view/:incidentid" element={<FView />} />
        
      </Routes>
    </Router>
  )
}

export default Incident
