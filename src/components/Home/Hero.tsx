import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export const Hero: React.FC = () => {
    return (
        <section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
            {/* Background Shapes */}
            <div className="absolute top-0 right-0 w-2/3 h-full bg-linear-to-bl from-blue-50 to-transparent dark:from-blue-900/20 -z-10 rounded-bl-[100px]" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-linear-to-tr from-purple-50 to-transparent dark:from-purple-900/20 -z-10 rounded-tr-[100px]" />

            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    {/* Text Content */}
                    <div className="flex-1 max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-6">
                                Same Day Delivery 🚀
                            </span>
                            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                                Fresh Groceries <br />
                                <span className="text-gradient">Delivered Fast</span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-lg">
                                Experience the finest quality fresh produce, organic essentials, and household items delivered straight to your doorstep within hours.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <button className="btn-primary py-4 px-8 text-lg flex items-center gap-2 shadow-lg shadow-primary/25">
                                    Start Shopping
                                    <ShoppingBag size={20} />
                                </button>
                                <button className="btn-secondary py-4 px-8 text-lg flex items-center gap-2">
                                    View Categories
                                    <ArrowRight size={20} />
                                </button>
                            </div>

                            <div className="mt-12 flex items-center gap-8">
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">15k+</p>
                                    <p className="text-sm text-gray-500">Happy Customers</p>
                                </div>
                                <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">2k+</p>
                                    <p className="text-sm text-gray-500">Products</p>
                                </div>
                                <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" />
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">4.9</p>
                                    <p className="text-sm text-gray-500">Customer Rating</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Image Content */}
                    <div className="flex-1 relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative z-10"
                        >
                            <div className="relative aspect-square rounded-full bg-linear-to-br from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 p-8">
                                <img
                                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                    alt="Fresh Grocery Bag"
                                    className="w-full h-full object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                />

                                {/* Floating Cards */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                            🌿
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">100% Organic</p>
                                            <p className="text-xs text-gray-500">Fresh & Natural</p>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute -bottom-8 -left-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                            🚚
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">Free Delivery</p>
                                            <p className="text-xs text-gray-500">On orders over $50</p>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};
