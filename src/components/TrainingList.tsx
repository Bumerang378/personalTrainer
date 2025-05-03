import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Typography, Box, IconButton, TextField, Alert // Lisätty TextField, Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Lisätty sorttausikonit
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import dayjs, { Dayjs } from 'dayjs';
// Tuodaan korjattu dialogi
import AddTrainingDialog from './AddTrainingDialog';

type Training = {
  id: number;
  activity: string;
  duration: number;
  date: string; // ISO string
  customerId: number;
  customer?: { // Asiakastiedot mukana helpottamaan näyttöä/sorttausta
      id?: number; // Varmistetaan että id on myös tässä
      firstname: string;
      lastname: string;
  }
};

type Customer = {
  id: number;
  firstname: string;
  lastname: string;
  _links?: {
    self?: { href: string };
    [key: string]: any;
  };
};

// SortIndicator (sama kuin CustomerListissä)
const SortIndicator = ({ direction }: { direction: 'ascending' | 'descending' | null }) => {
    if (!direction) return null;
    return direction === 'ascending' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
};


const TrainingList = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  // Lisätty tilat sorttaukselle ja suodatukselle
  const [search, setSearch] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });


  // --- API Functions ---
  const fetchCustomers = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      // Extract customer IDs from the _links URLs
      const customersWithIds = (data._embedded?.customers || []).map((customer: Customer) => ({
        ...customer,
        id: parseInt(customer._links?.self?.href.split('/').pop() || '0')
      }));
      setCustomers(customersWithIds);
    } catch (err: any) {
      setError("Asiakkaiden haku epäonnistui.");
    }
  }, []);

  const fetchTrainings = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setTrainings(data._embedded?.trainings || []);
    } catch (err: any) {
      setError("Harjoitusten haku epäonnistui.");
    }
  }, []);

  const addTraining = async (trainingData: {activity: string, duration: number, date: string, customerId: number}) => {
    setError(null);
    try {
      // Find the customer self link
      const customer = customers.find(c => c.id === trainingData.customerId);
      const customerLink = customer?._links?.self?.href;
      if (!customerLink) throw new Error('Customer link not found');
      const response = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: trainingData.activity,
          duration: trainingData.duration,
          date: trainingData.date,
          customer: customerLink
        })
      });
      if (!response.ok) throw new Error('Failed to add training');
      await fetchTrainings();
    } catch (err) {
      setError("Harjoituksen lisäys epäonnistui.");
    }
  };

  const deleteTraining = async (id: number) => {
    setError(null);
    try {
      const response = await fetch(`https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok && response.status !== 204) throw new Error('Failed to delete training');
      await fetchTrainings();
    } catch (err) {
      setError("Harjoituksen poisto epäonnistui.");
    }
  };
  // --- API Functions End ---

  // Käsittelijät
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  // Muokattu handleAddTraining käyttämään mock-funktiota ja sulkemaan dialogin vasta onnistuessa
  const handleAddTraining = async (trainingData: {activity: string, duration: number, date: string, customerId: number}) => {
      try {
          setError(null);
          await addTraining(trainingData);
          handleCloseDialog();
      } catch(err) {
          setError("Harjoituksen tallennus epäonnistui.");
          throw err;
      }
  };

  const handleDelete = async (id: number, description: string) => {
    if (window.confirm(`Haluatko varmasti poistaa harjoituksen: ${description}?`)) {
      try {
        setError(null);
        await deleteTraining(id);
      } catch(err) {
        setError("Harjoituksen poisto epäonnistui.");
      }
    }
  };

  // Asiakkaan nimen haku (käyttää nyt training.customer, jos saatavilla)
   const getCustomerName = useCallback((training: Training): string => {
        if (training.customer) {
            return `${training.customer.firstname} ${training.customer.lastname}`;
        }
        // Fallback jos customer-objektia ei ole (haetaan customers-listasta)
        const customer = customers.find(c => c.id === training.customerId);
        return customer ? `${customer.firstname} ${customer.lastname}` : 'Tuntematon';
   }, [customers]);

   // Lisätty sorttaus ja suodatus
   const processedTrainings = useMemo(() => {
       let items = [...trainings];

       // Suodatus
       if (search) {
            const term = search.toLowerCase();
            items = items.filter(t =>
                getCustomerName(t).toLowerCase().includes(term) ||
                t.activity.toLowerCase().includes(term) ||
                dayjs(t.date).format('DD.MM.YYYY').includes(term) || // Hae päivämäärällä
                String(t.duration).includes(term) // Hae kestolla
            );
       }

       // Lajittelu
       if (sortConfig.key !== null) {
            items.sort((a, b) => {
                const key = sortConfig.key;
                let aValue: any;
                let bValue: any;

                // Määritä verrattavat arvot avaimen perusteella
                if (key === 'customer') {
                    aValue = getCustomerName(a);
                    bValue = getCustomerName(b);
                } else if (key === 'date') {
                    aValue = dayjs(a.date); // Verrataan Dayjs-objekteina
                    bValue = dayjs(b.date);
                } else {
                     aValue = a[key as keyof Training] ?? '';
                     bValue = b[key as keyof Training] ?? '';
                }

                // Tee vertailu
                if (key === 'date') { // Päivämäärävertailu
                     if ((aValue as Dayjs).isBefore(bValue as Dayjs)) return sortConfig.direction === 'ascending' ? -1 : 1;
                     if ((aValue as Dayjs).isAfter(bValue as Dayjs)) return sortConfig.direction === 'ascending' ? 1 : -1;
                     return 0;
                } else { // Muu vertailu (string/number)
                    if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                    if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                    return 0;
                }
            });
       }
       return items;
   }, [trainings, search, sortConfig, customers, getCustomerName]); // Lisätty riippuvuudet

    // Lisätty requestSort
    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };


  // Määritellään sarakkeet sorttausta varten
    const columns: { key: string; label: string; sortable: boolean }[] = [
        { key: 'activity', label: 'Aktiviteetti', sortable: true },
        { key: 'duration', label: 'Kesto (min)', sortable: true },
        { key: 'date', label: 'Päivämäärä', sortable: true },
        { key: 'customer', label: 'Asiakas', sortable: true }, // Avain 'customer' sorttausta varten
        { key: 'actions', label: 'Toiminnot', sortable: false }
    ];

  useEffect(() => {
    fetchCustomers();
    fetchTrainings();
  }, [fetchCustomers, fetchTrainings]);

  return (
    <Box sx={{ height: '100%', width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>Harjoitukset</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <TextField
            label="Hae aktiviteetti, asiakas, pvm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 'auto' }, flexGrow: 1, mr: { sm: 2 } }}
        />
         <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            sx={{ flexShrink: 0 }}
         >
            Lisää harjoitus
         </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <Table stickyHeader sx={{ minHeight: 0 }}>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                 <TableCell
                    key={col.key}
                    onClick={() => col.sortable ? requestSort(col.key) : null}
                    sx={{ cursor: col.sortable ? 'pointer' : 'default', fontWeight: 'bold' }}
                 >
                    {col.label}
                    {col.sortable && <SortIndicator direction={sortConfig.key === col.key ? sortConfig.direction : null} />}
                 </TableCell>
               ))}
            </TableRow>
          </TableHead>
          <TableBody>
             {processedTrainings.map(t => (
              <TableRow key={t.id} hover>
                {columns.map(col => (
                    <TableCell key={`${t.id}-${col.key}`}>
                       {col.key === 'actions' ? (
                            <IconButton aria-label="poista harjoitus" color="error" size="small" onClick={() => handleDelete(t.id, `${t.activity} (${dayjs(t.date).format('DD.MM.YYYY')})`)} >
                                <DeleteIcon />
                            </IconButton>
                       ) : col.key === 'customer' ? (
                            getCustomerName(t)
                       ) : col.key === 'date' ? (
                            dayjs(t.date).format('DD.MM.YYYY HH:mm')
                       ) : (
                           typeof t[col.key as keyof Training] === 'object' ? '-' : String(t[col.key as keyof Training] ?? '-')
                       )}
                    </TableCell>
                 ))}
              </TableRow>
            ))}
            {processedTrainings.length === 0 && !error && (
                <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                        Ei hakutuloksia tai harjoituksia ei ole lisätty.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddTrainingDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleAddTraining}
        customers={customers}
      />
    </Box>
  );
};
export default TrainingList;