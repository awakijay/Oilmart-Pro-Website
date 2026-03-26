import { Outlet } from 'react-router';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from './ChatWidget';

export function Layout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <ChatWidget />
    </>
  );
}
