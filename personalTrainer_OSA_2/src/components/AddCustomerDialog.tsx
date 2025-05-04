import React, { useState, useEffect } from 'react'; // Lisää React ja useEffect
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

// Käytetään tyyppiä, joka sisältää ID:n, jotta se vastaa CustomerListin dataa
// (Voit myös importata tämän tyypin CustomerListista)
type Customer = {
  id?: number; // ID on vapaaehtoinen (puuttuu uutta lisätessä)
  firstname: string;
  lastname: string;
  email: string;
  streetaddress?: string; // Lisätty nämä kentät
  postcode?: string;
  city?: string;
  phone?: string;
};

// Propsit: Lisätään initialData ja muokataan onSaven tyyppiä
type Props = {
  open: boolean;
  onClose: () => void;
  // onSave voi saada joko uuden asiakkaan (ilman id) tai muokatun (id:llä)
  onSave: (customer: Customer | Omit<Customer, 'id'>) => void;
  initialData: Customer | null; // Data muokkausta varten tai null lisätessä
};

// Harkitse komponentin nimeämistä uudelleen esim. CustomerDialog.tsx
const AddCustomerDialog = ({ open, onClose, onSave, initialData }: Props) => {
  // Sisäinen tila lomakkeelle
  const [customer, setCustomer] = useState<Omit<Customer, 'id'>>({
    firstname: '', 
    lastname: '', 
    email: '', 
    streetaddress: '', 
    postcode: '', 
    city: '', 
    phone: ''
  });

  // useEffect päivittää lomakkeen, kun initialData muuttuu (dialogi avataan muokkausta varten)
  useEffect(() => {
    if (initialData && open) { // Tarkistetaan myös 'open', jotta ei päivitetä turhaan dialogin ollessa kiinni
      // Muokkaustila: Aseta lomakkeen arvot initialDatan mukaan
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
      // Lisäystila: Tyhjennä lomake, kun dialogi avataan ilman initialDataa
      setCustomer({ firstname: '', lastname: '', email: '', streetaddress: '', postcode: '', city: '', phone: '' });
    }
    // Riippuvuudet: initialData ja open
  }, [initialData, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Kun tallennetaan, luodaan objekti, joka sisältää ID:n, JOS se oli initialDatassa
    const saveData: Customer | Omit<Customer, 'id'> = initialData
      ? { ...customer, id: initialData.id } 
      : customer;                           
    onSave(saveData);
    // onClose(); // onClose kutsutaan nyt CustomerListin handleSave-funktiossa onnistumisen jälkeen
    // Lomakkeen tyhjennys tapahtuu nyt useEffectissä, kun dialogi avataan seuraavan kerran lisäystilassa
  };

  return (
    <Dialog open={open} onClose={onClose} > 
      <DialogTitle>{initialData ? 'Muokkaa asiakkaan tietoja' : 'Lisää uusi asiakas'}</DialogTitle>
      <DialogContent>
        <TextField margin="dense" name="firstname" label="Etunimi" value={customer.firstname} onChange={handleChange} fullWidth />
        <TextField margin="dense" name="lastname" label="Sukunimi" value={customer.lastname} onChange={handleChange} fullWidth />
        <TextField margin="dense" name="email" label="Sähköposti" type="email" value={customer.email} onChange={handleChange} fullWidth />
        <TextField margin="dense" name="streetaddress" label="Katuosoite" value={customer.streetaddress} onChange={handleChange} fullWidth />
        <TextField margin="dense" name="postcode" label="Postinumero" value={customer.postcode} onChange={handleChange} fullWidth />
        <TextField margin="dense" name="city" label="Kaupunki" value={customer.city} onChange={handleChange} fullWidth />
        <TextField margin="dense" name="phone" label="Puhelin" value={customer.phone} onChange={handleChange} fullWidth />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Peruuta</Button>
        <Button onClick={handleSave} variant="contained">{initialData ? 'Tallenna muutokset' : 'Tallenna'}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCustomerDialog;