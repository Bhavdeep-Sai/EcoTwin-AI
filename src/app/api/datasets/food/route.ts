import { NextRequest, NextResponse } from 'next/server';
import { fetchFoodProduct } from '@/lib/services/openfoodfacts';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const barcode = searchParams.get('barcode');

  if (!barcode) {
    return NextResponse.json({ error: 'Barcode parameter is required' }, { status: 400 });
  }

  try {
    const product = await fetchFoodProduct(barcode);
    return NextResponse.json(product);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch product';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
