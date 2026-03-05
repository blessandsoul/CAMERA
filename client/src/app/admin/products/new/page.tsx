import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { getAllProductsAdmin } from '@/lib/content';
import { createProduct } from '@/features/admin/actions/product.actions';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function NewProductPage(): Promise<React.ReactElement> {
  await requireAdmin();
  const allProducts = await getAllProductsAdmin();

  return (
    <>
      <AdminHeader />
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-8">ახალი პროდუქტის დამატება</h1>
        <ProductForm allProducts={allProducts} action={createProduct} />
      </div>
    </>
  );
}
