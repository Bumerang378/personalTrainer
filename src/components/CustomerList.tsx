import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Typography, Alert, Button, Box, IconButton, CircularProgress
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { CSVLink } from 'react-csv';

import AddCustomerDialog from './AddCustomerDialog';
import ConfirmationDialog from './ConfirmationDialog'; // Assuming this file is in the same directory

type Customer = {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  streetaddress?: string;
  postcode?: string;
  city?: string;
  phone?: string;
  _links?: { // Added _links based on typical Spring HATEOAS structure
    self: {
        href: string;
    };
    customer?: { // Optional, depending on API structure
        href: string;
    };
    trainings?: { // Optional, depending on API structure
        href: string;
    };
  };
};

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
    direction: 'ascending'
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // State for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const API_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers';

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      setCustomers(data._embedded?.customers || []);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError("Tietojen haku epäonnistui.");
    } finally {
        setLoading(false);
    }
  }, []);

  const addCustomer = async (customerData: Omit<Customer, 'id' | '_links'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerData)
      });
      if (!response.ok) {
          const errorText = await response.text();
          console.error("Add failed:", response.status, errorText);
          throw new Error(`Failed to add customer: ${response.status}`);
      }
      await fetchCustomers();
    } catch (err: any) {
      console.error("Add error:", err);
      setError("Asiakkaan lisäys epäonnistui.");
      throw err;
    } finally {
        setLoading(false);
    }
  };

  const updateCustomer = async (customerData: Customer) => {
    setLoading(true);
    setError(null);
    try {
      const customerToUpdate = customers.find(c => c.id === customerData.id);
      const customerLink = customerToUpdate?._links?.self?.href;

      if (!customerLink) {
           console.error("Update failed: Customer link not found for ID", customerData.id);
           throw new Error("Failed to update customer: Customer not found or link missing");
      }

      // API likely requires data without _links for PUT
      const { _links, ...dataWithoutLinks } = customerData;

      const response = await fetch(customerLink, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataWithoutLinks)
      });
      if (!response.ok) {
          const errorText = await response.text();
          console.error("Update failed:", response.status, errorText);
          throw new Error(`Failed to update customer: ${response.status}`);
      }
      await fetchCustomers();
    } catch (err: any) {
       console.error("Update error:", err);
       setError("Asiakkaan päivitys epäonnistui.");
       throw err;
    } finally {
        setLoading(false);
    }
  };

  // API call for deletion (called after confirmation)
  const deleteCustomer = async (customerLink: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(customerLink, {
        method: 'DELETE'
      });
      if (!response.ok && response.status !== 204) {
           const errorText = await response.text();
           console.error("Delete failed:", response.status, errorText);
           throw new Error(`Failed to delete customer: ${response.status}`);
      }
      await fetchCustomers(); // Refresh list on success
    } catch (err: any) {
      console.error("Delete error:", err);
      setError("Asiakkaan poisto epäonnistui.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processedCustomers = useMemo(() => {
    let filtered = [...customers];
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(c =>
        Object.values(c).some(val =>
            val != null && String(val).toLowerCase().includes(term)
        )
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
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // --- Handlers for Dialog and CRUD operations ---
  const handleOpenDialog = (customer: Customer | null = null) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomer(null);
  };

  const handleSave = async (customerData: Omit<Customer, 'id' | '_links'> | Customer) => {
    try {
      setError(null);
      if ('id' in customerData && customerData.id != null) {
        await updateCustomer(customerData as Customer);
      } else {
        await addCustomer(customerData);
      }
      handleCloseDialog();
    } catch (err) {
      console.log("Save operation failed in handleSave");
      // Error is already set in add/updateCustomer
    }
  };

  // --- Handlers for Delete Confirmation Dialog ---

  const handleDeleteClick = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    const customerLink = (customerToDelete as any)._links?.self.href; // Assuming _links exists

    if (!customerLink) {
        setError("Poisto epäonnistui: Asiakkaan linkkiä ei löytynyt.");
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
        return;
    }

    try {
        await deleteCustomer(customerLink);
        // fetchCustomers() is called inside deleteCustomer on success
    } catch (err) {
        console.log("Delete operation failed in handleDeleteConfirm");
        // Error is already set in deleteCustomer
    } finally {
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

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

    const csvHeaders = useMemo(() => columns
        .filter(col => col.key !== 'actions' && col.key !== 'id' && col.key !== '_links')
        .map(col => ({ label: col.label, key: col.key as string })),
    [columns]
    );

    const csvData = useMemo(() => {
        return processedCustomers.map(c => {
             const exportCustomer: Partial<Record<keyof Customer, any>> = {};
             csvHeaders.forEach(header => {
                 if (header.key in c) {
                    exportCustomer[header.key as keyof Customer] = (c as any)[header.key] ?? '';
                 } else {
                     exportCustomer[header.key as keyof Customer] = '';
                 }
             });
             return exportCustomer;
        });
    }, [processedCustomers, csvHeaders]);

    const csvFilename = "asiakkaat_export.csv";

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <Box sx={{ height: '100%', width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>Asiakkaat</Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
         <TextField
            label="Hae kaikista kentistä..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 'auto' }, flexGrow: 1, mr: { sm: 2 } }}
        />
         <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} disabled={loading}>
                Lisää asiakas
            </Button>
             <CSVLink data={csvData} headers={csvHeaders} filename={csvFilename} style={{ textDecoration: 'none' }} target="_blank" >
                <Button variant="outlined"> Vie CSV </Button>
             </CSVLink>
         </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
          </Box>
      )}

      {!loading && (
          <TableContainer component={Paper} sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <Table stickyHeader sx={{ minHeight: 0 }}>
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
                            <IconButton aria-label="muokkaa" size="small" color="primary" onClick={() => handleOpenDialog(c)} disabled={loading}>
                              <EditIcon fontSize="inherit"/>
                            </IconButton>
                            <IconButton aria-label="poista" size="small" color="error" onClick={() => handleDeleteClick(c)} disabled={loading}>
                              <DeleteIcon fontSize="inherit"/>
                            </IconButton>
                          </Box>
                        ) : (
                          (c as any)[col.key] ?? '-'
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {processedCustomers.length === 0 && !error && !loading && (
                  <TableRow>
                    <TableCell colSpan={columns.length} align="center">
                      Ei hakutuloksia tai asiakkaita ei ole lisätty.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
      )}

      <AddCustomerDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        initialData={editingCustomer}
      />

      <ConfirmationDialog
        open={deleteDialogOpen}
        title="Vahvista poisto"
        message={`Haluatko varmasti poistaa asiakkaan ${customerToDelete?.firstname} ${customerToDelete?.lastname}?`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Box>
  );
};

export default CustomerList;
