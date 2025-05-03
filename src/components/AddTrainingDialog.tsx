import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import dayjs, { Dayjs } from 'dayjs';

type Customer = {
  id: number;
  firstname: string;
  lastname: string;
  _links?: {
    self?: { href: string };
    [key: string]: any;
  };
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (training: { date: string; duration: number; activity: string; customerId: number }) => void;
  customers: Customer[];
};

const AddTrainingDialog = ({ open, onClose, onSave, customers }: Props) => {
  const [training, setTraining] = useState({
    activity: '',
    duration: 0,
    date: dayjs().toISOString(),
    customerId: customers[0]?.id || 0,
  });

  const [errors, setErrors] = useState({
    activity: '',
    duration: '',
    date: '',
    customerId: '',
  });

  // Resetoi lomake aina kun dialogi avataan
  useEffect(() => {
    if (open && customers.length) {
      setTraining({
        activity: '',
        duration: 0,
        date: dayjs().toISOString(),
        customerId: customers[0].id,
      });
      setErrors({
        activity: '',
        duration: '',
        date: '',
        customerId: '',
      });
    }
  }, [open, customers]);

  const validateForm = () => {
    const newErrors = {
      activity: '',
      duration: '',
      date: '',
      customerId: '',
    };

    if (!training.activity.trim()) {
      newErrors.activity = 'Aktiviteetti on pakollinen';
    }

    if (training.duration <= 0) {
      newErrors.duration = 'Keston täytyy olla suurempi kuin 0';
    }

    if (!training.date) {
      newErrors.date = 'Päivämäärä on pakollinen';
    }

    if (!training.customerId) {
      newErrors.customerId = 'Asiakas on pakollinen';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(training);
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTraining(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) || 0 : value
    }));
  };

  const handleDateChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setTraining(prev => ({
        ...prev,
        date: newValue.toISOString()
      }));
    }
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customerId = Number(e.target.value);
    setTraining(prev => ({
      ...prev,
      customerId
    }));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Lisää harjoitus</DialogTitle>
      <DialogContent>
        <TextField
          select
          label="Asiakas"
          value={training.customerId}
          onChange={handleCustomerChange}
          fullWidth
          error={!!errors.customerId}
          helperText={errors.customerId}
          sx={{ mb: 2 }}
        >
          {customers.map(c => (
            <MenuItem key={c.id} value={c.id}>
              {c.firstname} {c.lastname}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Aktiviteetti"
          name="activity"
          value={training.activity}
          onChange={handleInputChange}
          fullWidth
          sx={{ mb: 2 }}
          error={!!errors.activity}
          helperText={errors.activity}
        />

        <TextField
          label="Kesto (min)"
          type="number"
          name="duration"
          value={training.duration}
          onChange={handleInputChange}
          fullWidth
          sx={{ mb: 2 }}
          error={!!errors.duration}
          helperText={errors.duration}
          inputProps={{ min: 1 }}
        />

        <DateTimePicker
          label="Päivämäärä ja aika"
          value={dayjs(training.date)}
          onChange={handleDateChange}
          sx={{ mb: 2, width: '100%' }}
          format="DD.MM.YYYY HH:mm"
          ampm={false}
          views={['year', 'month', 'day', 'hours', 'minutes']}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!errors.date,
              helperText: errors.date,
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Peruuta</Button>
        <Button onClick={handleSave} variant="contained">Tallenna</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTrainingDialog;