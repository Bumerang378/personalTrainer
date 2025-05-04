import { useEffect, useState, useMemo } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, 
  TextField, Typography, Alert 
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

type Customer = {
  firstname: string;
  lastname: string;
  email: string;
  streetaddress: string;
  postcode: string;
  city: string;
  phone: string;
  _links: {
    self: { href: string };
    customer: { href: string };
    trainings: { href: string };
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
  const [sortConfig, setSortConfig] = useState<{ key: keyof Customer | null; direction: 'ascending' | 'descending' }>({
    key: null,
    direction: 'ascending',
  });

  const fetchCustomers = async () => {
    try {
      const response = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers');
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }
      const data = await response.json();
      setCustomers(data._embedded.customers);
    } catch (err: any) {
      setError("Tietojen haku epäonnistui: " + err.message);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const processedCustomers = useMemo(() => {
    let filtered = [...customers];
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(c =>
        c.firstname.toLowerCase().includes(term) ||
        c.lastname.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.city.toLowerCase().includes(term) ||
        c.phone.includes(term)
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

  return (
    <div>
      <Typography variant="h4" gutterBottom>Asiakkaat</Typography>

      <TextField 
        label="Hae nimi, email, kaupunki..." 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        sx={{ mb: 2, width: '300px' }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {[
                { key: 'firstname', label: 'Etunimi' },
                { key: 'lastname', label: 'Sukunimi' },
                { key: 'email', label: 'Sähköposti' },
                { key: 'city', label: 'Kaupunki' },
                { key: 'phone', label: 'Puhelin' }
              ].map(({ key, label }) => (
                <TableCell
                  key={key}
                  onClick={() => requestSort(key as keyof Customer)}
                  sx={{ cursor: 'pointer' }}
                >
                  {label}
                  <SortIndicator direction={sortConfig.key === key ? sortConfig.direction : null} />
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {processedCustomers.map((c, index) => (
              <TableRow key={index}>
                <TableCell>{c.firstname}</TableCell>
                <TableCell>{c.lastname}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.city}</TableCell>
                <TableCell>{c.phone}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default CustomerList;