import React from 'react';
import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom'; // Käytetään aliasia konfliktin välttämiseksi

const Navbar: React.FC = () => {
return (
<AppBar position="static" sx={{ mb: 3 }}> {/* Lisätty vähän marginaalia alle */}
<Toolbar>
<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
PT Sovellus
</Typography>
{/* Linkit reititettyihin sivuihin */}
<Button color="inherit" component={RouterLink} to="/customers">
Asiakkaat
</Button>
<Button color="inherit" component={RouterLink} to="/trainings">
Harjoitukset
</Button>
<Button color="inherit" component={RouterLink} to="/calendar">
Kalenteri
</Button>
<Button color="inherit" component={RouterLink} to="/stats">
Tilastot
</Button>
</Toolbar>
</AppBar>
);
};

export default Navbar;