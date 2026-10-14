import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SacolaProvider } from './context/SacolaContext';
import { AvisoProvider } from './context/AvisoContext';
import { PedidoAtivoProvider } from './context/PedidoAtivoContext';
import { SoDono, SoLogado, SoVisitante } from './components/RotaProtegida';
import VoltaAoTopo from './components/VoltaAoTopo';

import Capa from './pages/Capa';
import Entrar from './pages/Entrar';
import CriarConta from './pages/CriarConta';
import Loja from './pages/Loja';
import Sacola from './pages/Sacola';
import Pagamento from './pages/Pagamento';
import Confirmacao from './pages/Confirmacao';
import Pedidos from './pages/Pedidos';
import Acompanhar from './pages/Acompanhar';
import Rota from './pages/Rota';
import Perfil from './pages/Perfil';
import EditarPerfil from './pages/EditarPerfil';
import Painel from './pages/Painel';

/*
  As URLs continuam as da primeira versão (/home, /carrinho, /admin...),
  assim links antigos e o README do back-end seguem valendo.
*/
export default function App() {
  return (
    <AuthProvider>
      <PedidoAtivoProvider>
      <SacolaProvider>
        <AvisoProvider>
          {/* As duas flags adotam já o comportamento do React Router 7 e tiram os avisos do console. */}
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <VoltaAoTopo />
            <Routes>
              <Route path="/" element={<SoVisitante><Capa /></SoVisitante>} />
              <Route path="/login" element={<SoVisitante><Entrar /></SoVisitante>} />
              <Route path="/registro" element={<SoVisitante><CriarConta /></SoVisitante>} />

              <Route path="/home" element={<SoLogado><Loja /></SoLogado>} />
              <Route path="/carrinho" element={<SoLogado><Sacola /></SoLogado>} />
              <Route path="/checkout" element={<SoLogado><Pagamento /></SoLogado>} />
              <Route path="/confirmacao/:id" element={<SoLogado><Confirmacao /></SoLogado>} />
              <Route path="/pedidos" element={<SoLogado><Pedidos /></SoLogado>} />
              <Route path="/pedido/:id" element={<SoLogado><Acompanhar /></SoLogado>} />
              <Route path="/rota" element={<SoLogado><Rota /></SoLogado>} />
              <Route path="/perfil" element={<SoLogado><Perfil /></SoLogado>} />
              <Route path="/perfil/editar" element={<SoLogado><EditarPerfil /></SoLogado>} />

              <Route path="/admin" element={<SoDono><Painel /></SoDono>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AvisoProvider>
      </SacolaProvider>
      </PedidoAtivoProvider>
    </AuthProvider>
  );
}
