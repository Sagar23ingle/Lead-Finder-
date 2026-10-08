import { Business, LeadAnalysis, LeadCrmRecord } from '@/types';
import { normalizeWhatsAppNumber } from './phone';

/**
 * Escapes a cell value for RFC 4180 CSV compliance
 */
function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // If string contains quotes, commas, or newlines, quote it and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Formats phone number so Excel does not treat it as a formula (+ sign) or drop leading zeros
 */
function formatPhoneForExcel(phone: string | null | undefined): string {
  if (!phone) return '""';
  const clean = phone.trim();
  // Using ="phone" format prevents Excel from stripping leading 0 or treating + as formula
  return `="""${clean.replace(/"/g, '""')}"""`;
}

/**
 * Generates an RFC 4180 compliant CSV string with UTF-8 BOM for Microsoft Excel
 */
export function generateLeadsCsv(
  businesses: Business[],
  analyses: Record<string, LeadAnalysis> = {},
  crmRecords: Record<string, LeadCrmRecord> = {}
): string {
  const headers = [
    'Business Name',
    'Category / Niche',
    'Phone Number',
    'WhatsApp Direct Link',
    'Address',
    'City',
    'Country',
    'Website',
    'Rating',
    'Reviews Count',
    'Opening Status',
    'Google Maps URL',
    'AI Opportunity Level',
    'Urgency Score',
    'Primary Opportunity Angle',
    'Identified Pain Points',
    'Recommended Pitch Hook',
    'Estimated Deal Value',
    'Assigned Demo Link',
    'Pipeline Stage',
  ];

  const rows = businesses.map((b) => {
    const analysis = analyses[b.id] || analyses[b.external_id];
    const crm = crmRecords[b.id] || crmRecords[b.external_id];

    const waNum = normalizeWhatsAppNumber(b.phone, b.country || undefined);
    const waLink = waNum ? `https://wa.me/${waNum}` : '';

    const oppLevel = analysis?.tier || (b.website ? 'PENDING' : 'HOT');
    const urgency = analysis?.score !== undefined ? `${analysis.score}/100` : 'N/A';
    const angle = analysis?.report?.bestOutreachAngle || (b.website ? 'Website Redesign / SEO' : 'New Website / Digital Presence');
    const painPoints = analysis?.report?.mainProblem || analysis?.audit?.issues?.join('; ') || (b.website ? '' : 'No active online presence');
    const pitchHook = analysis?.report?.suggestedOffer || analysis?.salesGuidance?.pitchPackage || '';
    const dealValue = analysis?.report?.suggestedPriceRange || analysis?.salesGuidance?.pricingStrategy || (b.website ? '$1,000 - $2,500' : '$1,500 - $3,500');

    const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const demoLink = appOrigin ? `${appOrigin}/demo/${b.id}` : `/demo/${b.id}`;
    const stage = crm?.stage || 'discovered';

    return [
      escapeCsvCell(b.name),
      escapeCsvCell(b.category),
      formatPhoneForExcel(b.phone),
      escapeCsvCell(waLink),
      escapeCsvCell(b.address),
      escapeCsvCell(b.city),
      escapeCsvCell(b.country),
      escapeCsvCell(b.website || 'No Website'),
      escapeCsvCell(b.rating !== null ? b.rating : 'N/A'),
      escapeCsvCell(b.review_count !== null ? b.review_count : 0),
      escapeCsvCell(b.opening_status || 'Unknown'),
      escapeCsvCell(b.google_maps_url || ''),
      escapeCsvCell(oppLevel),
      escapeCsvCell(urgency),
      escapeCsvCell(angle),
      escapeCsvCell(painPoints),
      escapeCsvCell(pitchHook),
      escapeCsvCell(dealValue),
      escapeCsvCell(demoLink),
      escapeCsvCell(stage.toUpperCase()),
    ].join(',');
  });

  // \uFEFF is UTF-8 Byte Order Mark for Excel
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers instant browser download of leads as Excel-compatible CSV
 */
export function downloadLeadsForExcel(
  businesses: Business[],
  analyses: Record<string, LeadAnalysis> = {},
  crmRecords: Record<string, LeadCrmRecord> = {},
  filenamePrefix = 'leads-export'
): void {
  if (typeof window === 'undefined' || businesses.length === 0) return;

  const csvContent = generateLeadsCsv(businesses, analyses, crmRecords);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}-${timestamp}.csv`;

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates Tab-Separated Values (TSV) for seamless Ctrl+V pasting into Google Sheets
 */
export function generateLeadsTsv(
  businesses: Business[],
  analyses: Record<string, LeadAnalysis> = {},
  crmRecords: Record<string, LeadCrmRecord> = {}
): string {
  const sanitize = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '';
    return String(val).replace(/[\t\r\n]+/g, ' ').trim();
  };

  const headers = [
    'Business Name',
    'Category',
    'Phone Number',
    'WhatsApp Direct Link',
    'Address',
    'City',
    'Country',
    'Website',
    'Rating',
    'Reviews',
    'Status',
    'Google Maps URL',
    'Opportunity Level',
    'Urgency Score',
    'Pitch Angle',
    'Pain Points',
    'Pitch Hook',
    'Deal Value',
    'Demo Link',
    'Pipeline Stage',
  ];

  const rows = businesses.map((b) => {
    const analysis = analyses[b.id] || analyses[b.external_id];
    const crm = crmRecords[b.id] || crmRecords[b.external_id];

    const waNum = normalizeWhatsAppNumber(b.phone, b.country || undefined);
    const waLink = waNum ? `https://wa.me/${waNum}` : '';

    const oppLevel = analysis?.tier || (b.website ? 'PENDING' : 'HOT');
    const urgency = analysis?.score !== undefined ? `${analysis.score}/100` : 'N/A';
    const angle = analysis?.report?.bestOutreachAngle || (b.website ? 'Website Redesign' : 'New Website');
    const painPoints = analysis?.report?.mainProblem || analysis?.audit?.issues?.join('; ') || (b.website ? '' : 'No active online presence');
    const pitchHook = analysis?.report?.suggestedOffer || analysis?.salesGuidance?.pitchPackage || '';
    const dealValue = analysis?.report?.suggestedPriceRange || analysis?.salesGuidance?.pricingStrategy || (b.website ? '$1,000 - $2,500' : '$1,500 - $3,500');

    const appOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    const demoLink = appOrigin ? `${appOrigin}/demo/${b.id}` : `/demo/${b.id}`;
    const stage = crm?.stage || 'discovered';

    return [
      sanitize(b.name),
      sanitize(b.category),
      sanitize(b.phone),
      sanitize(waLink),
      sanitize(b.address),
      sanitize(b.city),
      sanitize(b.country),
      sanitize(b.website || 'No Website'),
      sanitize(b.rating !== null ? b.rating : 'N/A'),
      sanitize(b.review_count !== null ? b.review_count : 0),
      sanitize(b.opening_status || 'Unknown'),
      sanitize(b.google_maps_url || ''),
      sanitize(oppLevel),
      sanitize(urgency),
      sanitize(angle),
      sanitize(painPoints),
      sanitize(pitchHook),
      sanitize(dealValue),
      sanitize(demoLink),
      sanitize(stage.toUpperCase()),
    ].join('\t');
  });

  return [headers.join('\t'), ...rows].join('\n');
}

/**
 * Copies formatted leads to clipboard as TSV and opens a fresh Google Sheet tab
 */
export async function copyForGoogleSheets(
  businesses: Business[],
  analyses: Record<string, LeadAnalysis> = {},
  crmRecords: Record<string, LeadCrmRecord> = {}
): Promise<{ success: boolean; count: number; error?: string }> {
  if (typeof window === 'undefined' || businesses.length === 0) {
    return { success: false, count: 0, error: 'No leads available to copy' };
  }

  try {
    const tsvData = generateLeadsTsv(businesses, analyses, crmRecords);
    await navigator.clipboard.writeText(tsvData);
    return { success: true, count: businesses.length };
  } catch (err: any) {
    console.error('Failed to copy to clipboard for Google Sheets:', err);
    return { success: false, count: 0, error: err?.message || 'Clipboard access denied' };
  }
}
