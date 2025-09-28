import React from 'react';
import { Link } from 'react-router-dom';
const Nav = () => {
  return (
    
    <nav>
      <Link to='/'>cookingApp</Link>
      <Link to='/auth'>auth</Link>
      <Link to='/create'>create</Link>
      </nav>
  );
};

export default Nav;