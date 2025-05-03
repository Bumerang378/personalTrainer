import { useEffect, useState } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import _ from 'lodash';

interface Training {
  activity: string;
  duration: number;
}

interface ChartData {
  activity: string;
  duration: number;
}

const StatsPage = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrainings = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings');
        if (!response.ok) throw new Error('Network response was not ok');
        const apiData = await response.json();
        const trainings: Training[] = apiData._embedded?.trainings || [];
        // Group by activity and sum durations
        const grouped = _.groupBy(trainings, 'activity');
        const chartData: ChartData[] = Object.keys(grouped).map(activity => ({
          activity,
          duration: _.sumBy(grouped[activity], 'duration')
        }));
        setData(chartData);
      } catch (err) {
        setError('Harjoitusten haku epäonnistui.');
      } finally {
        setLoading(false);
      }
    };
    fetchTrainings();
  }, []);

  return (
    <Box sx={{ height: '100%', width: '100%', minHeight: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h4" gutterBottom>Harjoitustilastot</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper sx={{ flex: 1, p: 2, minHeight: 0, display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 900, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ top: 32, right: 16, left: 16, bottom: 64 }} barCategoryGap={20}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="activity" angle={-25} textAnchor="end" interval={0} height={60} />
              <YAxis label={{ value: 'Duration (min)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar dataKey="duration" fill="#8884d8" opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>
    </Box>
  );
};

export default StatsPage; 