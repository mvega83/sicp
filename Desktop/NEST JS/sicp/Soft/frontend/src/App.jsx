import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProveedorAuth } from './contexto/ContextoAuth';
import RutaProtegida from './componentes/Auth/RutaProtegida';
import DisenioPrincipal from './componentes/Layout/DisenioPrincipal';
import PaginaLogin from './componentes/Auth/PaginaLogin';
import ListaProyectos from './componentes/BancoIdeas/ListaProyectos';
import FormularioProyecto from './componentes/BancoIdeas/FormularioProyecto';
import FichaProyecto from './componentes/BancoIdeas/FichaProyecto';
import PaginaFinanciamiento from './componentes/Financiamiento/PaginaFinanciamiento';
import PaginaAprobacion from './componentes/Aprobacion/PaginaAprobacion';
import PaginaLicitacion from './componentes/Licitacion/PaginaLicitacion';
import PaginaProveedor from './componentes/Proveedor/PaginaProveedor';
import PaginaObra from './componentes/Obra/PaginaObra';
import PaginaFinalizacion from './componentes/Finalizacion/PaginaFinalizacion';
import PaginaTiposUsuario from './componentes/Administracion/PaginaTiposUsuario';
import PaginaUsuarios from './componentes/Administracion/PaginaUsuarios';
import PaginaUnidades from './componentes/Administracion/PaginaUnidades';
import PaginaFuentesFinanciamiento from './componentes/Administracion/PaginaFuentesFinanciamiento';
import PaginaCaracteristicasProyectos from './componentes/Administracion/PaginaCaracteristicasProyectos';
import PaginaLocalidades from './componentes/Administracion/PaginaLocalidades';
import PaginaTiposProyecto from './componentes/Administracion/PaginaTiposProyecto';
import PaginaInicio from './componentes/Inicio/PaginaInicio';

export default function App() {
  return (
    <ProveedorAuth>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PaginaLogin />} />

          <Route
            element={
              <RutaProtegida>
                <DisenioPrincipal />
              </RutaProtegida>
            }
          >
            <Route path="/" element={<PaginaInicio />} />
            <Route path="/proyectos" element={<ListaProyectos />} />
            <Route path="/proyectos/nuevo" element={<FormularioProyecto />} />
            <Route path="/proyectos/:id/editar" element={<FormularioProyecto />} />
            <Route path="/proyectos/:id" element={<FichaProyecto />} />
            <Route path="/financiamiento" element={<PaginaFinanciamiento />} />
            <Route path="/aprobacion" element={<PaginaAprobacion />} />
            <Route path="/licitacion" element={<PaginaLicitacion />} />
            <Route path="/proveedor" element={<PaginaProveedor />} />
            <Route path="/obra" element={<PaginaObra />} />
            <Route path="/finalizacion" element={<PaginaFinalizacion />} />
            <Route path="/administracion/tipos-usuario" element={<PaginaTiposUsuario />} />
            <Route path="/administracion/usuarios" element={<PaginaUsuarios />} />
            <Route path="/administracion/unidades" element={<PaginaUnidades />} />
            <Route path="/administracion/fuentes-financiamiento" element={<PaginaFuentesFinanciamiento />} />
            <Route path="/administracion/caracteristicas-proyectos" element={<PaginaCaracteristicasProyectos />} />
            <Route path="/administracion/localidades" element={<PaginaLocalidades />} />
            <Route path="/administracion/tipos-proyecto" element={<PaginaTiposProyecto />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProveedorAuth>
  );
}
