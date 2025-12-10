import React from 'react';
import { motion } from 'framer-motion';
import { Star, Plus, Heart } from 'lucide-react';

const products = [
    {
        id: 1,
        name: 'Organic Bananas',
        price: 4.99,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        category: 'Fruits'
    },
    {
        id: 2,
        name: 'Fresh Avocado',
        price: 2.49,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1523049673856-6468baca292f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        category: 'Vegetables'
    },
    {
        id: 3,
        name: 'Red Strawberries',
        price: 5.99,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        category: 'Fruits'
    },
    {
        id: 4,
        name: 'Whole Milk',
        price: 3.99,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        category: 'Dairy'
    },
];

export const FeaturedProducts: React.FC = () => {
    return (
        <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
                        <p className="text-gray-600 dark:text-gray-400">Top picks for your daily needs</p>
                    </div>
                    <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                        View All
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700"
                        >
                            <div className="relative aspect-4/3 mb-4 overflow-hidden rounded-xl bg-gray-100">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-red-500 hover:bg-white transition-colors">
                                    <Heart size={18} />
                                </button>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                                        {product.category}
                                    </span>
                                    <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                                        <Star size={14} fill="currentColor" />
                                        {product.rating}
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">
                                    {product.name}
                                </h3>

                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        ${product.price}
                                    </span>
                                    <button className="p-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 active:scale-95">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
