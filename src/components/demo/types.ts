import { Business, LeadAnalysis } from '@/types';

export interface PortfolioItem {
  title: string;
  category: string;
  image: string;
  description: string;
}

export interface ServiceItem {
  title: string;
  desc: string;
  img: string;
}

export interface DemoTemplateProps {
  business: Business;
  analysis: LeadAnalysis | null;
  name: string;
  niche: string;
  city: string;
  rating: number;
  reviewCount: number;
  normalizedPhone: string | null;
  displayPhone: string;
  heroImage: string;
  heroCaption: string;
  portfolio: PortfolioItem[];
  services: ServiceItem[];
  getClientConsultationWhatsAppUrl: (customMsg?: string) => string | null;
  onOpenPhoneModal: () => void;
  inquiryName: string;
  setInquiryName: (v: string) => void;
  inquiryPhone: string;
  setInquiryPhone: (v: string) => void;
  inquiryNotes: string;
  setInquiryNotes: (v: string) => void;
  inquirySent: boolean;
  setInquirySent: (v: boolean) => void;
}
