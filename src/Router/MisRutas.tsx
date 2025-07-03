
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Contacto } from '../components/Contacto';
import { Inicio } from '../components/inicio';
import { Navbar } from '../components/Layout/Navbar';

export const MisRutas = () => {
  return (
    <BrowserRouter>
      {/* <Header /> */}
      <Navbar />

      <Routes>


        <Route path="/" element={<Inicio />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/contacto" element={<Contacto />} />


        <Route
          path="*"
          element={
            <div className="p-8 text-center">
              <h1 className="text-4xl font-bold text-red-600">Error 404</h1>
              <p className="mt-2 text-lg">Esta página no existe.</p>
            </div>
          }
        />
      </Routes>

      {/* <Footer /> */}
      <Footer />
    </BrowserRouter>
  )
}
