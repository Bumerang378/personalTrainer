import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Lisätty Navigate
import Navbar from './components/Navbar';
import CustomerList from './components/CustomerList';
import TrainingList from './components/TrainingList';
import CalendarView from './components/CalendarView'; // Lisätty CalendarView import
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'; // OK
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'; // OK
import { Container } from '@mui/material'; // Lisätty Container yleiseen asetteluun

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fi">
      <Router basename="/personalTrainer">
        <Navbar />
        {/* Container keskittää sisällön ja antaa paddingia */}
        <Container maxWidth="xl"> {/* Voit säätää maxWidthia tarpeen mukaan */}
          <Routes>
            {/* Oletusreitti ohjaa asiakaslistaan */}
            <Route path="/" element={<Navigate replace to="/customers" />} />
            <Route path="/customers" element={<CustomerList />} />
            <Route path="/trainings" element={<TrainingList />} />
            <Route path="/calendar" element={<CalendarView />} />
            {/* Lisää reitti tilastosivulle (Osa 5) myöhemmin, esim. */}
            {/* <Route path="/stats" element={<StatsPage />} /> */}
          </Routes>
        </Container>
      </Router>
    </LocalizationProvider>
  );
}

export default App;

