import { NextResponse } from 'next/server';
import { COUNTRY_OPTIONS } from '@/lib/prisma/country-constants';

export async function GET() {
  return NextResponse.json({ countries: COUNTRY_OPTIONS });
}
