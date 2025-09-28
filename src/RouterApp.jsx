import { Routes, Route} from 'react-router-dom'
import Redir from './auth/Redir';
import App from './App'
import Auth from './auth/Auth'
import Admin from './admin/Admin'
import CreateRecipe from './create/CreateRecipe';
// import React from 'react';

const Router = () => {
  return (
    <Routes>
      <Route path='/' element={<Redir />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/admin' element={<Admin />} />
      <Route path='/create' element={<CreateRecipe />}/> 
    </Routes>
  );
};

export default Router;