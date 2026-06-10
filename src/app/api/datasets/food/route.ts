import { NextRequest, NextResponse } from 'next/server';
import { fetchFoodProduct } from '@/lib/services/openfoodfacts';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('barcode');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode parameter is required' }, { status: 400 });
  }

  try {
    const product = await fetchFoodProduct(barcode);
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch product' }, { status: 500 });
  }
}
