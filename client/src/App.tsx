import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PersonnelList from './pages/PersonnelList';
import PersonnelForm from './pages/PersonnelForm';
import ScreeningForm from './pages/ScreeningForm';
import EntryCheckForm from './pages/EntryCheckForm';
import EntryCheckList from './pages/EntryCheckList';
import IncidentForm from './pages/IncidentForm';
import IncidentList from './pages/IncidentList';
import MedicalPostList from './pages/MedicalPostList';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="personnel" element={<PersonnelList />} />
          <Route path="personnel/new" element={<PersonnelForm />} />
          <Route path="personnel/:id/screening" element={<ScreeningForm />} />
          <Route path="entry-check" element={<EntryCheckList />} />
          <Route path="entry-check/new" element={<EntryCheckForm />} />
          <Route path="incidents" element={<IncidentList />} />
          <Route path="incidents/new" element={<IncidentForm />} />
          <Route path="medical-posts" element={<MedicalPostList />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
