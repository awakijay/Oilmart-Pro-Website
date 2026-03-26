import { RouterProvider } from 'react-router';
import { CartProvider } from './context/CartContext';
import { AppDataProvider } from './context/AppDataContext';
import { ChatProvider } from './context/ChatContext';
import { AuthProvider } from './context/AuthContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppDataProvider>
          <ChatProvider>
            <RouterProvider router={router} />
          </ChatProvider>
        </AppDataProvider>
      </CartProvider>
    </AuthProvider>
  );
}
