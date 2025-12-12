import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { Home } from './pages/Home/Home';
import { AppLayout } from './components/Layout/AppLayout';
import { ProductsPage } from './pages/Products/ProductsPage';
import { ListPage } from './pages/Lists/ListPage';
import { SharedListPage } from './pages/Share/SharedListPage';
import { BoardPage } from './pages/Board/BoardPage';
import { ToastProvider } from './components/common/ToastProvider';

// Simple protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Public Share Route */}
          <Route path="/share/:shareToken" element={<SharedListPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/lists" element={<ListPage />} />
            <Route path="/board" element={<BoardPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
