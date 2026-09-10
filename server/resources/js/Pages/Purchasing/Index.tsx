import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';

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

            <div className="py-6 px-0 max-w-7xl mx-auto">
                
                {/* Print Header - Hidden on screen, visible on print */}
                <div className="hidden print:block mb-8 text-black">
                    <h1 className="text-3xl font-bold">Purchase Order</h1>
                    <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
                    <hr className="my-4 border-black" />
                </div>

                <div className="flex justify-between items-center mb-4 print:hidden">
                    <div className="flex items-center gap-3 text-gray-900">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        <h2 className="text-lg font-bold uppercase tracking-wider">Purchasing & Restock</h2>
                    </div>
                    {hasSuggestions && (
                        <button onClick={printOrder} className="bg-emerald-600 text-white text-white hover:bg-emerald-600 text-white-hover transition-colors font-bold uppercase tracking-wider text-sm px-4 py-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">print</span>
                            Print Purchase Orders
                        </button>
                    )}
                </div>

                {!hasSuggestions && (
                    <div className="bg-white shadow-md rounded-lg shadow-sm border border-gray-200 p-12 text-center text-gray-900">
                        <span className="material-symbols-outlined text-6xl text-green-600 mb-4">inventory</span>
                        <h3 className="text-xl font-bold uppercase tracking-wider">Inventory is Healthy</h3>
                        <p className="text-gray-500 mt-2">No products are currently below their reorder threshold.</p>
                    </div>
                )}

                {Object.entries(groupedSuggestions).map(([supplier, items]) => (
                    <div key={supplier} className="bg-transparent mb-8 print:mb-12 print:break-inside-avoid print:bg-white print:text-black">
                        <div className="p-4 border-b border-gray-200 bg-transparent print:border-b-2 print:border-black">
                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider print:text-black">
                                VENDOR: {supplier}
                            </h3>
                            <p className="text-sm text-gray-600 print:text-black">
                                Total Items to Order: {items.length}
                            </p>
                        </div>
                        
                        <div className="overflow-x-auto bg-white shadow-sm rounded-lg print:bg-white">
                            <table className="min-w-full divide-y divide-border-subtle print:divide-black">
                                <thead className="bg-gray-100 rounded print:bg-white">
                                    <tr>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">Product Name</th>
                                        <th className="px-gap-md py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">Barcode</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">Current Stock</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black">Reorder Lvl</th>
                                        <th className="px-gap-md py-3 text-right text-xs font-bold text-emerald-600 uppercase tracking-wider print:text-black">Suggested Order Qty</th>
                                        <th className="px-gap-md py-3 text-center text-xs font-bold text-gray-600 uppercase tracking-wider print:text-black print:table-cell hidden">Check</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-subtle print:divide-gray-400">
                                    {items.map((item) => (
                                        <tr key={item.product_id} className="hover:bg-gray-50 rounded transition-colors print:hover:bg-transparent print:text-black">
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm font-bold text-gray-900 print:text-black">
                                                {item.product_name}
                                                <div className="text-xs text-gray-500 print:hidden">{item.category}</div>
                                            </td>
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm font-mono text-gray-600 print:text-black">
                                                {item.barcode || '—'}
                                            </td>
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm text-right text-red-600 font-bold print:text-black">
                                                {item.current_stock}
                                            </td>
                                            <td className="px-gap-md py-4 whitespace-nowrap text-sm text-right text-gray-600 print:text-black">
                                                {item.reorder_level}
                                            </td>
                                            <td className="px-gap-md py-4 whitespace-nowrap text-right font-bold text-emerald-600 text-lg print:text-black">
                                                {item.suggested_qty}
                                            </td>
                                            <td className="px-gap-md py-4 whitespace-nowrap text-center hidden print:table-cell">
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

