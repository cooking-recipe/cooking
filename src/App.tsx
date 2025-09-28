import './App.css'

// import { supabase } from './lib/supabase' //наша БД, в будующем будем к ней подключаться

import Nav from './nav/Nav'
import RouterApp  from './RouterApp'
function App() {
  
  return (
    <>
        <Nav/>
        <RouterApp/>
   
      
    </>
  )
}

export default App