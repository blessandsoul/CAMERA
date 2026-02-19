import { notFound } from 'next/navigation';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { getProductById } from '@/lib/content';
import { updateProduct } from '@/features/admin/actions/product.actions';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps): Promise<React.ReactElement> {
  const { id } = await params;
  const product = getProductById(id);

  if (!product) notFound();

  const updateProductWithId = updateProduct.bind(null, id);

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-gray-900 mb-8">Edit: {product.name.ka}</h1>
        <ProductForm product={product} action={updateProductWithId} />
      </div>
    </>
  );
}
