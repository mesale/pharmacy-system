import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

interface Suggestion {
    product_id: number;
    product_name: string;
    barcode: string | null;
    category: string;
    current_stock: number;
    reorder_level: number;
    suggested_qty: number;
    supplier_name: string;
}

interface Props {
    auth: any;
    groupedSuggestions: Record<string, Suggestion[]>;
}

export default function Index({ auth, groupedSuggestions }: Props) {
    
    const printOrder = () => {
        window.print();
    };

    const hasSuggestions = Object.keys(groupedSuggestions).length > 0;

    return (
        <AdminLayout>
            <Head title="Purchasing & Restock" />

            <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                
                {/* Print Header - Hidden on screen, visible on print */}
                <div className="hidden print:block mb-8">
                    <h1 className="text-3xl font-bold">Purchase Order</h1>
                    <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                    <hr className="my-4 border-black" />
                </div>

                <div className="flex justify-between items-center mb-6 print:hidden">
                    <h2 className="text-2xl font-semibold text-gray-900">Purchasing & Restock</h2>
                    {hasSuggestions && (
                        <Button onClick={printOrder} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">print</span>
                            Print Purchase Orders
                        </Button>
                    )}
                </div>

                {!hasSuggestions && (
                    <div className="bg-white shadow-sm sm:rounded-lg p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-green-500 mb-4">inventory</span>
                        <h3 className="text-xl font-medium text-gray-900">Inventory is Healthy</h3>
                        <p className="text-gray-500 mt-2">No products are currently below their reorder threshold.</p>
                    </div>
                )}

                {Object.entries(groupedSuggestions).map(([supplier, items]) => (
                    <div key={supplier} className="bg-white shadow-sm sm:rounded-lg mb-8 print:shadow-none print:mb-12 print:break-inside-avoid">
                        <div className="p-6 border-b border-gray-200 bg-gray-50 print:bg-transparent print:border-b-2 print:border-black">
                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
                                VENDOR: {supplier}
                            </h3>
                            <p className="text-sm text-gray-500 print:text-black">
                                Total Items to Order: {items.length}
                            </p>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 print:divide-black">
                                <thead className="bg-white">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider print:text-black">Product Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider print:text-black">Barcode</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider print:text-black">Current Stock</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider print:text-black">Reorder Lvl</th>
                                        <th className="px-6 py-3 text-right text-xs font-bold text-indigo-600 uppercase tracking-wider print:text-black">Suggested Order Qty</th>
                                        <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider print:text-black print:table-cell hidden">Check</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 print:divide-gray-400">
                                    {items.map((item) => (
                                        <tr key={item.product_id} className="hover:bg-gray-50 print:hover:bg-transparent">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.product_name}
                                                <div className="text-xs text-gray-400 print:hidden">{item.category}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 print:text-black">
                                                {item.barcode || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600 font-semibold print:text-black">
                                                {item.current_stock}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 print:text-black">
                                                {item.reorder_level}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-indigo-600 text-lg print:text-black">
                                                {item.suggested_qty}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center hidden print:table-cell">
                                                <div className="w-6 h-6 border-2 border-black inline-block rounded-sm"></div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 0.5cm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    nav, aside, header { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; }
                }
            `}} />
        </AdminLayout>
    );
}

