import { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Typography, Alert
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

type Training = {
  id: number;
  date: string;
  duration: number;
  activity: string;
  customer: {
    id: number;
    firstname: string;
    lastname: string;
    streetaddress: string;
    postcode: string;
    city: string;
    email: string;
    phone: string;
  };
};

const SortIndicator = ({ direction }: { direction: 'ascending' | 'descending' | null }) => {
  if (!direction) return null;
  return direction === 'ascending' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
};

const TrainingList = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [search, setSearch] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string | null; direction: 'ascending' | 'descending' }>({
    key: null,
    direction: 'ascending',
  });

  const fetchTrainings = async () => {
    try {
      const response = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/gettrainings');
      if (!response.ok) {
        throw new Error('Failed to fetch trainings');
      }
      const data = await response.json();
      setTrainings(data);
    } catch (err: any) {
      setError("Tietojen haku epäonnistui: " + err.message);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const getCustomerName = (training: Training): string =>
    `${training.customer.firstname} ${training.customer.lastname}`;

  const processedTrainings = useMemo(() => {
    let filtered = [...trainings];
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(t =>
        getCustomerName(t).toLowerCase().includes(term) ||
        t.activity.toLowerCase().includes(term) ||
        dayjs(t.date).format('DD.MM.YYYY').includes(term)
      );
    }

    if (sortConfig.key !== null) {
      filtered.sort((a, b) => {
        const key = sortConfig.key;
        const aValue = key === 'customer' ? getCustomerName(a) : a[key as keyof Training];
        const bValue = key === 'customer' ? getCustomerName(b) : b[key as keyof Training];

        if (key === 'date') {
          const dateA = dayjs(aValue as string);
          const dateB = dayjs(bValue as string);
          if (dateA.isBefore(dateB)) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (dateA.isAfter(dateB)) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [trainings, search, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>Harjoitukset</Typography>

      <TextField
        label="Hae asiakas, aktiviteetti, pvm..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2, width: '300px' }}
      />

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => requestSort('customer')} sx={{ cursor: 'pointer' }}>
                Asiakas
                <SortIndicator direction={sortConfig.key === 'customer' ? sortConfig.direction : null} />
              </TableCell>
              <TableCell onClick={() => requestSort('activity')} sx={{ cursor: 'pointer' }}>
                Aktiviteetti
                <SortIndicator direction={sortConfig.key === 'activity' ? sortConfig.direction : null} />
              </TableCell>
              <TableCell onClick={() => requestSort('duration')} sx={{ cursor: 'pointer' }}>
                Kesto (min)
                <SortIndicator direction={sortConfig.key === 'duration' ? sortConfig.direction : null} />
              </TableCell>
              <TableCell onClick={() => requestSort('date')} sx={{ cursor: 'pointer' }}>
                Päivämäärä
                <SortIndicator direction={sortConfig.key === 'date' ? sortConfig.direction : null} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processedTrainings.map(t => (
              <TableRow key={t.id}>
                <TableCell>{getCustomerName(t)}</TableCell>
                <TableCell>{t.activity}</TableCell>
                <TableCell>{t.duration}</TableCell>
                <TableCell>{dayjs(t.date).format('DD.MM.YYYY HH:mm')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TrainingList;