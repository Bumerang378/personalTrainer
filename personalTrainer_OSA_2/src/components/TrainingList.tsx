import { useState, useEffect } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Typography, Box, IconButton, Alert, CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import dayjs from 'dayjs';
import AddTrainingDialog from './AddTrainingDialog';
import ConfirmationDialog from './ConfirmationDialog';
import { api, TrainingWithCustomer, Customer } from '../services/api';

const TrainingList = () => {
  const [trainings, setTrainings] = useState<TrainingWithCustomer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [trainingToDelete, setTrainingToDelete] = useState<TrainingWithCustomer | null>(null);

  const fetchTrainings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTrainings();
      setTrainings(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Tietojen haku epäonnistui.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCustomers();
      console.log('Raw customer data:', JSON.stringify(data, null, 2));
      setCustomers(data);
    } catch (err) {
      console.error("Fetch customers error:", err);
      setError("Asiakkaiden haku epäonnistui.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
    fetchCustomers();
  }, []);

  const handleAddTraining = async (training: { date: string; duration: number; activity: string; customerId: number }) => {
    setLoading(true);
    setError(null);
    try {
      const customer = customers.find(c => c._links?.self.href?.includes(`/customers/${training.customerId}`));
      if (!customer) {
        throw new Error('Asiakasta ei löytynyt');
      }
      await api.addTraining({
        date: training.date,
        duration: training.duration,
        activity: training.activity,
        customer: `https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers/${training.customerId}`,
      });
      await fetchTrainings();
    } catch (err) {
      console.error("Add training failed:", err);
      setError("Harjoituksen lisääminen epäonnistui.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (training: TrainingWithCustomer) => {
    setTrainingToDelete(training);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!trainingToDelete) return;
    
    setLoading(true);
    setError(null);
    try {
      await api.deleteTraining(trainingToDelete.id);
      await fetchTrainings();
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Poisto epäonnistui.");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setTrainingToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTrainingToDelete(null);
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Harjoitukset</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={loading}
        >
          Lisää harjoitus
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Aktiviteetti</TableCell>
                <TableCell>Kesto (min)</TableCell>
                <TableCell>Päivämäärä ja aika</TableCell>
                <TableCell>Asiakas</TableCell>
                <TableCell>Toiminnot</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trainings.map(t => (
                <TableRow key={t.id}>
                  <TableCell>{t.activity}</TableCell>
                  <TableCell>{t.duration}</TableCell>
                  <TableCell>{dayjs(t.date).format('DD.MM.YYYY HH:mm')}</TableCell>
                  <TableCell>{`${t.customer.firstname} ${t.customer.lastname}`}</TableCell>
                  <TableCell>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteClick(t)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <AddTrainingDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleAddTraining}
        customers={customers.map(c => ({
          id: parseInt(c._links?.self.href?.split('/').pop() || '0'),
          firstname: c.firstname,
          lastname: c.lastname,
        }))}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Vahvista poisto"
        message={`Haluatko varmasti poistaa asiakkaan ${trainingToDelete?.customer.firstname} ${trainingToDelete?.customer.lastname} harjoituksen "${trainingToDelete?.activity}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
};

export default TrainingList;