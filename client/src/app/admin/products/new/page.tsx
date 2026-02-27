import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { createProduct } from '@/features/admin/actions/product.actions';
import { requireAdmin } from '@/lib/admin-auth';

export default async function NewProductPage(): Promise<React.ReactElement> {
  await requireAdmin();
  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-8">Add New Product</h1>
        <ProductForm action={createProduct} />
      </div>
    </>
  );
}
