import { NextRequest, NextResponse } from 'next/server';
import { getLeadRepository } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Search ID is required' }, { status: 400 });
    }

    const repo = getLeadRepository();
    const result = await repo.getSearchById(id);

    if (!result) {
      return NextResponse.json({ error: 'Search record not found' }, { status: 404 });
    }

    return NextResponse.json({
      searchId: result.search.id,
      query: result.search.query,
      niche: result.search.niche,
      city: result.search.city,
      country: result.search.country,
      leadsRequested: result.search.leads_requested,
      leadsFound: result.businesses.length,
      businesses: result.businesses,
      source: 'database_cache',
      message: `Loaded ${result.businesses.length} stored leads from database cache.`,
      created_at: result.search.created_at,
    });
  } catch (error: any) {
    console.error('Failed to get search by id:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve search details' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Search ID is required' }, { status: 400 });
    }

    const repo = getLeadRepository();
    const success = await repo.deleteSearch(id);

    if (!success) {
      return NextResponse.json({ error: 'Search record not found or could not be deleted' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Search record deleted successfully from history',
      deletedId: id,
    });
  } catch (error: any) {
    console.error('Failed to delete search by id:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete search from history' },
      { status: 500 }
    );
  }
}

