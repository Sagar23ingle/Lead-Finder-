import { NextRequest, NextResponse } from 'next/server';
import { getDemoRepository, generateDemoSlug } from '@/lib/db/demos';
import { getLeadRepository } from '@/lib/db';
import { GooglePlacesService } from '@/lib/services/googlePlaces';
import { generateSmartDemo } from '@/lib/services/smartDemoEngine';
import { Business } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, business: rawBusiness } = body;

    let targetBusiness: Business | null = rawBusiness || null;

    if (!targetBusiness && businessId) {
      const repo = getLeadRepository();
      targetBusiness = await repo.getBusinessById(businessId);

      if (!targetBusiness && businessId.includes('ChIJ')) {
        const placeMatch = businessId.match(/(ChIJ[a-zA-Z0-9_-]+)/);
        if (placeMatch) {
          targetBusiness = await GooglePlacesService.getPlaceById(placeMatch[1]);
        }
      }
    }

    if (!targetBusiness) {
      return NextResponse.json(
        { error: 'Business not found to generate demo.' },
        { status: 404 }
      );
    }

    const demo = generateSmartDemo(targetBusiness);
    const id = targetBusiness.id || targetBusiness.external_id || 'demo';
    const slug = generateDemoSlug(targetBusiness.name, id);

    const demoRepo = getDemoRepository();
    const record = await demoRepo.saveDemo({
      id,
      slug,
      leadId: id,
      businessName: targetBusiness.name,
      businessType: demo.businessType,
      business: targetBusiness,
      demo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const publicUrl = `${protocol}://${host}/demo/${slug}`;

    return NextResponse.json({
      success: true,
      demoId: record.id,
      slug: record.slug,
      publicUrl,
      demo,
    });
  } catch (error: any) {
    console.error('Error generating demo:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate demo.' },
      { status: 500 }
    );
  }
}
