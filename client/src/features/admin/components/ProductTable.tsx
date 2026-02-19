'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toggleProductActive } from '@/features/admin/actions/product.actions';
import { DeleteProductButton } from './DeleteProductButton';
import type { Product } from '@/types/product.types';

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps): React.ReactElement {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');

  const filtered = products.filter((p) => {
    if (category !== 'all' && p.category !== category) return false;
    if (statusFilter === 'active' && !p.isActive) return false;
    if (statusFilter === 'hidden' && p.isActive) return false;
    if (search) {
      const q = search.toLowerCase();
      const match = p.name.ka.toLowerCase().includes(q) || p.name.ru.toLowerCase().includes(q) || p.name.en.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const categories = ['all', 'cameras', 'nvr-kits', 'accessories', 'storage', 'services'];
  const selectClass = 'px-2 py-1.5 rounded-md border border-gray-200 text-sm text-gray-700 focus:outline-none focus:border-gray-400';

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="px-3 py-1.5 rounded-md border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors w-full sm:w-64"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={selectClass}>
          {categories.map((c) => (
            <option key={c} value={c}>{c === 'all' ? 'All categories' : c}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'hidden')} className={selectClass}>
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-sm">No products match your filters.</div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-x-auto bg-white">
          <table className="w-full min-w-160">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Image</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Category</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-3 py-2 text-left text-[10px] font-medium text-gray-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {product.images[0] ? (
                        <Image src={`/images/products/${product.images[0]}`} alt={product.name.ka} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5 text-gray-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm text-gray-900 font-medium">{product.name.ka}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{product.category}</span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="text-sm text-gray-900 tabular-nums">{product.price > 0 ? `${product.price} ₾` : '—'}</span>
                  </td>
                  <td className="px-3 py-2">
                    <form action={toggleProductActive.bind(null, product.id, !product.isActive)}>
                      <button
                        type="submit"
                        className={`text-xs px-2 py-1 rounded-full transition-colors cursor-pointer ${
                          product.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Hidden'}
                      </button>
                    </form>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors" aria-label="Edit product">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name.ka} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
