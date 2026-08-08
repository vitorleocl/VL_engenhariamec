/**
 * Types and Interfaces for Modular Laudo Templates and Variable Replacement
 */

export interface TemplateVariable {
  key: string;            // e.g. "nome_cliente"
  label: string;          // e.g. "Nome do Cliente / Razão Social"
  value: string;          // current value
  category: 'cliente' | 'vistoria' | 'veiculo_objeto' | 'engenheiro' | 'processo';
  placeholder?: string;
  type?: 'text' | 'date' | 'select' | 'textarea';
  options?: string[];
}

export type SectionContentType = 
  | 'text' 
  | 'capa'
  | 'carta_apresentacao'
  | 'sumario'
  | 'vehicle_specs' 
  | 'photos' 
  | 'damage_table' 
  | 'checklist' 
  | 'art_attachment'
  | 'signature' 
  | 'custom';

export interface PhotoItem {
  id: string;
  url: string; // Data URL or Image URL
  caption: string;
}

export interface ArtAttachment {
  fileName?: string;
  fileSize?: string;
  pdfDataUrl?: string; // Data URL of uploaded ART PDF for merging
  uploadedAt?: string;
}

export interface DigitalSignature {
  status: 'pendente' | 'assinado';
  responsibleName: string;
  creaCau: string;
  artNumber: string;
  signatureDate?: string;
  signatureImage?: string; // Data URL or drawn signature
  verificationHash?: string; // e.g. "VL-SIGN-2026-9A8B"
}

export interface TemplateSection {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
  contentType: SectionContentType;
  htmlContent: string;
  photos?: PhotoItem[];
  artData?: ArtAttachment;
  signatureData?: DigitalSignature;
  isMandatory?: boolean;
  notes?: string;
}

export interface LaudoTemplate {
  id: string;
  title: string;
  category: string; // 'sinistro' | 'estrutural' | 'vistoria' | 'eletrico' | 'incendio' | 'nr12' | 'nr13' | 'pmoc' | 'guindaste' | 'playground' | 'pcm';
  description: string;
  iconName?: string;
  version: number;
  sections: TemplateSection[];
  variables: Record<string, string>; // key -> value map
  createdAt?: string;
  updatedAt?: string;
  isCustom?: boolean;
}

export interface TemplateVersionHistory {
  id: string;
  templateId: string;
  version: number;
  savedAt: string;
  savedBy: string;
  description: string;
  templateData: LaudoTemplate;
}
