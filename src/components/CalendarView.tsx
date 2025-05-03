import { useEffect, useState, useMemo, useCallback } from 'react';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from 'dayjs';
import 'dayjs/locale/fi';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { Alert, Box, Typography, Paper, CircularProgress, IconButton, AppBar, Toolbar, useTheme, useMediaQuery } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

// Extend dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);

// Set the locale to Finnish
dayjs.locale('fi');

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
  originalTraining: Training;
}

type Training = {
  id: number;
  activity: string;
  date: string;
  duration: number;
  customer?: {
    firstname: string;
    lastname: string;
  };
  customerId?: number;
  _links?: {
    customer?: {
      href: string;
    };
  };
};

const localizer = dayjsLocalizer(dayjs);

const CalendarView = () => {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchTrainings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings');
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      // Handle the _embedded structure
      const trainingsList = data._embedded?.trainings || [];
      
      // Fetch customer details for each training if needed
      const trainingsWithCustomers = await Promise.all(
        trainingsList.map(async (training: Training) => {
          if (training._links?.customer?.href) {
            try {
              const customerResponse = await fetch(training._links.customer.href);
              if (customerResponse.ok) {
                const customerData = await customerResponse.json();
                return {
                  ...training,
                  customer: {
                    firstname: customerData.firstname,
                    lastname: customerData.lastname
                  }
                };
              }
            } catch (err) {
              console.error("Failed to fetch customer details:", err);
            }
          }
          return training;
        })
      );

      setTrainings(trainingsWithCustomers);
    } catch (err) {
      console.error("Failed to fetch trainings for calendar:", err);
      setError("Harjoitusten haku kalenteria varten epäonnistui.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  const events = useMemo((): CalendarEvent[] => {
    return trainings
      .map(t => {
        try {
          // Parse the date string and handle timezone
          const startDate = dayjs(t.date).tz('Europe/Helsinki');
          const endDate = startDate.add(t.duration, 'minute');
          const customerName = t.customer ? `${t.customer.firstname} ${t.customer.lastname}` : '';
          const title = `${t.activity}${customerName ? ` (${customerName})` : ''}`;

          return {
            id: t.id,
            title,
            start: startDate.toDate(),
            end: endDate.toDate(),
            originalTraining: t
          };
        } catch (err) {
          console.error("Error parsing date for training:", t, err);
          return null;
        }
      })
      .filter((event): event is CalendarEvent => event !== null);
  }, [trainings]);

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    const startStr = dayjs(event.start).format('DD.MM.YYYY HH:mm');
    const endStr = dayjs(event.end).format('HH:mm');
    const customerName = event.originalTraining.customer 
      ? `${event.originalTraining.customer.firstname} ${event.originalTraining.customer.lastname}`
      : 'Ei asiakasta';
    
    alert(
      `Tapahtuma: ${event.originalTraining.activity}\n` +
      `Asiakas: ${customerName}\n` +
      `Alkaa: ${startStr}\n` +
      `Päättyy: ${endStr}\n` +
      `Kesto: ${event.originalTraining.duration} min`
    );
  }, []);

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      overflow: 'hidden'
    }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ 
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 2, sm: 3 }
        }}>
          <Typography 
            variant={isMobile ? "h6" : "h5"} 
            component="div" 
            sx={{ flexGrow: 1 }}
          >
            Harjoituskalenteri
          </Typography>
          <IconButton 
            onClick={fetchTrainings} 
            disabled={loading}
            title="Päivitä kalenteri"
            color="inherit"
            size={isMobile ? "small" : "medium"}
          >
            <RefreshIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            m: 2,
            mx: { xs: 1, sm: 2 }
          }}
        >
          {error}
        </Alert>
      )}
      
      {loading ? (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          flex: 1
        }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ 
          flex: 1,
          m: { xs: 1, sm: 2 },
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={['month', 'week', 'day', 'agenda']}
            defaultView={Views.WEEK}
            style={{ 
              height: '100%',
              width: '100%'
            }}
            culture="fi-FI"
            messages={{
              next: "Seuraava",
              previous: "Edellinen",
              today: "Tänään",
              month: "Kuukausi",
              week: "Viikko",
              day: "Päivä",
              agenda: "Agenda",
              date: "Päivämäärä",
              time: "Aika",
              event: "Tapahtuma",
              allDay: "Koko päivä",
              work_week: "Työviikko",
              yesterday: "Eilen",
              tomorrow: "Huomenna",
              noEventsInRange: "Ei tapahtumia tällä aikavälillä.",
              showMore: (total: number) => `Näytä lisää (${total})`
            }}
            onSelectEvent={handleSelectEvent}
            defaultDate={new Date()}
          />
        </Paper>
      )}
    </Box>
  );
};

export default CalendarView;
