import { Navbar } from '../../components/Layout/Navbar';
import { Hero } from '../../components/Home/Hero';
import { FeaturedProducts } from '../../components/Home/FeaturedProducts';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <main>
        <Hero />
        <FeaturedProducts />
      </main>

      {/* Footer Placeholder */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t dark:border-gray-800">
        <p>© 2025 FreshMart Grocery. All rights reserved.</p>
      </footer>
    </div>
  );
};
