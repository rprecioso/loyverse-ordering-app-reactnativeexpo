import { loyverseAPI } from '@/lib/api/loyverse';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const categoryId = url.searchParams.get('category_id');

  if (!categoryId) {
    return Response.json({ error: 'Missing category_id parameter' }, { status: 400 });
  }

  try {
    const products = await loyverseAPI.getProductsByCategory(categoryId);
    return Response.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}