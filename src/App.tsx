import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import About from './pages/About';
import Account from './pages/Account';
import Orders from './pages/Orders';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import AdminCategories from './pages/admin/AdminCategories';
import AdminProducts from './pages/admin/AdminProducts';
import AdminDiscounts from './pages/admin/AdminDiscounts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminEmail from './pages/admin/AdminEmail';
import AdminPayments from './pages/admin/AdminPayments';
import ProtectedRoute from './components/admin/ProtectedRoute';
import SessionSync from './components/SessionSync';

function StoreLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col bg-white text-neutral-900">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <SessionSync />
                <BrowserRouter>
                    <Routes>
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                            <Route index element={<Dashboard />} />
                            <Route path="categories" element={<AdminCategories />} />
                            <Route path="products" element={<AdminProducts />} />
                            <Route path="discounts" element={<AdminDiscounts />} />
                            <Route path="orders" element={<AdminOrders />} />
                            <Route path="users" element={<AdminUsers />} />
                            <Route path="email" element={<AdminEmail />} />
                            <Route path="payments" element={<AdminPayments />} />
                        </Route>
                        <Route path="*" element={
                            <StoreLayout>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/shop" element={<Shop />} />
                                    <Route path="/product/:id" element={<ProductDetail />} />
                                    <Route path="/checkout" element={<Checkout />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/account" element={<Account />} />
                                    <Route path="/orders" element={<Orders />} />
                                </Routes>
                            </StoreLayout>
                        } />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}
