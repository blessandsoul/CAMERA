'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toggleProductActive } from '@/features/admin/actions/product.actions';
import { DeleteProductButton } from './DeleteProductButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
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

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="w-full sm:w-64"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="cameras">cameras</SelectItem>
            <SelectItem value="nvr-kits">nvr-kits</SelectItem>
            <SelectItem value="accessories">accessories</SelectItem>
            <SelectItem value="storage">storage</SelectItem>
            <SelectItem value="services">services</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'hidden')}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} results</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">No products match your filters.</div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <Table className="min-w-160">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Image</TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Name</TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Category</TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Price</TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="px-3 py-2">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      {product.images[0] ? (
                        <Image src={`/images/products/${product.images[0]}`} alt={product.name.ka} width={40} height={40} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-5 h-5 text-muted-foreground/50">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-sm text-foreground font-medium">{product.name.ka}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{product.category}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <span className="text-sm text-foreground tabular-nums">{product.price > 0 ? `${product.price} ₾` : '—'}</span>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <form action={toggleProductActive.bind(null, product.id, !product.isActive)}>
                      <Button
                        type="submit"
                        variant="ghost"
                        size="xs"
                        className={`rounded-full ${
                          product.isActive ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Hidden'}
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="Edit product">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                      <DeleteProductButton productId={product.id} productName={product.name.ka} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
