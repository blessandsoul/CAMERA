import { notFound } from 'next/navigation';
import { AdminHeader } from '@/features/admin/components/AdminHeader';
import { ProductForm } from '@/features/admin/components/ProductForm';
import { getProductById } from '@/lib/content';
import { updateProduct } from '@/features/admin/actions/product.actions';
import { requireAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps): Promise<React.ReactElement> {
  await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) notFound();

  const updateProductWithId = updateProduct.bind(null, id);

  return (
    <>
      <AdminHeader />
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <h1 className="text-xl font-semibold text-foreground mb-8">Edit: {product.name.ka}</h1>
        <ProductForm product={product} action={updateProductWithId} />
      </div>
    </>
  );
}
