import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Enquanto confere o token salvo, não mostra nada (evita piscar a tela de login). */
export function SoLogado({ children }) {
  const { logado, carregando } = useAuth();
  if (carregando) return null;
  return logado ? children : <Navigate to="/" replace />;
}

export function SoDono({ children }) {
  const { isAdmin, carregando } = useAuth();
  if (carregando) return null;
  return isAdmin ? children : <Navigate to="/home" replace />;
}

/** Quem já entrou e abre a capa ou o login vai direto pra loja. */
export function SoVisitante({ children }) {
  const { logado, carregando } = useAuth();
  if (carregando) return null;
  return logado ? <Navigate to="/home" replace /> : children;
}
