import { AdminApp } from './components/admin/AdminApp';
import { PublicPortfolio } from './components/PublicPortfolio';

export default function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminApp />;
  }

  return <PublicPortfolio />;
}
