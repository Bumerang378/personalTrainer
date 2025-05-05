import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

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

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  customer: Customer | null;
};

const EditCustomerDialog = ({ open, onClose, onSave, customer }: Props) => {
  const [editedCustomer, setEditedCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (customer) {
      setEditedCustomer(customer);
    }
  }, [customer]);

  const handleSave = () => {
    if (editedCustomer) {
      onSave(editedCustomer);
      onClose();
    }
  };

  if (!editedCustomer) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Muokkaa asiakasta</DialogTitle>
      <DialogContent>
        <TextField
          label="Etunimi"
          value={editedCustomer.firstname}
          onChange={e => setEditedCustomer({ ...editedCustomer, firstname: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Sukunimi"
          value={editedCustomer.lastname}
          onChange={e => setEditedCustomer({ ...editedCustomer, lastname: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          value={editedCustomer.email}
          onChange={e => setEditedCustomer({ ...editedCustomer, email: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Osoite"
          value={editedCustomer.streetaddress || ''}
          onChange={e => setEditedCustomer({ ...editedCustomer, streetaddress: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Postinumero"
          value={editedCustomer.postcode || ''}
          onChange={e => setEditedCustomer({ ...editedCustomer, postcode: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Kaupunki"
          value={editedCustomer.city || ''}
          onChange={e => setEditedCustomer({ ...editedCustomer, city: e.target.value })}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Puhelin"
          value={editedCustomer.phone || ''}
          onChange={e => setEditedCustomer({ ...editedCustomer, phone: e.target.value })}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Peruuta</Button>
        <Button onClick={handleSave} variant="contained">Tallenna</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCustomerDialog;
