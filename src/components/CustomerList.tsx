import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Typography, Alert, Button, Box, IconButton
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { CSVLink } from 'react-csv';

// Tuodaan dialogikomponentti
import AddCustomerDialog from './AddCustomerDialog';

type Customer = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  streetaddress?: string;
  postcode?: string;
  city?: string;
  phone?: string;
};

const SortIndicator = ({ direction }: { direction: 'ascending' | 'descending' | null }) => {
    if (!direction) return null;
    return direction === 'ascending' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
};

const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer | null; direction: 'ascending' | 'descending' }>({
    key: null,
    direction: 'ascending'
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // --- API Functions ---
  const fetchCustomers = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setCustomers(data._embedded?.customers || []);
    } catch (err: any) {
      setError("Tietojen haku epäonnistui.");
    }
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id'>) => {
    setError(null);
    try {
      const response = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      if (!response.ok) throw new Error('Failed to add customer');
      await fetchCustomers();
    } catch (err) {
      setError("Asiakkaan lisäys epäonnistui.");
    }
  };

  const updateCustomer = async (customerData: Customer) => {
    setError(null);
    try {
      const response = await fetch(`https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers/${customerData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      if (!response.ok) throw new Error('Failed to update customer');
      await fetchCustomers();
    } catch (err) {
      setError("Asiakkaan päivitys epäonnistui.");
    }
  };

  const deleteCustomer = async (id: number) => {
    setError(null);
    try {
      const response = await fetch(`https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok && response.status !== 204) throw new Error('Failed to delete customer');
      await fetchCustomers();
    } catch (err) {
      setError("Asiakkaan poisto epäonnistui.");
    }
  };

  // Prosessoitu data (suodatus ja sorttaus)
  const processedCustomers = useMemo(() => {
    let filtered = [...customers];
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(c =>
        Object.values(c).some(val =>
            String(val).toLowerCase().includes(term)
        ) // Yleistetty haku kaikista kentistä
      );
    }
    if (sortConfig.key !== null) {
       filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!] ?? '';
        const bValue = b[sortConfig.key!] ?? '';
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [customers, search, sortConfig]);

  // Sorttauspyyntö
  const requestSort = (key: keyof Customer) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // --- Käsittelijät ---
  const handleOpenDialog = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
  };
  const handleSave = async (customerData: Omit<Customer, 'id'> | Customer) => {
    try {
      setError(null);
      if ('id' in customerData && customerData.id) {
        await updateCustomer(customerData as Customer);
      } else {
        await addCustomer(customerData);
      }
      handleCloseDialog();
    } catch (err) {
      setError("Tallennus epäonnistui.");
    }
  };
  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Haluatko varmasti poistaa asiakkaan ${name}?`)) {
      try {
        setError(null);
        await deleteCustomer(id);
      } catch (err) {
        setError("Poisto epäonnistui.");
      }
    }
  };

  // Sarakemäärittelyt taulukolle JA CSV-viennille
   const columns: { key: keyof Customer | 'actions'; label: string; sortable?: boolean }[] = [
        { key: 'firstname', label: 'Etunimi', sortable: true },
        { key: 'lastname', label: 'Sukunimi', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'streetaddress', label: 'Osoite', sortable: true },
        { key: 'postcode', label: 'Postinumero', sortable: true },
        { key: 'city', label: 'Kaupunki', sortable: true },
        { key: 'phone', label: 'Puhelin', sortable: true },
        { key: 'actions', label: 'Toiminnot', sortable: false }
    ];

   // --- CSV Export Määrittelyt ---
    const csvHeaders = useMemo(() => columns
        .filter(col => col.key !== 'actions' && col.key !== 'id') // Suodata actions ja id pois
        .map(col => ({ label: col.label, key: col.key as string })),
    [columns]
    );

    const csvData = useMemo(() => {
        return processedCustomers.map(c => {
             // Luodaan objekti vain vientiin halutuilla kentillä
             const exportCustomer: Partial<Record<keyof Customer, any>> = {};
             csvHeaders.forEach(header => {
                 exportCustomer[header.key as keyof Customer] = c[header.key as keyof Customer] ?? '';
             });
             return exportCustomer;
        });
    }, [processedCustomers, csvHeaders]);

    const csvFilename = "asiakkaat_export.csv";
  // --- CSV Export loppu ---

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <Box> {/* Kääritään koko komponentti Boxiin paddingia varten */}
      <Typography variant="h4" gutterBottom>Asiakkaat</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
         <TextField
            label="Hae kaikista kentistä..." // Yleistetty haku
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 'auto' }, flexGrow: 1, mr: { sm: 2 } }}
        />
         <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}> {/* Painikkeet vierekkäin */}
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} >
                Lisää asiakas
            </Button>
             <CSVLink data={csvData} headers={csvHeaders} filename={csvFilename} style={{ textDecoration: 'none' }} target="_blank" >
                <Button variant="outlined"> Vie CSV </Button>
             </CSVLink>
         </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table stickyHeader> {/* Sticky header voi olla hyödyllinen pitkissä listoissa */}
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  onClick={() => col.sortable ? requestSort(col.key as keyof Customer) : null}
                  sx={{ cursor: col.sortable ? 'pointer' : 'default', fontWeight: 'bold' }}
                >
                  {col.label}
                  {col.sortable && <SortIndicator direction={sortConfig.key === col.key ? sortConfig.direction : null} />}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {processedCustomers.map(c => (
              <TableRow key={c.id} hover>
                {columns.map(col => (
                  <TableCell key={`${c.id}-${col.key}`}>
                    {col.key === 'actions' ? (
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton aria-label="muokkaa" size="small" color="primary" onClick={() => handleOpenDialog(c)} >
                          <EditIcon fontSize="inherit"/>
                        </IconButton>
                        <IconButton aria-label="poista" size="small" color="error" onClick={() => handleDelete(c.id, `${c.firstname} ${c.lastname}`)} >
                          <DeleteIcon fontSize="inherit"/>
                        </IconButton>
                      </Box>
                    ) : (
                      c[col.key as keyof Customer] ?? '-'
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {/* Näytä viesti jos dataa ei ole (suodatuksen jälkeen) */}
            {processedCustomers.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  Ei hakutuloksia tai asiakkaita ei ole lisätty.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogi */}
      <AddCustomerDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        initialData={editingCustomer}
      />
    </Box>
  );
};

export default CustomerList;