// CustomerList.tsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Typography, Alert, Button, Box, IconButton, CircularProgress 
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';         
import DeleteIcon from '@mui/icons-material/Delete';     
import AddIcon from '@mui/icons-material/Add';          
import AddCustomerDialog from './AddCustomerDialog';
import EditCustomerDialog from './EditCustomerDialog';
import ConfirmationDialog from './ConfirmationDialog';
import { api, Customer } from '../services/api';

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

// SortIndicator pysyy samana
const SortIndicator = ({ direction }: { direction: 'ascending' | 'descending' | null }) => {
    if (!direction) return null;
    return direction === 'ascending' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
};


const CustomerList = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer | null; direction: 'ascending' | 'descending' }>({
    key: null,
    direction: 'ascending',
  });
  // Tilat dialogille ja muokattavalle asiakkaalle
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError("Tietojen haku epäonnistui.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // processedCustomers ja requestSort pysyvät ennallaan
  const processedCustomers = useMemo(() => {
    // ...sama suodatus- ja sorttauslogiikka...
    let filtered = [...customers];
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.firstname.toLowerCase().includes(term) ||
        c.lastname.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        (c.streetaddress && c.streetaddress.toLowerCase().includes(term)) ||
        (c.postcode && c.postcode.toLowerCase().includes(term)) ||
        (c.city && c.city.toLowerCase().includes(term)) ||
        (c.phone && c.phone.toLowerCase().includes(term))
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

  const requestSort = (key: keyof Customer) => {
    // ...sama sorttauslogiikka...
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  // --- Käsittelijät Dialogille ja CRUD-operaatioille ---
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenEditDialog = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setEditingCustomer(null);
  };

  // Tämä funktio välitetään AddCustomerDialogille 'onSave' propsina
  // Huom: AddCustomerDialogin onSave-propin tyyppiä pitää ehkä muokata
  //       vastaanottamaan myös Customer-objekti (jossa on id)
  const handleSave = async (customerData: Omit<Customer, '_links'>) => {
    setLoading(true);
    setError(null);
    try {
      await api.addCustomer(customerData);
      await fetchCustomers();
      handleCloseDialog(); // Sulje onnistuessa
    } catch (err) {
      console.error("Save failed:", err);
      setError("Tallennus epäonnistui.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async (customer: Customer) => {
    setLoading(true);
    setError(null);
    try {
      if (customer._links?.self.href) {
        const id = parseInt(customer._links.self.href.split('/').pop() || '0');
        await api.updateCustomer(id, customer);
        await fetchCustomers();
        handleCloseEditDialog();
      }
    } catch (err) {
      console.error("Update failed:", err);
      setError("Päivitys epäonnistui.");
    } finally {
      setLoading(false);
    }
  };

  // Tämä funktio kutsutaan poistopainikkeesta
  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    
    setLoading(true);
    setError(null);
    try {
      if (customerToDelete._links?.self.href) {
        const id = parseInt(customerToDelete._links.self.href.split('/').pop() || '0');
        await api.deleteCustomer(id);
        await fetchCustomers();
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setError("Poisto epäonnistui.");
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  // Määritellään sarakkeet taulukkoon, lisätään 'actions'
   const columns: { key: keyof Customer | 'actions'; label: string; sortable?: boolean }[] = [
        { key: 'firstname', label: 'Etunimi', sortable: true },
        { key: 'lastname', label: 'Sukunimi', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        // Lisätään loput kentät AddCustomerDialogin mukaan
        { key: 'streetaddress', label: 'Osoite', sortable: true },
        { key: 'postcode', label: 'Postinumero', sortable: true },
        { key: 'city', label: 'Kaupunki', sortable: true },
        { key: 'phone', label: 'Puhelin', sortable: true },
        { key: 'actions', label: 'Toiminnot', sortable: false } // Toiminnot-sarake
    ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>Asiakkaat</Typography>

      {/* Hakukenttä ja Lisää-painike */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
         <TextField
            label="Hae asiakasta..." // Päivitetty placeholder
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 'auto' }, flexGrow: 1, mr: { sm: 2 } }}
        />
        {/* Muutettu Lisää-painikkeen onClick kutsumaan handleOpenDialog */}
        <Button
            variant="contained"
            startIcon={<AddIcon />} // Lisätty ikoni
            onClick={handleOpenDialog} // Avaa dialogin ilman dataa = lisäys
            disabled={loading}
        >
            Lisää asiakas
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {/* Käytetään columns-määrittelyä */}
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
                <TableRow key={c._links?.self.href} hover>
                  {/* Käytetään columns-määrittelyä myös solujen renderöintiin */}
                  {columns.map(col => (
                     <TableCell key={`${c._links?.self.href}-${col.key}`}>
                        {col.key === 'actions' ? (
                            // Toiminnot-sarakkeen painikkeet
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                    aria-label="muokkaa"
                                    size="small"
                                    color="primary"
                                    onClick={() => handleOpenEditDialog(c)}
                                    disabled={loading}
                                >
                                    <EditIcon fontSize="inherit"/>
                                </IconButton>
                                <IconButton
                                    aria-label="poista"
                                    size="small"
                                    color="error"
                                    onClick={() => handleDeleteClick(c)}
                                    disabled={loading}
                                >
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
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/*
        Renderöidään AddCustomerDialog ja välitetään sille tarvittavat propsit.
        TÄRKEÄÄ: AddCustomerDialog TÄYTYY muokata ottamaan vastaan ja käyttämään
                 'initialData' propsi muokkausta varten!
      */}
      <AddCustomerDialog
         open={dialogOpen}
         onClose={handleCloseDialog}
         onSave={handleSave}
      />

      <EditCustomerDialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleSaveEdit}
        customer={editingCustomer}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Vahvista poisto"
        message={`Haluatko varmasti poistaa asiakkaan ${customerToDelete?.firstname} ${customerToDelete?.lastname}?\nTämä toiminto poistaa myös kaikki asiakkaan harjoitukset.`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

    </div>
  );
};

export default CustomerList;