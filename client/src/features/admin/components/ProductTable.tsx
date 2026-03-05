'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toggleProductActive, batchDeleteProducts, batchToggleActive } from '@/features/admin/actions/product.actions';
import { DeleteProductButton } from './DeleteProductButton';
import { InfoTooltip } from './InfoTooltip';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import type { Product, ProductCategory } from '@/types/product.types';

interface ProductTableProps {
  products: Product[];
}

export function ProductTable({ products }: ProductTableProps): React.ReactElement {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchPending, setBatchPending] = useState(false);

  const filtered = products.filter((p) => {
    if (category !== 'all' && !p.categories.includes(category as ProductCategory)) return false;
    if (statusFilter === 'active' && !p.isActive) return false;
    if (statusFilter === 'hidden' && p.isActive) return false;
    if (search) {
      const q = search.toLowerCase();
      const match = p.name.ka.toLowerCase().includes(q) || p.name.ru.toLowerCase().includes(q) || p.name.en.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const allFilteredIds = filtered.map((p) => p.id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selected.has(id));
  const someSelected = allFilteredIds.some((id) => selected.has(id));
  const selectedCount = allFilteredIds.filter((id) => selected.has(id)).length;

  const toggleAll = useCallback(() => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allFilteredIds.forEach((id) => next.delete(id));
      } else {
        allFilteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [allSelected, allFilteredIds]);

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  async function handleBatchDelete(): Promise<void> {
    const ids = allFilteredIds.filter((id) => selected.has(id));
    if (!confirm(`წაიშალოს ${ids.length} პროდუქტი? ეს მოქმედება შეუქცევადია.`)) return;
    setBatchPending(true);
    await batchDeleteProducts(ids);
    setSelected(new Set());
    setBatchPending(false);
  }

  async function handleBatchActivate(isActive: boolean): Promise<void> {
    const ids = allFilteredIds.filter((id) => selected.has(id));
    setBatchPending(true);
    await batchToggleActive(ids, isActive);
    setSelected(new Set());
    setBatchPending(false);
  }

  return (
    <>
      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="სახელით ძებნა..."
          className="w-full sm:w-64"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ყველა კატეგორია</SelectItem>
            <SelectItem value="cameras">კამერები</SelectItem>
            <SelectItem value="nvr-kits">NVR კომპლექტები</SelectItem>
            <SelectItem value="accessories">აქსესუარები</SelectItem>
            <SelectItem value="storage">მეხსიერება</SelectItem>
            <SelectItem value="services">სერვისები</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as 'all' | 'active' | 'hidden')}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">ყველა სტატუსი</SelectItem>
            <SelectItem value="active">აქტიური</SelectItem>
            <SelectItem value="hidden">დამალული</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} შედეგი</span>
      </div>

      {/* Batch action toolbar */}
      {selectedCount > 0 && (
        <div className="flex items-center gap-3 mb-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium text-primary">{selectedCount} არჩეული</span>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={batchPending}
              onClick={() => handleBatchActivate(true)}
              className="text-xs h-7"
            >
              გააქტიურება
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={batchPending}
              onClick={() => handleBatchActivate(false)}
              className="text-xs h-7"
            >
              დამალვა
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={batchPending}
              onClick={handleBatchDelete}
              className="text-xs h-7"
            >
              წაშლა
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={batchPending}
              onClick={() => setSelected(new Set())}
              className="text-xs h-7 text-muted-foreground"
            >
              გაუქმება
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground text-sm">ფილტრებს პროდუქტები არ შეესაბამება.</div>
      ) : (
        <div className="rounded-xl border border-border overflow-x-auto bg-card">
          <Table className="min-w-160">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-10 px-3">
                  <Checkbox
                    checked={allSelected}
                    data-state={someSelected && !allSelected ? 'indeterminate' : undefined}
                    onCheckedChange={toggleAll}
                    aria-label="ყველას არჩევა"
                  />
                </TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">სურათი <InfoTooltip text="პროდუქტის მთავარი სურათი" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">სახელი <InfoTooltip text="პროდუქტის სახელი (ქართულად)" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">კატეგორია <InfoTooltip text="პროდუქტის კატეგორია კატალოგში" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">ფასი <InfoTooltip text="ფასი ლარებში. '—' ნიშნავს ფასი არ არის მითითებული" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">სტატუსი <InfoTooltip text="აქტიური = ხილულია საიტზე, დამალული = დამალულია" /></TableHead>
                <TableHead className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => (
                <TableRow key={product.id} className={selected.has(product.id) ? 'bg-primary/5' : ''}>
                  <TableCell className="w-10 px-3 py-2">
                    <Checkbox
                      checked={selected.has(product.id)}
                      onCheckedChange={() => toggleOne(product.id)}
                      aria-label={`${product.name.ka}-ის არჩევა`}
                    />
                  </TableCell>
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
                    <a href={`/ka/catalog/${product.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-foreground font-medium hover:text-primary hover:underline transition-colors">
                      {product.name.ka}
                    </a>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {product.categories.map((cat) => (
                        <span key={cat} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{cat}</span>
                      ))}
                    </div>
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
                        {product.isActive ? 'აქტიური' : 'დამალული'}
                      </Button>
                    </form>
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <a href={`/ka/catalog/${product.slug}`} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition-colors" aria-label="პროდუქტის გვერდის ნახვა">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                      <Link href={`/admin/products/${product.id}/edit`} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" aria-label="პროდუქტის რედაქტირება">
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
