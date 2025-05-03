import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CustomerList from './components/CustomerList';
import TrainingList from './components/TrainingList';
import CalendarView from './components/CalendarView';
import StatsPage from './components/StatsPage';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Box } from '@mui/material';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fi">
      <Router basename="/personalTrainer">
        <Box sx={{
          width: '96%',
          mx: 'auto',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#f5f7fa',
          p: '0 2%',
          color: '#222'
        }}>
          <Navbar />
          <Box sx={{ height: 'calc(100vh - 64px)', width: '100%', p: 0, m: 0, minHeight: 0 }}>
            <Routes>
              <Route path="/" element={<Navigate replace to="/customers" />} />
              <Route path="/customers" element={<CustomerList />} />
              <Route path="/trainings" element={<TrainingList />} />
              <Route path="/calendar" element={<CalendarView />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </LocalizationProvider>
  );
}

export default App;

