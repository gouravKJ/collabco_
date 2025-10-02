import { Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/navbar';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import Editor from './pages/editor';

function App(){
  const token = localStorage.getItem("token");

  return (
    <>
      <Navbar />
      <div className="pt-16"> 
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/login' element={!token ? <Login/> : <Navigate to="/" />}/>
          <Route path='/register' element={!token ? <Register/> : <Navigate to="/" />}/>
          <Route path='/editor/:id' element={token ? <Editor/> : <Navigate to="/login"/>}/>
        </Routes>
      </div>
    </>
  );
}

export default App;
