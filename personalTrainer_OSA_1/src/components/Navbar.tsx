import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav>
    <Link to="/customers">Asiakkaat</Link> |{" "}
    <Link to="/trainings">Harjoitukset</Link>
  </nav>
);

export default Navbar;