import React, { useState } from 'react';
import { ProductFilters } from '../../components/products/ProductFilters';

export const ProductsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Browse Products</h1>
        <p className="text-gray-500">
          Coming soon! Use 'Add Item' in your shopping list to add custom items.
        </p>
      </div>

      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="mt-12 p-8 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <h3 className="text-lg font-bold text-blue-900 mb-2">Products Catalog</h3>
        <p className="text-blue-700 mb-4">
          The product catalog is coming soon! For now, add items directly to your shopping list with
          custom names, quantities, and notes.
        </p>
        <a
          href="/lists"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
          aria-label="Navigate to my shopping lists"
        >
          Go to My Lists
        </a>
      </div>
    </div>
  );
};
