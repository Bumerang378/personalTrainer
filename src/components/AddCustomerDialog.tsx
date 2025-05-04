import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

// ASIAKAS ASIAKAS ASIAKAS ASIAKAS 
type Customer = {
  id?: number;
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
  onSave: (customer: Customer | Omit<Customer, 'id'>) => void;
  initialData: Customer | null;
};

const AddCustomerDialog = ({ open, onClose, onSave, initialData }: Props) => {
  // Lomakkeen tila EI sisällä ID:tä, se tulee initialDatasta tarvittaessa
  const [customer, setCustomer] = useState<Omit<Customer, 'id'>>({
    firstname: '', lastname: '', email: '', streetaddress: '', postcode: '', city: '', phone: ''
  });

  useEffect(() => {
    if (initialData && open) {
      // Muokkaus: Aseta arvot initialDatan mukaan
      setCustomer({
        firstname: initialData.firstname,
        lastname: initialData.lastname,
        email: initialData.email,
        streetaddress: initialData.streetaddress ?? '',
        postcode: initialData.postcode ?? '',
        city: initialData.city ?? '',
        phone: initialData.phone ?? ''
      });
    } else if (!initialData && open) {
      // Lisäys: Tyhjennä lomake
      setCustomer({ firstname: '', lastname: '', email: '', streetaddress: '', postcode: '', city: '', phone: '' });
    }
  }, [initialData, open]); // Ajetaan kun initialData tai open muuttuu

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Lisätään ID mukaan vain jos muokataan (initialData oli olemassa)
    const saveData: Customer | Omit<Customer, 'id'> = initialData
      ? { ...customer, id: initialData.id }
      : customer;
    onSave(saveData);
    // onClose(); // Parent-komponentti (CustomerList) hoitaa sulkemisen onSave-käsittelijässään
  };

  // Määritellään kentät ja niiden labelit (parempi kuin dynaaminen generointi)
  const formFields = [
      { name: 'firstname', label: 'Etunimi', type: 'text'},
      { name: 'lastname', label: 'Sukunimi', type: 'text'},
      { name: 'email', label: 'Sähköposti', type: 'email'},
      { name: 'streetaddress', label: 'Katuosoite', type: 'text'},
      { name: 'postcode', label: 'Postinumero', type: 'text'},
      { name: 'city', label: 'Kaupunki', type: 'text'},
      { name: 'phone', label: 'Puhelin', type: 'tel'}
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Muokkaa asiakkaan tietoja' : 'Lisää uusi asiakas'}</DialogTitle>
      <DialogContent>
        {formFields.map((field) => (
             <TextField
                key={field.name}
                margin="dense"
                name={field.name}
                label={field.label}
                type={field.type}
                fullWidth
                // Varmistetaan että tyyppi on oikea hakemaan arvoa statesta
                value={customer[field.name as keyof typeof customer] ?? ''}
                onChange={handleChange}
            />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Peruuta</Button>
        <Button onClick={handleSave} variant="contained">{initialData ? 'Tallenna muutokset' : 'Tallenna'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCustomerDialog;