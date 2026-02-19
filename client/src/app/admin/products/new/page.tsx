import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { createProduct } from '@/features/admin/actions/product.actions';

export default function NewProductPage(): React.ReactElement {
  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-8">Add New Product</h1>
        <ProductForm action={createProduct} />
      </div>
    </>
  );
}
