import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Ao trocar de tela, começa do topo (o navegador manteria a rolagem da tela anterior). */
export default function VoltaAoTopo() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
