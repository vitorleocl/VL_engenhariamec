import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  FileText, 
  CheckSquare, 
  Square, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Save, 
  Copy, 
  Printer, 
  FileDown, 
  Sparkles, 
  Layers, 
  UserCheck, 
  Search, 
  RotateCcw, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  X,
  CheckCircle2,
  BookOpen,
  Upload,
  FileCheck,
  PenTool,
  Image as ImageIcon,
  ShieldCheck,
  FileCode,
  FileSpreadsheet,
  Maximize2,
  Minimize2,
  Settings,
  Sliders,
  Loader2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table,
  Palette,
  Heading1,
  Heading2,
  Heading3,
  PaintBucket,
  Undo,
  Redo,
  RemoveFormatting,
  Type,
  Strikethrough
} from 'lucide-react';
import HeaderMaster, { HeaderMasterConfig } from './HeaderMaster';
import { ClientData, EquipmentData } from '../../types';
import { LaudoTemplate, TemplateSection, PhotoItem, ArtAttachment, DigitalSignature } from '../../types/laudoTemplate';
import { getAllTemplates, saveCustomTemplate, deleteCustomTemplate, replaceVariables } from '../../lib/templateBank';
import { exportToWord, mergeReportAndArtPdf, preprocessStylesheets, restoreStylesheets } from '../../lib/pdfUtils';
import { saveGeneratorLaudo } from '../../lib/generatorStorage';
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface LaudoTemplateEditorProps {
  clients?: ClientData[];
  equipments?: EquipmentData[];
  initialTemplateId?: string;
  initialSavedData?: any;
  onBack?: () => void;
}

export default function LaudoTemplateEditor({
  clients = [],
  equipments = [],
  initialTemplateId = 'tpl_sinistro_veicular',
  initialSavedData,
  onBack
}: LaudoTemplateEditorProps) {
  const [allTemplates, setAllTemplates] = useState<LaudoTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LaudoTemplate | null>(null);
  
  // Client / Equipment Selection for Auto-fill
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');

  // Local Editable State
  const [sections, setSections] = useState<TemplateSection[]>([]);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [activeSectionId, setActiveSectionId] = useState<string>('');

  // UI Tabs & Views
  const [activeTab, setActiveTab] = useState<'editor' | 'variables' | 'preview'>('editor');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  
  // Saving, History, PDF & Unsaved Changes Tracking
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentSavedId, setCurrentSavedId] = useState<string | undefined>(initialSavedData?.id);
  const [showSaveModelModal, setShowSaveModelModal] = useState(false);
  const [newModelTitle, setNewModelTitle] = useState('');

  // Custom Table & Rich Text Formatting Modal States
  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(4);
  const [tableHeaderBg, setTableHeaderBg] = useState('#1e293b');
  const [tableHeaderTextColor, setTableHeaderTextColor] = useState('#ffffff');
  const [showColorPickerMenu, setShowColorPickerMenu] = useState<'text' | 'bg' | 'tableHeader' | null>(null);
  const [showImageUrlModal, setShowImageUrlModal] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Header Master & Fullscreen State
  const [headerMasterConfig, setHeaderMasterConfig] = useState<HeaderMasterConfig>({
    logoUrl: '/logo.png',
    logoHeight: 68,
    logoPosition: 'left',
    showSlogan: true,
    headerTitle: 'VL ENGENHARIA MECÂNICA & PERÍCIAS'
  });
  const [showHeaderSettingsModal, setShowHeaderSettingsModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
      document.body.classList.add('editor-fullscreen-active');
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
      document.body.classList.remove('editor-fullscreen-active');
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      document.body.classList.toggle('editor-fullscreen-active', active);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
        document.body.classList.remove('editor-fullscreen-active');
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('editor-fullscreen-active');
    };
  }, [isFullscreen]);

  // Unsaved changes & saving lock beforeunload protection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving || hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'Existem alterações não salvas no laudo. Deseja realmente sair?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaving, hasUnsavedChanges]);

  // Standardized Cover Photo Handler
  const handleCoverPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setVariables(prev => ({
        ...prev,
        foto_capa_url: dataUrl,
        cover_image_url: dataUrl
      }));
      showToast('Foto da capa atualizada com sucesso!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Digital Signature Canvas
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  // Ref for print container
  const printRef = useRef<HTMLDivElement>(null);

  // Ref and View Mode for Rich Text Editor
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorViewMode, setEditorViewMode] = useState<'visual' | 'code'>('visual');

  // Sync editor innerHTML when active section or view mode changes without dropping user cursor during active typing
  useEffect(() => {
    const currentSec = sections.find(s => s.id === activeSectionId) || sections[0];
    if (editorRef.current && currentSec) {
      const isFocused = document.activeElement === editorRef.current;
      if (!isFocused && editorRef.current.innerHTML !== currentSec.htmlContent) {
        editorRef.current.innerHTML = currentSec.htmlContent || '';
      }
    }
  }, [sections, activeSectionId, editorViewMode]);

  // Load templates on boot
  useEffect(() => {
    const list = getAllTemplates();
    setAllTemplates(list);

    if (initialSavedData && initialSavedData.sections && initialSavedData.variables) {
      setSections(JSON.parse(JSON.stringify(initialSavedData.sections)));
      setVariables({ ...initialSavedData.variables });
      if (initialSavedData.id) {
        setCurrentSavedId(initialSavedData.id);
      }
      const found = list.find(t => t.id === (initialSavedData.templateId || initialTemplateId)) || list[0];
      if (found) setSelectedTemplate(found);
      if (initialSavedData.sections.length > 0) {
        setActiveSectionId(initialSavedData.sections[0].id);
      }
    } else {
      const found = list.find(t => t.id === initialTemplateId) || list[0];
      if (found) {
        loadTemplate(found);
      }
    }
  }, [initialTemplateId, initialSavedData]);

  const loadTemplate = (tpl: LaudoTemplate) => {
    setSelectedTemplate(tpl);
    // Deep clone sections
    setSections(JSON.parse(JSON.stringify(tpl.sections)));
    setVariables({ ...tpl.variables });
    if (tpl.sections.length > 0) {
      setActiveSectionId(tpl.sections[0].id);
    }
  };

  // Auto-fill variables from selected client & link pre-registered assets
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setVariables(prev => ({
        ...prev,
        nome_cliente: client.company || client.name,
        cpf_cnpj_cliente: client.cnpj_cpf || '',
        endereco_cliente: client.address || '',
        telefone_cliente: client.phone || '',
        email_cliente: client.email || ''
      }));

      // Find equipment pre-registered for this client
      const clientEquipments = equipments.filter(e => e.clientId === clientId);
      if (clientEquipments.length > 0) {
        // Auto select the first equipment belonging to this client if current equipment is not for this client
        const currentEqBelongsToClient = clientEquipments.some(e => e.id === selectedEquipmentId);
        if (!currentEqBelongsToClient) {
          handleEquipmentChange(clientEquipments[0].id);
          showToast(`Cliente "${client.company || client.name}" vinculado! Ativo "${clientEquipments[0].type} (${clientEquipments[0].brand} ${clientEquipments[0].model})" selecionado automaticamente.`);
        } else {
          showToast(`Cliente "${client.company || client.name}" vinculado! (${clientEquipments.length} ativo(s) cadastrado(s)).`);
        }
      } else {
        showToast(`Dados do cliente "${client.company || client.name}" preenchidos automaticamente!`);
      }
    } else {
      setSelectedEquipmentId('');
    }
  };

  // Auto-fill variables from selected equipment/asset
  const handleEquipmentChange = (equipId: string) => {
    setSelectedEquipmentId(equipId);
    const eq = equipments.find(e => e.id === equipId);
    if (eq) {
      // If equipment belongs to a client and no client is selected or different client is selected, select client too
      if (eq.clientId && eq.clientId !== selectedClientId) {
        setSelectedClientId(eq.clientId);
        const matchedClient = clients.find(c => c.id === eq.clientId);
        if (matchedClient) {
          setVariables(prev => ({
            ...prev,
            nome_cliente: matchedClient.company || matchedClient.name,
            cpf_cnpj_cliente: matchedClient.cnpj_cpf || '',
            endereco_cliente: matchedClient.address || '',
            telefone_cliente: matchedClient.phone || '',
            email_cliente: matchedClient.email || ''
          }));
        }
      }

      setVariables(prev => ({
        ...prev,
        marca_veiculo: eq.brand || prev.marca_veiculo || '',
        modelo_veiculo: eq.model || prev.modelo_veiculo || '',
        placa_veiculo: eq.serialNumber || prev.placa_veiculo || '',
        renavam: eq.serialNumber || prev.renavam || '',
        objeto_inspecao: `${eq.type} ${eq.brand} ${eq.model}${eq.idTag ? ` (TAG: ${eq.idTag})` : eq.serialNumber ? ` (Série: ${eq.serialNumber})` : ''}`,
        tag_equipamento: eq.idTag || eq.serialNumber || '',
        id_tag_equipamento: eq.idTag || '',
        tipo_equipamento: eq.type || '',
        ano_fabricacao: eq.year || '',
        potencia_instalada: eq.potenciaInstalada || '',
        descricao_equipamento: eq.description || '',
        numero_serie: eq.serialNumber || ''
      }));
      showToast(`Ativo "${eq.type} - ${eq.brand} ${eq.model}" vinculado com sucesso!`);
    }
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // Section Toggle (Enable/Disable)
  const toggleSectionEnabled = (sectionId: string) => {
    setSections(prev => prev.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s));
  };

  // Section Reordering
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    
    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    
    // Update order props
    const reordered = updated.map((sec, idx) => ({ ...sec, order: idx + 1 }));
    setSections(reordered);
  };

  // Add Custom Section
  const handleAddSection = () => {
    const newId = 'sec_custom_' + Date.now();
    const newSection: TemplateSection = {
      id: newId,
      title: 'NOVA SEÇÃO PERSONALIZADA',
      enabled: true,
      order: sections.length + 1,
      contentType: 'text',
      htmlContent: `<p>Insira aqui o texto técnico da nova seção...</p>`
    };
    setSections(prev => [...prev, newSection]);
    setActiveSectionId(newId);
    showToast('Nova seção adicionada com sucesso!');
  };

  // Delete Section
  const handleDeleteSection = (secId: string) => {
    if (sections.length <= 1) {
      alert('O laudo precisa ter pelo menos uma seção.');
      return;
    }
    setSections(prev => prev.filter(s => s.id !== secId));
    if (activeSectionId === secId) {
      const remaining = sections.filter(s => s.id !== secId);
      if (remaining.length > 0) setActiveSectionId(remaining[0].id);
    }
  };

  // Rich Text Editor Commands
  const applyFormatting = (command: string, value: string | undefined = undefined) => {
    const editorEl = editorRef.current || document.getElementById('editor_content_editable');
    if (editorEl) {
      editorEl.focus();
    }
    document.execCommand(command, false, value);
    if (editorEl) {
      updateActiveSectionContent(editorEl.innerHTML);
    }
  };

  // Insert Custom Table Helper
  const handleInsertCustomTable = (r: number, c: number, headerBgColor: string, textColor: string) => {
    const editorEl = editorRef.current || document.getElementById('editor_content_editable');
    if (editorEl) {
      editorEl.focus();
    }
    let ths = '';
    for (let j = 1; j <= c; j++) {
      ths += `<th style="padding: 8px 10px; border: 1px solid #334155; font-weight: bold; background-color: ${headerBgColor}; color: ${textColor};">Coluna ${j}</th>`;
    }
    let rowsHtml = '';
    for (let i = 1; i <= r; i++) {
      let tds = '';
      const bg = i % 2 === 0 ? '#f8fafc' : '#ffffff';
      for (let j = 1; j <= c; j++) {
        tds += `<td style="padding: 8px 10px; border: 1px solid #cbd5e1;">Dado ${i}.${j}</td>`;
      }
      rowsHtml += `<tr style="background-color: ${bg};">${tds}</tr>`;
    }

    const tableHtml = `
      <div style="margin: 14px 0; overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; background-color: #ffffff; color: #0f172a; border: 1px solid #94a3b8;">
          <thead>
            <tr style="background-color: ${headerBgColor}; color: ${textColor}; text-align: left;">
              ${ths}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
      <p><br/></p>
    `;
    document.execCommand('insertHTML', false, tableHtml);
    if (editorEl) {
      updateActiveSectionContent(editorEl.innerHTML);
    }
    setShowTableModal(false);
    showToast(`Tabela (${r}x${c}) inserida no texto!`);
  };

  // Modify Active Table Header Color
  const applyTableHeaderColor = (bgColor: string, textColor: string = '#ffffff') => {
    const editorEl = editorRef.current || document.getElementById('editor_content_editable');
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) {
      showToast('Clique dentro de uma tabela para alterar a cor do cabeçalho.');
      return;
    }
    let node: Node | null = sel.anchorNode;
    while (node && node.nodeName !== 'TABLE' && (node as HTMLElement).id !== 'editor_content_editable') {
      node = node.parentNode;
    }
    if (node && node.nodeName === 'TABLE') {
      const table = node as HTMLTableElement;
      const thead = table.querySelector('thead');
      if (thead) {
        const theadTr = thead.querySelector('tr') as HTMLElement;
        if (theadTr) {
          theadTr.style.backgroundColor = bgColor;
          theadTr.style.color = textColor;
        }
        const ths = thead.querySelectorAll('th');
        ths.forEach(th => {
          (th as HTMLElement).style.backgroundColor = bgColor;
          (th as HTMLElement).style.color = textColor;
        });
      }
      if (editorEl) {
        updateActiveSectionContent(editorEl.innerHTML);
      }
      showToast('Cor do cabeçalho da tabela atualizada com sucesso!');
    } else {
      showToast('Clique dentro de uma tabela para alterar a cor do cabeçalho.');
    }
  };

  // Insert Image from Web URL
  const handleInsertImageUrl = () => {
    if (!customImageUrl.trim()) return;
    const editorEl = editorRef.current || document.getElementById('editor_content_editable');
    if (editorEl) {
      editorEl.focus();
    }
    const imgHtml = `
      <div style="text-align: center; margin: 15px 0;">
        <img src="${customImageUrl.trim()}" alt="Imagem do Laudo" style="max-width: 100%; max-height: 400px; border-radius: 6px; border: 1px solid #cbd5e1; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
      </div>
    `;
    document.execCommand('insertHTML', false, imgHtml);
    if (editorEl) {
      updateActiveSectionContent(editorEl.innerHTML);
    }
    setShowImageUrlModal(false);
    setCustomImageUrl('');
    showToast('Imagem inserida com sucesso via URL!');
  };

  // Inline Image Insertion Handler
  const handleInlineImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const editorEl = editorRef.current || document.getElementById('editor_content_editable');
    if (editorEl) {
      editorEl.focus();
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const imgHtml = `
        <div style="text-align: center; margin: 15px 0;">
          <img src="${dataUrl}" alt="Imagem do Laudo" style="max-width: 100%; max-height: 400px; border-radius: 6px; border: 1px solid #cbd5e1; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
          <p style="font-size: 10px; color: #64748b; font-style: italic; margin-top: 4px;">Imagem integrante da vistoria do laudo</p>
        </div>
      `;
      document.execCommand('insertHTML', false, imgHtml);
      if (editorEl) {
        updateActiveSectionContent(editorEl.innerHTML);
      }
      showToast('Imagem inserida no texto da seção!');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const insertVariablePlaceholder = (varKey: string) => {
    const editorEl = editorRef.current || document.getElementById('editor_content_editable');
    if (editorEl) {
      editorEl.focus();
    }
    const placeholder = `{{${varKey}}}`;
    document.execCommand('insertText', false, placeholder);
    if (editorEl) {
      updateActiveSectionContent(editorEl.innerHTML);
    }
  };

  // Active Section Handler
  const activeSection = sections.find(s => s.id === activeSectionId) || sections[0];

  const updateActiveSectionContent = (htmlContent: string) => {
    setSections(prev => prev.map(s => s.id === activeSectionId ? { ...s, htmlContent } : s));
  };

  const updateActiveSectionTitle = (title: string) => {
    setSections(prev => prev.map(s => s.id === activeSectionId ? { ...s, title } : s));
  };

  // Variable handler
  const handleVariableChange = (key: string, val: string) => {
    setVariables(prev => ({ ...prev, [key]: val }));
  };

  // ART PDF Upload Handler
  const handleArtFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo em formato PDF ou Imagem.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const artInfo: ArtAttachment = {
        fileName: file.name,
        fileSize: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        pdfDataUrl: result,
        uploadedAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR')
      };

      setSections(prev => prev.map(s => {
        if (s.id === activeSectionId || s.contentType === 'art_attachment') {
          return {
            ...s,
            artData: artInfo,
            notes: `Arquivo ART ${file.name} anexado com sucesso.`
          };
        }
        return s;
      }));

      // Update ART variable if available
      if (!variables.art_rrt) {
        setVariables(prev => ({ ...prev, art_rrt: file.name.replace(/\.[^/.]+$/, "") }));
      }

      showToast(`Arquivo de ART "${file.name}" anexado com sucesso!`);
    };
    reader.readAsDataURL(file);
  };

  // Photo Upload Handler for Photo Sections
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, index) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const newPhoto: PhotoItem = {
          id: 'photo_' + Date.now() + '_' + index,
          url: dataUrl,
          caption: `Foto ${index + 1}: Registrado durante vistoria pericial em ${variables.data_vistoria || 'data de inspeção'}`
        };

        setSections(prev => prev.map(s => {
          if (s.id === activeSectionId) {
            const currentPhotos = s.photos || [];
            return {
              ...s,
              photos: [...currentPhotos, newPhoto]
            };
          }
          return s;
        }));
      };
      reader.readAsDataURL(file);
    });

    showToast(`${files.length} foto(s) adicionada(s) à galeria da seção!`);
  };

  const handlePhotoCaptionChange = (photoId: string, caption: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === activeSectionId && s.photos) {
        return {
          ...s,
          photos: s.photos.map(p => p.id === photoId ? { ...p, caption } : p)
        };
      }
      return s;
    }));
  };

  const handleDeletePhoto = (photoId: string) => {
    setSections(prev => prev.map(s => {
      if (s.id === activeSectionId && s.photos) {
        return {
          ...s,
          photos: s.photos.filter(p => p.id !== photoId)
        };
      }
      return s;
    }));
  };

  // Digital Signature Canvas Operations
  const startDrawingSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawingSig(true);
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig) return;
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawingSig = () => {
    setIsDrawingSig(false);
  };

  const clearSigCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignatureFromCanvas = () => {
    const canvas = sigCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    
    const randomHash = 'VL-SIGN-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const sigData: DigitalSignature = {
      status: 'assinado',
      responsibleName: variables.engenheiro_responsavel || 'Vitor Leonardo Cordeiro Linhares',
      creaCau: variables.crea_engenheiro || 'CREA-PE 1822299490',
      artNumber: variables.art_rrt || 'PE202609161747',
      signatureDate: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR'),
      signatureImage: dataUrl,
      verificationHash: randomHash
    };

    setSections(prev => prev.map(s => {
      if (s.id === activeSectionId || s.contentType === 'signature') {
        return {
          ...s,
          signatureData: sigData
        };
      }
      return s;
    }));

    showToast('Assinatura digital gravada com sucesso!');
  };

  const toggleSignatureStatus = (newStatus: 'pendente' | 'assinado') => {
    const randomHash = 'VL-SIGN-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    setSections(prev => prev.map(s => {
      if (s.id === activeSectionId || s.contentType === 'signature') {
        const existing = s.signatureData || {
          responsibleName: variables.engenheiro_responsavel || 'Vitor Leonardo Cordeiro Linhares',
          creaCau: variables.crea_engenheiro || 'CREA-PE 1822299490',
          artNumber: variables.art_rrt || 'PE202609161747'
        };
        return {
          ...s,
          signatureData: {
            ...existing,
            status: newStatus,
            signatureDate: newStatus === 'assinado' ? new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR') : undefined,
            verificationHash: newStatus === 'assinado' ? (existing.verificationHash || randomHash) : undefined
          }
        };
      }
      return s;
    }));

    showToast(`Status de assinatura alterado para: ${newStatus.toUpperCase()}`);
  };

  // Navigation Guard for Back button
  const handleBackWithGuard = async () => {
    if (isSaving) {
      showToast('Aguarde a gravação do laudo em andamento...');
      return;
    }
    if (hasUnsavedChanges) {
      const wantSave = window.confirm('Existem alterações não salvas no laudo. Deseja salvar no banco de dados antes de sair?');
      if (wantSave) {
        const ok = await handleSaveReportDraft();
        if (!ok) return; // Stop navigation if save failed
      }
    }
    if (onBack) onBack();
  };

  // Save current report to System History & Firestore
  const handleSaveReportDraft = async (): Promise<boolean> => {
    setIsSaving(true);
    showToast('Salvando dados do laudo no banco de dados...');
    try {
      const clientName = variables.nome_cliente || 'Cliente Geral';
      const equipmentModel = variables.modelo_veiculo || variables.objeto_inspecao || 'Objeto de Inspeção';

      const formData = {
        templateId: selectedTemplate?.id,
        templateTitle: selectedTemplate?.title,
        sections,
        variables,
        savedAt: new Date().toISOString()
      };

      const laudoId = await saveGeneratorLaudo(
        selectedTemplate?.category || 'custom',
        clientName,
        equipmentModel,
        variables.data_emissao || new Date().toLocaleDateString('pt-BR'),
        formData,
        currentSavedId
      );

      setCurrentSavedId(laudoId);
      setHasUnsavedChanges(false);
      showToast('✅ Laudo salvo no banco de dados e histórico com sucesso!');
      return true;
    } catch (err: any) {
      console.error('Erro ao salvar laudo:', err);
      alert(`⚠️ Erro ao salvar o laudo no banco de dados: ${err?.message || 'Falha de conexão'}. Seus dados foram mantidos localmente.`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Save Custom Template Model to Bank
  const handleSaveAsNewModel = () => {
    if (!newModelTitle.trim()) {
      alert('Informe o nome do modelo.');
      return;
    }

    const customModel: LaudoTemplate = {
      id: 'custom_tpl_' + Date.now(),
      title: newModelTitle.trim(),
      category: selectedTemplate?.category || 'custom',
      description: `Modelo personalizado criado por ${variables.engenheiro_responsavel || 'Engenheiro'}.`,
      iconName: 'Sparkles',
      version: 1,
      sections,
      variables,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isCustom: true
    };

    saveCustomTemplate(customModel);
    setAllTemplates(getAllTemplates());
    setSelectedTemplate(customModel);
    setShowSaveModelModal(false);
    setNewModelTitle('');
    showToast(`Modelo "${customModel.title}" salvo no Banco de Laudos!`);
  };

  // Helper to convert images to Base64 safely via canvas without fetch CORS failures
  const convertImageToBase64 = (img: HTMLImageElement): Promise<void> => {
    return new Promise((resolve) => {
      if (!img.src || img.src.startsWith('data:')) {
        resolve();
        return;
      }
      const tempImg = new Image();
      tempImg.crossOrigin = 'anonymous';
      tempImg.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = tempImg.naturalWidth || tempImg.width || 300;
          canvas.height = tempImg.naturalHeight || tempImg.height || 150;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(tempImg, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            img.src = dataUrl;
          }
        } catch (e) {
          console.warn('Canvas toDataURL skipped for image:', e);
        }
        resolve();
      };
      tempImg.onerror = () => {
        resolve();
      };
      tempImg.src = img.src;
    });
  };

  // Print / Save PDF directly via browser native print engine
  const handlePrintBrowser = async () => {
    if (activeTab !== 'preview') {
      setActiveTab('preview');
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    const element = printRef.current || document.getElementById('printable_laudo_document');
    if (!element) {
      alert('O documento não foi localizado. Tente novamente.');
      return;
    }

    showToast('Preparando documento A4 para impressão e salvamento em PDF...');

    // Convert all images inside element to Base64 Data URLs via canvas safely
    const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
    await Promise.all(images.map(img => convertImageToBase64(img)));

    window.scrollTo(0, 0);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Export PDF with ART PDF Merger
  const handleExportPDF = async () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);

    let element: HTMLElement | null = null;
    let originalTransform = '';
    let originalMargin = '';

    try {
      if (activeTab !== 'preview') {
        setActiveTab('preview');
        await new Promise(resolve => setTimeout(resolve, 400));
      }

      element = printRef.current || document.getElementById('printable_laudo_document');
      if (!element) {
        alert('O elemento do documento não foi localizado. Tente novamente.');
        return;
      }

      showToast('Processando imagens e renderizando documento A4...');

      // Convert all images inside element to Base64 Data URLs via canvas safely
      const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
      await Promise.all(images.map(img => convertImageToBase64(img)));

      // Temporarily clear zoom/transform and margin on printable element so html2canvas captures at true dimensions
      originalTransform = element.style.transform;
      originalMargin = element.style.margin;
      element.style.transform = 'none';
      element.style.margin = '0 auto';

      // Apply strict PDF capture attributes
      element.setAttribute('data-pdf-mode', 'true');
      element.classList.add('pdf-rendering-mode');
      document.body.classList.add('pdf-rendering-mode');

      window.scrollTo(0, 0);

      // Preprocess stylesheets to replace OKLCH colors with RGB for html2canvas compatibility
      try {
        await preprocessStylesheets(element as HTMLElement);
      } catch (e) {
        console.warn('preprocessStylesheets warning:', e);
      }

      // Check if any active section contains an uploaded ART PDF data URL
      const artSection = sections.find(s => s.enabled && s.contentType === 'art_attachment' && s.artData?.pdfDataUrl);

      // Resolve exporter cleanly
      let exporter = (window as any).html2pdf;
      if (!exporter) {
        exporter = (html2pdf as any)?.default || html2pdf;
      }

      if (typeof exporter !== 'function') {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
          script.crossOrigin = 'anonymous';
          script.onload = () => {
            exporter = (window as any).html2pdf;
            resolve();
          };
          script.onerror = () => reject(new Error('Não foi possível carregar a biblioteca de PDF.'));
          document.body.appendChild(script);
        });
      }

      const opt = {
        margin: [0, 0, 0, 0],
        filename: `${variables.numero_laudo || 'LAUDO'}_${(variables.nome_cliente || 'CLIENTE').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          allowTaint: true,
          letterRendering: true,
          logging: false,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
          width: 794
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { 
          mode: ['css', 'legacy'], 
          avoid: ['tr', 'table', 'img', 'figure'] 
        }
      };

      if (artSection && artSection.artData?.pdfDataUrl) {
        try {
          const mainPdfArrayBuffer = await exporter().set(opt).from(element).outputPdf('arraybuffer');
          showToast('Mesclando arquivo original da ART em formato PDF ao laudo...');
          const mergedPdfBytes = await mergeReportAndArtPdf(mainPdfArrayBuffer, artSection.artData.pdfDataUrl);

          const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = opt.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 10000);

          showToast('✅ Laudo em PDF baixado com sucesso!');
        } catch (mergeErr) {
          console.warn('Failed merging ART PDF, downloading main PDF:', mergeErr);
          await exporter().set(opt).from(element).save();
          showToast('✅ Laudo em PDF baixado com sucesso!');
        }
      } else {
        await exporter().set(opt).from(element).save();
        showToast('✅ Laudo em PDF baixado com sucesso!');
      }
    } catch (err: any) {
      console.warn("Falling back to native browser print/save PDF engine:", err);
      showToast('Abrindo impressão nativa para salvar em PDF...');
      window.print();
    } finally {
      if (element) {
        element.style.transform = originalTransform;
        element.style.margin = originalMargin;
        element.removeAttribute('data-pdf-mode');
        element.classList.remove('pdf-rendering-mode');
      }
      document.body.classList.remove('pdf-rendering-mode');
      restoreStylesheets();
      setIsGeneratingPdf(false);
    }
  };

  // Export DOCX
  const handleExportDOCX = async () => {
    if (activeTab !== 'preview') {
      setActiveTab('preview');
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    showToast('Exportando arquivo DOCX / Word com formatação preservada...');
    await exportToWord('printable_laudo_document', `${variables.numero_laudo || 'LAUDO'}.docx`);
  };

  // Filter templates list
  const filteredTemplates = allTemplates.filter(t => {
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const editorContent = (
    <div className={isFullscreen ? "fixed inset-0 z-[999999] bg-slate-950 overflow-y-auto w-screen h-screen p-4 sm:p-6 pb-28 space-y-6 text-slate-100 font-sans" : "space-y-6 max-w-7xl mx-auto"}>
      {/* HEADER BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  <span>Módulo de Laudos Modulares & Templates Editáveis</span>
                  {isFullscreen && (
                    <span className="text-xs bg-amber-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Modo Tela Cheia
                    </span>
                  )}
                  {hasUnsavedChanges && (
                    <span className="text-xs bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold px-2 py-0.5 rounded-full animate-pulse">
                      • Alterações não salvas
                    </span>
                  )}
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  Monte e edite laudos técnicos em blocos independentes, com auto-preenchimento, anexação da ART em PDF e assinatura digital.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onBack && (
              <button
                type="button"
                onClick={handleBackWithGuard}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                ← Voltar
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowHeaderSettingsModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Ajustar tamanho da logo, alinhamento e campos do cabeçalho"
            >
              <Settings className="w-4 h-4 text-amber-400" />
              Cabeçalho Master
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isFullscreen 
                  ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 ring-2 ring-amber-400' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title={isFullscreen ? 'Sair do Modo Tela Cheia (Esc)' : 'Expandir Editor em Tela Cheia'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullscreen ? 'Sair Tela Cheia' : 'Tela Cheia'}
            </button>

            <button
              type="button"
              onClick={() => setShowSaveModelModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              Salvar Modelo
            </button>

            <button
              type="button"
              onClick={handleSaveReportDraft}
              disabled={isSaving || isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Salvando...' : 'Salvar no Histórico'}
            </button>

            <button
              type="button"
              onClick={handleExportDOCX}
              disabled={isSaving || isGeneratingPdf}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-4 h-4" />
              DOCX / Word
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isSaving || isGeneratingPdf}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <Printer className="w-4 h-4" />}
              {isGeneratingPdf ? 'Gerando PDF...' : 'Gerar PDF Final'}
            </button>
          </div>
        </div>

        {/* AUTO-FILL SELECTORS BAR */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              Vincular Cliente / Solicitante:
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => handleClientChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              <option value="">-- Selecione para preencher variáveis --</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.company || c.name} ({c.cnpj_cpf || 'S/ CPF'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              Vincular Equipamento / Objeto:
            </label>
            <select
              value={selectedEquipmentId}
              onChange={(e) => handleEquipmentChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none cursor-pointer"
            >
              <option value="">-- Selecione para preencher variáveis --</option>
              {selectedClientId ? (
                <>
                  {equipments.filter(e => e.clientId === selectedClientId).length > 0 && (
                    <optgroup label={`Ativos Cadastrados para este Cliente (${equipments.filter(e => e.clientId === selectedClientId).length})`}>
                      {equipments.filter(e => e.clientId === selectedClientId).map(e => (
                        <option key={e.id} value={e.id}>
                          ⭐ {e.type} - {e.brand} {e.model} {e.idTag ? `[TAG: ${e.idTag}]` : e.serialNumber ? `(S/N: ${e.serialNumber})` : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {equipments.filter(e => e.clientId !== selectedClientId).length > 0 && (
                    <optgroup label="Outros Ativos / Equipamentos">
                      {equipments.filter(e => e.clientId !== selectedClientId).map(e => (
                        <option key={e.id} value={e.id}>
                          {e.type} - {e.brand} {e.model} ({e.clientName}) {e.idTag ? `[TAG: ${e.idTag}]` : ''}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </>
              ) : (
                equipments.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.type} - {e.brand} {e.model} ({e.clientName}) {e.idTag ? `[TAG: ${e.idTag}]` : e.serialNumber ? `(S/N: ${e.serialNumber})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1 md:col-span-2 lg:col-span-1">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              Modelo / Template Escolhido:
            </label>
            <select
              value={selectedTemplate?.id || ''}
              onChange={(e) => {
                const found = allTemplates.find(t => t.id === e.target.value);
                if (found) loadTemplate(found);
              }}
              className="w-full bg-slate-950 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-xl px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {allTemplates.map(t => (
                <option key={t.id} value={t.id}>
                  {t.isCustom ? '⭐ ' : '📋 '} {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TOAST ALERT */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500 text-amber-300 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{saveToast}</span>
        </div>
      )}

      {/* WORKSPACE AREA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SECTION SELECTOR & REORDERING & TEMPLATE BANK */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SECTION CONTROLS CARD */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Estrutura de Seções ({sections.filter(s => s.enabled).length}/{sections.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddSection}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold border border-amber-500/30 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Seção
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Marque/desmarque as seções para definir o que entra no laudo final. Use as setas para reordenar.
            </p>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {sections.map((sec, idx) => {
                const isActive = sec.id === activeSectionId;
                return (
                  <div
                    key={sec.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      isActive 
                        ? 'bg-amber-500/10 border-amber-500/50 text-white' 
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleSectionEnabled(sec.id)}
                        className="text-slate-400 hover:text-amber-400 cursor-pointer shrink-0"
                        title={sec.enabled ? "Ocultar esta seção no laudo" : "Exibir esta seção no laudo"}
                      >
                        {sec.enabled ? (
                          <CheckSquare className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </button>

                      <span 
                        onClick={() => setActiveSectionId(sec.id)}
                        className={`text-xs font-bold truncate cursor-pointer ${sec.enabled ? '' : 'line-through text-slate-500'}`}
                      >
                        {sec.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(idx, 'down')}
                        disabled={idx === sections.length - 1}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(sec.id)}
                        className="p-1 rounded hover:bg-rose-950 text-rose-400 cursor-pointer"
                        title="Excluir seção"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TEMPLATES BANK QUICK-ACCESSIBLE LIBRARY */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  Banco de Laudos-Modelo ({filteredTemplates.length})
                </h2>
              </div>
            </div>

            {/* CATEGORY FILTER PILLS */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'Todos' },
                { id: 'sinistro', label: 'Sinistro' },
                { id: 'nr12', label: 'NR-12' },
                { id: 'nr13', label: 'NR-13' },
                { id: 'pmoc', label: 'PMOC' },
                { id: 'munck', label: 'Munck' },
                { id: 'playground', label: 'Playground' },
                { id: 'maquinas', label: 'Máquinas' },
                { id: 'guindaste', label: 'Guindastes' },
                { id: 'art', label: 'ART' },
                { id: 'pcm', label: 'PCM' },
                { id: 'fire_safety', label: 'PPCI' }
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 shadow font-black'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar modelo no banco..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {filteredTemplates.map(tpl => (
                <div
                  key={tpl.id}
                  onClick={() => loadTemplate(tpl)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTemplate?.id === tpl.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold truncate">{tpl.title}</span>
                    {tpl.isCustom && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-mono">
                        CUSTOM
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 font-normal">
                    {tpl.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: RICH TEXT EDITOR & SPECIALIZED CONTROLS & LIVE PREVIEW */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* TABS SELECTOR */}
          <div className="flex border-b border-slate-800 bg-slate-900 rounded-t-2xl p-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'editor' 
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Editor de Texto Livre
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('variables')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'variables' 
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Campos Dinâmicos ({Object.keys(variables).length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'preview' 
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              Visão de Impressão (PDF Preview)
            </button>
          </div>

          {/* TAB 1: RICH TEXT EDITOR + SPECIALIZED CONTROLS FOR ACTIVE SECTION */}
          {activeTab === 'editor' && activeSection && (
            <div className="bg-slate-900 border border-slate-800 rounded-b-2xl p-6 shadow-xl space-y-6 text-slate-200">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Título da Seção Selecionada:
                </label>
                <input
                  type="text"
                  value={activeSection.title}
                  onChange={(e) => updateActiveSectionTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-bold text-sm rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* SPECIALIZED CONTROL PANEL FOR ART ATTACHMENT */}
              {activeSection.contentType === 'art_attachment' && (
                <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                      <Upload className="w-5 h-5" />
                      <span>Anexação da ART (Anotação de Responsabilidade Técnica)</span>
                    </div>
                    {activeSection.artData?.pdfDataUrl && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
                        <FileCheck className="w-3.5 h-3.5" /> ART Anexada
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    Importe o arquivo PDF da ART emitida e paga no CREA. O arquivo será fundido/mesclado ao final do laudo preservando QR Code e autenticação digital.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <label className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 transition-all">
                      <Upload className="w-4 h-4" />
                      <span>Selecionar Arquivo PDF da ART</span>
                      <input 
                        type="file" 
                        accept="application/pdf,image/*" 
                        onChange={handleArtFileUpload} 
                        className="hidden" 
                      />
                    </label>

                    {activeSection.artData?.fileName && (
                      <div className="text-xs text-slate-300 font-mono bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                        📄 {activeSection.artData.fileName} ({activeSection.artData.fileSize || 'PDF'})
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SPECIALIZED CONTROL PANEL FOR DIGITAL SIGNATURE */}
              {activeSection.contentType === 'signature' && (
                <div className="bg-slate-950 border border-blue-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <PenTool className="w-5 h-5" />
                      <span>Painel de Assinatura Digital & Responsável Técnico</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleSignatureStatus('pendente')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          activeSection.signatureData?.status === 'pendente' 
                            ? 'bg-amber-500 text-slate-950 font-black' 
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Aguardando Assinatura
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSignatureStatus('assinado')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          activeSection.signatureData?.status === 'assinado' 
                            ? 'bg-emerald-500 text-slate-950 font-black' 
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        Assinado Digitalmente
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300">
                    Desenhe sua assinatura no quadro abaixo para inserir a rubrica digital e gerar o hash de verificação pericial:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-slate-400 uppercase block">
                        Quadro de Rubrica / Assinatura Manual:
                      </label>
                      <div className="bg-white rounded-xl p-2 border border-slate-300 flex flex-col items-center">
                        <canvas
                          ref={sigCanvasRef}
                          width={320}
                          height={120}
                          onMouseDown={startDrawingSig}
                          onMouseMove={drawSig}
                          onMouseUp={stopDrawingSig}
                          onMouseLeave={stopDrawingSig}
                          onTouchStart={startDrawingSig}
                          onTouchMove={drawSig}
                          onTouchEnd={stopDrawingSig}
                          className="bg-slate-50 rounded border border-dashed border-slate-300 cursor-crosshair w-full h-[120px]"
                        />
                        <div className="flex items-center justify-between w-full mt-2 text-xs">
                          <button
                            type="button"
                            onClick={clearSigCanvas}
                            className="text-slate-600 hover:text-rose-600 font-bold"
                          >
                            Limpar
                          </button>
                          <button
                            type="button"
                            onClick={saveSignatureFromCanvas}
                            className="px-3 py-1 rounded bg-blue-600 text-white font-bold text-xs"
                          >
                            Gravar Assinatura
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[10px]">Responsável Técnico:</span>
                        <span className="font-bold text-white text-sm">{variables.engenheiro_responsavel || 'Vitor Leonardo Cordeiro Linhares'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[10px]">CREA / CAU:</span>
                        <span className="text-amber-300 font-mono font-bold">{variables.crea_engenheiro || 'CREA-PE 1822299490'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIALIZED CONTROL PANEL FOR PHOTO GALLERY */}
              {activeSection.contentType === 'photos' && (
                <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <ImageIcon className="w-5 h-5" />
                      <span>Galeria de Registros Fotográficos ({activeSection.photos?.length || 0} fotos)</span>
                    </div>
                    <label className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all">
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Fotos</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {activeSection.photos?.map((photo) => (
                      <div key={photo.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 relative group">
                        <img 
                          src={photo.url} 
                          alt="Vistoria" 
                          className="w-full h-32 object-cover rounded-lg border border-slate-800" 
                        />
                        <textarea
                          rows={2}
                          value={photo.caption}
                          onChange={(e) => handlePhotoCaptionChange(photo.id, e.target.value)}
                          placeholder="Legenda da foto..."
                          className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(photo.id)}
                          className="absolute top-4 right-4 bg-rose-600/90 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Remover foto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PROFESSIONAL RICH TEXT EDITOR TOOLBAR */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* TEXT BLOCK TYPE SELECTOR */}
                  <select
                    onChange={(e) => applyFormatting('formatBlock', e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-amber-500 font-semibold cursor-pointer"
                    defaultValue="p"
                    title="Estilo de Parágrafo/Título"
                  >
                    <option value="p">Texto Normal</option>
                    <option value="h1">Título 1 (H1)</option>
                    <option value="h2">Título 2 (H2)</option>
                    <option value="h3">Título 3 (H3)</option>
                    <option value="h4">Subtítulo (H4)</option>
                  </select>

                  {/* FONT SIZE SELECTOR */}
                  <select
                    onChange={(e) => applyFormatting('fontSize', e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-amber-500 font-semibold cursor-pointer"
                    defaultValue="3"
                    title="Tamanho da Fonte"
                  >
                    <option value="1">10px (Muito Pequeno)</option>
                    <option value="2">12px (Pequeno)</option>
                    <option value="3">14px (Normal)</option>
                    <option value="4">16px (Médio)</option>
                    <option value="5">18px (Grande)</option>
                    <option value="6">24px (Título)</option>
                  </select>

                  <div className="w-px h-5 bg-slate-800 my-auto mx-0.5" />

                  {/* TEXT FORMATTING BUTTONS */}
                  <button
                    type="button"
                    onClick={() => applyFormatting('bold')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Negrito (Ctrl+B)"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('italic')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Itálico (Ctrl+I)"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('underline')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Sublinhado (Ctrl+U)"
                  >
                    <Underline className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('strikeThrough')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Tachado"
                  >
                    <Strikethrough className="w-4 h-4" />
                  </button>

                  <div className="w-px h-5 bg-slate-800 my-auto mx-0.5" />

                  {/* ALIGNMENT BUTTONS */}
                  <button
                    type="button"
                    onClick={() => applyFormatting('justifyLeft')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Alinhar à Esquerda"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('justifyCenter')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Centralizar"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('justifyRight')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Alinhar à Direita"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('justifyFull')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Justificar"
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>

                  <div className="w-px h-5 bg-slate-800 my-auto mx-0.5" />

                  {/* LIST BUTTONS */}
                  <button
                    type="button"
                    onClick={() => applyFormatting('insertUnorderedList')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Lista com Marcadores"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('insertOrderedList')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                    title="Lista Numerada"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </button>

                  <div className="w-px h-5 bg-slate-800 my-auto mx-0.5" />

                  {/* COLOR PALETTES */}
                  <div className="relative flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cor Texto:</span>
                    {['#0f172a', '#1e3a8a', '#0284c7', '#047857', '#b91c1c', '#b45309'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => applyFormatting('foreColor', c)}
                        className="w-4 h-4 rounded-full border border-slate-700 cursor-pointer hover:scale-125 transition-all shadow-sm"
                        style={{ backgroundColor: c }}
                        title={`Cor do texto: ${c}`}
                      />
                    ))}
                  </div>

                  <div className="w-px h-5 bg-slate-800 my-auto mx-0.5" />

                  {/* HIGHLIGHT COLOR PALETTES */}
                  <div className="relative flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Fundo Texto:</span>
                    {[
                      { bg: '#fef08a', name: 'Amarelo' },
                      { bg: '#dcfce7', name: 'Verde' },
                      { bg: '#e0f2fe', name: 'Azul' },
                      { bg: '#fee2e2', name: 'Vermelho' },
                      { bg: '#ffffff', name: 'Branco' }
                    ].map(c => (
                      <button
                        key={c.bg}
                        type="button"
                        onClick={() => applyFormatting('hiliteColor', c.bg)}
                        className="w-4 h-4 rounded border border-slate-700 cursor-pointer hover:scale-125 transition-all shadow-sm"
                        style={{ backgroundColor: c.bg }}
                        title={`Destaque: ${c.name}`}
                      />
                    ))}
                  </div>
                </div>

                {/* ADVANCED MEDIA & TABLE ROW TOOLBAR */}
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
                  {/* INSERT TABLE BUTTON & MODAL TRIGGER */}
                  <button
                    type="button"
                    onClick={() => setShowTableModal(true)}
                    className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded text-[11px] flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
                    title="Criar Tabela Personalizada com Linhas, Colunas e Cores"
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>+ Tabela Personalizada</span>
                  </button>

                  {/* TABLE HEADER COLOR QUICK CHANGE */}
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-2 py-0.5">
                    <span className="text-[10px] font-bold text-amber-300">Cabeçalho Tabela:</span>
                    {[
                      { bg: '#0f2537', text: '#ffffff', label: 'Azul Marinho' },
                      { bg: '#1e293b', text: '#ffffff', label: 'Grafite' },
                      { bg: '#065f46', text: '#ffffff', label: 'Verde' },
                      { bg: '#991b1b', text: '#ffffff', label: 'Vermelho' },
                      { bg: '#b45309', text: '#ffffff', label: 'Âmbar' },
                      { bg: '#f1f5f9', text: '#0f172a', label: 'Cinza Claro' }
                    ].map(thc => (
                      <button
                        key={thc.bg}
                        type="button"
                        onClick={() => applyTableHeaderColor(thc.bg, thc.text)}
                        className="w-3.5 h-3.5 rounded border border-slate-700 cursor-pointer hover:scale-125 transition-all"
                        style={{ backgroundColor: thc.bg }}
                        title={`Aplicar cor ${thc.label} no cabeçalho da tabela selecionada`}
                      />
                    ))}
                  </div>

                  <div className="w-px h-5 bg-slate-800 my-auto" />

                  {/* INSERT IMAGE BUTTONS */}
                  <label
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                    title="Inserir Imagem do Dispositivo no Texto"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>+ Imagem (Arquivo)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleInlineImageInsert}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowImageUrlModal(true)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                    title="Inserir Imagem via Link / URL Web"
                  >
                    <span>+ Imagem (URL)</span>
                  </button>

                  <div className="w-px h-5 bg-slate-800 my-auto" />

                  {/* UNDO / REDO / CLEAR FORMATTING */}
                  <button
                    type="button"
                    onClick={() => applyFormatting('undo')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title="Desfazer (Ctrl+Z)"
                  >
                    <Undo className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('redo')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 cursor-pointer"
                    title="Refazer (Ctrl+Y)"
                  >
                    <Redo className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormatting('removeFormat')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 cursor-pointer"
                    title="Limpar Formatação"
                  >
                    <RemoveFormatting className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* INSERT VARIABLE BADGES */}
                <div className="pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider pr-1">Variáveis Dinâmicas:</span>
                  {['nome_cliente', 'cpf_cnpj_cliente', 'data_vistoria', 'numero_laudo', 'art_rrt', 'marca_veiculo', 'modelo_veiculo', 'placa_veiculo', 'conclusao_monta'].map(vk => (
                    <button
                      key={vk}
                      type="button"
                      onClick={() => insertVariablePlaceholder(vk)}
                      className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono cursor-pointer transition-all"
                    >
                      + {`{{${vk}}}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* EDITABLE HTML CONTENT AREA WITH HIGH CONTRAST DARK TEXT ON WHITE CANVAS */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span>Editor da Seção (Texto Escuro de Alta Visibilidade):</span>
                  </label>
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => setEditorViewMode('visual')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        editorViewMode === 'visual'
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Visual (Rich Text)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorViewMode('code')}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer ${
                        editorViewMode === 'code'
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Código HTML
                    </button>
                  </div>
                </div>

                {editorViewMode === 'visual' ? (
                  <div
                    key={activeSection.id}
                    id="editor_content_editable"
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => updateActiveSectionContent(e.currentTarget.innerHTML)}
                    onBlur={(e) => updateActiveSectionContent(e.currentTarget.innerHTML)}
                    className="w-full min-h-[350px] bg-white border-2 border-slate-700 text-slate-900 font-normal text-xs rounded-xl p-4 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none overflow-y-auto leading-relaxed prose max-w-none shadow-inner"
                    style={{ color: '#0f172a' }}
                  />
                ) : (
                  <textarea
                    value={activeSection.htmlContent}
                    onChange={(e) => {
                      updateActiveSectionContent(e.target.value);
                      if (editorRef.current) {
                        editorRef.current.innerHTML = e.target.value;
                      }
                    }}
                    className="w-full min-h-[350px] bg-slate-950 text-emerald-400 font-mono text-xs rounded-xl p-4 border border-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                    placeholder="Digite ou edite o código HTML da seção..."
                  />
                )}
              </div>

              {/* STANDARDIZED COVER PHOTO CARD */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 mt-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Foto do Objeto / Equipamento na Capa (Padronizada)
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Capa de Todos os Laudos
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-32 h-24 bg-slate-900 border border-slate-800 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                    {variables.foto_capa_url || variables.cover_image_url ? (
                      <img 
                        src={variables.foto_capa_url || variables.cover_image_url} 
                        alt="Foto da Capa" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="text-center p-2">
                        <ImageIcon className="w-6 h-6 text-slate-600 mx-auto mb-1" />
                        <span className="text-[9px] text-slate-500 font-medium">Sem foto</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2 text-left">
                    <p className="text-xs text-slate-300">
                      Anexe a imagem principal do objeto/local da vistoria (veículo, máquina, estrutura, caldeira, parque infantil) para ser exibida em posição de destaque na Capa Oficial de todos os laudos.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/10">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{variables.foto_capa_url || variables.cover_image_url ? 'Alterar Foto da Capa' : 'Inserir Foto na Capa'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleCoverPhotoUpload} 
                        />
                      </label>
                      {(variables.foto_capa_url || variables.cover_image_url) && (
                        <button
                          type="button"
                          onClick={() => setVariables(prev => ({ ...prev, foto_capa_url: '', cover_image_url: '' }))}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                        >
                          Remover Foto
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VARIABLES FORM */}
          {activeTab === 'variables' && (
            <div className="bg-slate-900 border border-slate-800 rounded-b-2xl p-6 shadow-xl space-y-6 text-slate-200">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Preenchimento de Campos Variáveis
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Modifique qualquer valor sugerido. Os valores preenchidos abaixo serão substituídos automaticamente em todo o documento.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key} className="space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <label className="text-[11px] font-bold text-amber-300 font-mono uppercase block">
                      {`{{${key}}}`}
                    </label>
                    <textarea
                      rows={key.includes('conclusao') || key.includes('qualificacao') ? 3 : 1}
                      value={value}
                      onChange={(e) => handleVariableChange(key, e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none font-sans"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: LIVE PRINT PREVIEW */}
          {activeTab === 'preview' && (
            <div className="bg-slate-950 border border-slate-800 rounded-b-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-white">Visualização em Tempo Real</span> — Formato final de impressão (A4)
                </div>
                <div className="flex items-center gap-3">
                  {/* CONTROLE DE ZOOM DO CONTAINER */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg text-xs">
                    <span className="text-[11px] font-bold text-slate-400">Zoom:</span>
                    <button 
                      type="button" 
                      onClick={() => setZoomLevel(prev => Math.max(50, prev - 10))}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold text-white transition-all flex items-center justify-center cursor-pointer"
                      title="Reduzir Zoom (-10%)"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-amber-400 w-12 text-center text-xs">{zoomLevel}%</span>
                    <button 
                      type="button" 
                      onClick={() => setZoomLevel(prev => Math.min(150, prev + 10))}
                      className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold text-white transition-all flex items-center justify-center cursor-pointer"
                      title="Aumentar Zoom (+10%)"
                    >
                      +
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setZoomLevel(100)}
                      className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-400 hover:text-white transition-all cursor-pointer ml-1"
                      title="Resetar para 100%"
                    >
                      100%
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handlePrintBrowser}
                    disabled={isGeneratingPdf}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
                    title="Abre a caixa de diálogo nativa de impressão e salvamento em PDF do navegador"
                  >
                    <Printer className="w-3.5 h-3.5" /> Imprimir / Salvar PDF (Navegador)
                  </button>

                  <button
                    type="button"
                    onClick={handleExportPDF}
                    disabled={isGeneratingPdf}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-500/10 disabled:opacity-50"
                    title="Baixar arquivo PDF gerado diretamente"
                  >
                    {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <FileDown className="w-3.5 h-3.5" />}
                    {isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF Direto'}
                  </button>
                </div>
              </div>

              {/* A4 PAPER PREVIEW CONTAINER */}
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 overflow-x-auto flex justify-center min-h-[600px]">
                <style>{`
                  @media print {
                    @page {
                      size: A4 portrait;
                      margin: 0mm;
                    }

                    html, body {
                      background: #ffffff !important;
                      margin: 0 !important;
                      padding: 0 !important;
                      width: 210mm !important;
                      height: auto !important;
                      overflow: visible !important;
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }

                    body * {
                      visibility: hidden !important;
                    }

                    #printable_laudo_document,
                    #printable_laudo_document * {
                      visibility: visible !important;
                    }

                    #printable_laudo_document {
                      display: block !important;
                      position: static !important;
                      left: auto !important;
                      top: auto !important;
                      width: 210mm !important;
                      max-width: 210mm !important;
                      margin: 0 auto !important;
                      padding: 0 !important;
                      box-shadow: none !important;
                      border: none !important;
                      background: white !important;
                      transform: none !important;
                      zoom: 1 !important;
                      overflow: visible !important;
                    }

                    .laudo-page-block {
                      width: 210mm !important;
                      min-height: 296mm !important;
                      height: auto !important;
                      padding: 12mm 15mm !important;
                      box-sizing: border-box !important;
                      page-break-before: auto !important;
                      page-break-after: always !important;
                      break-after: page !important;
                      page-break-inside: avoid !important;
                      break-inside: avoid !important;
                      border: none !important;
                      margin: 0 auto !important;
                      background: white !important;
                      position: relative !important;
                      overflow: visible !important;
                      display: flex !important;
                      flex-direction: column !important;
                      justify-content: space-between !important;
                    }

                    .laudo-page-block:last-child {
                      page-break-after: avoid !important;
                      break-after: avoid !important;
                    }
                  }

                  #printable_laudo_document[data-pdf-mode="true"],
                  .pdf-rendering-mode #printable_laudo_document {
                    transform: none !important;
                    zoom: 1 !important;
                    width: 210mm !important;
                    max-width: 210mm !important;
                    margin: 0 !important;
                    box-shadow: none !important;
                    border: none !important;
                    background: white !important;
                  }

                  .pdf-rendering-mode .laudo-page-block {
                    width: 210mm !important;
                    height: 296mm !important;
                    max-height: 296mm !important;
                    border: none !important;
                    box-shadow: none !important;
                    margin: 0 !important;
                    padding: 12mm 15mm !important;
                    box-sizing: border-box !important;
                    page-break-after: always !important;
                    break-after: page !important;
                    page-break-before: avoid !important;
                    break-before: avoid !important;
                    overflow: hidden !important;
                    background: white !important;
                    position: relative !important;
                    display: flex !important;
                    flex-direction: column !important;
                    justify-content: space-between !important;
                  }

                  .pdf-rendering-mode .laudo-page-block:last-child {
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                  }

                  .pdf-rendering-mode .no-pdf-capture {
                    display: none !important;
                  }
                `}</style>
                <div
                  id="printable_laudo_document"
                  ref={printRef}
                  className="bg-white text-slate-900 w-[210mm] font-sans text-xs leading-relaxed relative transition-transform duration-150 mx-auto shadow-2xl"
                  style={{ 
                    fontFamily: 'Arial, sans-serif',
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center'
                  }}
                >
                  {/* RENDER ENABLED SECTIONS AS PAGES WITH HEADER AND LOGO ON EVERY PAGE */}
                  <div className="space-y-0">
                    {sections.filter(s => s.enabled).map((sec, secIndex, enabledArr) => {
                      const renderedContent = replaceVariables(sec.htmlContent, variables);
                      const pageNum = secIndex + 1;
                      const totalPages = enabledArr.length;

                      return (
                        <div 
                          key={sec.id} 
                          className={`laudo-page-block w-[210mm] min-h-[296mm] p-[15mm] box-border bg-white relative flex flex-col justify-between ${
                            secIndex > 0 ? "border-t border-slate-200" : ""
                          }`}
                          style={{
                            pageBreakAfter: secIndex < enabledArr.length - 1 ? 'always' : 'auto',
                            breakAfter: secIndex < enabledArr.length - 1 ? 'page' : 'auto',
                            pageBreakInside: 'avoid',
                            breakInside: 'avoid'
                          }}
                        >
                          <div>
                            {/* REUSABLE HEADER MASTER COMPONENT ON TOP OF EVERY PAGE */}
                            <HeaderMaster config={headerMasterConfig} variables={variables} />

                             {/* SECTION TITLE */}
                            {sec.contentType !== 'capa' && sec.title.trim().toUpperCase() !== 'CAPA DO DOCUMENTO' && sec.title.trim().toUpperCase() !== 'CAPA' && (
                              <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-3">
                                {sec.title}
                              </h3>
                            )}

                            {/* STANDARDIZED COVER PHOTO DISPLAY ON CAPA SECTION */}
                            {sec.contentType === 'capa' && (variables.foto_capa_url || variables.cover_image_url) && (
                              <div className="my-4 text-center">
                                <img 
                                  src={variables.foto_capa_url || variables.cover_image_url} 
                                  alt="Foto da Capa - Objeto Vistoriado" 
                                  className="max-h-[240px] w-auto max-w-full object-contain rounded-lg border-2 border-slate-300 mx-auto shadow-md"
                                />
                              </div>
                            )}
                            
                            {/* DYNAMIC SUMARIO (TABLE OF CONTENTS) RENDER */}
                            {sec.contentType === 'sumario' ? (
                              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 my-2 font-sans">
                                <div className="border-b border-slate-300 pb-2 mb-3">
                                  <h4 className="font-bold text-slate-900 uppercase text-xs tracking-wider">
                                    SUMÁRIO EXECUTIVO DO LAUDO TÉCNICO
                                  </h4>
                                </div>
                                <div className="space-y-2 text-xs text-slate-700">
                                  {enabledArr.filter(s => s.contentType !== 'capa' && s.contentType !== 'sumario').map((s, idx) => (
                                    <div key={s.id} className="flex items-center justify-between border-b border-dotted border-slate-300 pb-1">
                                      <span className="font-medium text-slate-900">{s.title}</span>
                                      <span className="font-mono text-slate-600 font-bold">Página {idx + 3}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : sec.contentType === 'signature' ? (
                              /* OFFICIAL UNIFIED SIGNATURE BLOCK (CENTRALIZED, GENEROUS SPACE FOR SIGNATURE) */
                              <div className="mt-10 pt-6 border-t border-slate-300 text-center flex flex-col items-center justify-center space-y-1.5 font-sans my-4 w-full">
                                <div className="min-h-[75px] flex items-center justify-center my-2">
                                  {sec.signatureData?.signatureImage ? (
                                    <img 
                                      src={sec.signatureData.signatureImage} 
                                      alt="Assinatura Digital" 
                                      className="h-16 mx-auto object-contain" 
                                    />
                                  ) : (
                                    <img 
                                      src="/assinatura_vitor.jpg" 
                                      alt="Assinatura Eng. Vitor" 
                                      className="h-16 mx-auto object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  )}
                                </div>
                                <p className="font-black text-slate-900 text-sm uppercase tracking-wide text-center w-full">
                                  {sec.signatureData?.responsibleName || variables.engenheiro_responsavel || 'Vitor Leonardo Cordeiro Linhares'}
                                </p>
                                <p className="text-xs text-slate-700 font-bold text-center w-full">
                                  Engenheiro Mecânico — {sec.signatureData?.creaCau || variables.crea_engenheiro || 'CREA-PE 1822299490'}
                                </p>
                                <p className="text-xs text-slate-600 font-mono text-center w-full">
                                  ART N.º {sec.signatureData?.artNumber || variables.art_rrt || 'PE202609161747'}
                                </p>
                              </div>
                            ) : (
                              <div 
                                dangerouslySetInnerHTML={{ __html: renderedContent }}
                                className="text-xs text-slate-800 leading-normal prose-sm max-w-none"
                              />
                            )}

                            {/* PHOTOS RENDER - INCREASED VERTICAL DIMENSION FOR OPTIMAL VIEWING */}
                            {sec.contentType === 'photos' && sec.photos && sec.photos.length > 0 && (
                              <div className="grid grid-cols-2 gap-5 mt-4">
                                {sec.photos.map(p => (
                                  <div key={p.id} className="border border-slate-300 p-2.5 rounded-lg bg-slate-50 text-center space-y-1.5 shadow-sm">
                                    <img src={p.url} alt="Foto Vistoria" className="w-full h-56 object-cover rounded-md border border-slate-200" />
                                    <p className="text-[11px] text-slate-700 italic font-sans font-medium">{p.caption}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* ART ATTACHMENT DISPLAY IN PREVIEW */}
                            {sec.contentType === 'art_attachment' && (
                              <div className="space-y-3 mt-2 w-full">
                                {sec.artData?.pdfDataUrl ? (
                                  sec.artData.pdfDataUrl.startsWith('data:image/') ? (
                                    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white p-2 shadow-sm">
                                      <img 
                                        src={sec.artData.pdfDataUrl} 
                                        alt="ART Anexada" 
                                        className="w-full max-h-[700px] object-contain mx-auto rounded" 
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-full h-[680px] border border-slate-300 rounded-xl overflow-hidden bg-slate-100 shadow-sm relative no-pdf-capture">
                                      <iframe 
                                        src={sec.artData.pdfDataUrl} 
                                        title="Visualização do Documento de ART" 
                                        className="w-full h-full border-none"
                                      />
                                    </div>
                                  )
                                ) : (
                                  <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-1.5 my-3 font-sans">
                                    <p className="text-amber-900 font-bold text-xs uppercase tracking-wide">
                                      📄 Anotação de Responsabilidade Técnica (ART N.º {variables.art_rrt || 'PE202609161747'})
                                    </p>
                                    <p className="text-[11px] text-amber-800">
                                      Documento vinculado e homologado junto ao CREA-PE.
                                      {sec.artData?.fileName && (
                                        <span className="block mt-1 font-mono font-bold text-amber-950">
                                          Arquivo anexado: {sec.artData.fileName}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* FOOTER ON EVERY PAGE WITH DYNAMIC PAGE NUMBERING */}
                          <div className="pt-4 border-t border-slate-300 text-[9px] text-slate-500 font-mono flex items-center justify-between mt-auto">
                            <span>VL ENGENHARIA MECÂNICA — RECIFE/PE</span>
                            <span>CREA-PE: 1822299490 | ART N.º: {variables.art_rrt || 'PE202609161747'}</span>
                            <span className="font-bold text-slate-900">Página {pageNum} de {totalPages}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SAVE MODEL MODAL */}
      {showSaveModelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-amber-400">
                <Sparkles className="w-5 h-5" />
                Salvar no Banco de Laudos-Modelo
              </h3>
              <button 
                type="button"
                onClick={() => setShowSaveModelModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Digite um nome para este modelo personalizado. Ele ficará disponível no seu Banco de Laudos para reutilização futura em novos clientes.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase">
                Nome do Modelo:
              </label>
              <input
                type="text"
                value={newModelTitle}
                onChange={(e) => setNewModelTitle(e.target.value)}
                placeholder="Ex: Modelo Sinistro Motocicletas Recife 2026"
                className="w-full bg-slate-950 border border-slate-800 text-white font-bold text-xs rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveModelModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAsNewModel}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer"
              >
                Salvar Modelo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER MASTER SETTINGS MODAL */}
      {showHeaderSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 text-white space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-amber-400">
                <Settings className="w-5 h-5 text-amber-400" />
                Painel de Configurações do Cabeçalho Master
              </h3>
              <button 
                type="button"
                onClick={() => setShowHeaderSettingsModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Personalize o redimensionamento da logo VL Engenharia, o alinhamento do topo e os textos identificadores que serão replicados em todas as páginas e nas exportações (PDF e Word).
            </p>

            {/* LIVE MINI PREVIEW OF HEADER MASTER */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pré-visualização do Cabeçalho:
              </label>
              <div className="bg-white p-4 rounded-xl border border-slate-300 shadow-inner overflow-hidden">
                <HeaderMaster config={headerMasterConfig} variables={variables} />
              </div>
            </div>

            <div className="space-y-4 pt-1">
              {/* LOGO HEIGHT SLIDER */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <label className="font-bold text-slate-300">Tamanho/Altura da Logomarca (px):</label>
                  <span className="font-mono text-amber-400 font-bold">{headerMasterConfig.logoHeight || 42} px</span>
                </div>
                <input 
                  type="range"
                  min="25"
                  max="80"
                  step="1"
                  value={headerMasterConfig.logoHeight || 42}
                  onChange={(e) => setHeaderMasterConfig(prev => ({ ...prev, logoHeight: Number(e.target.value) }))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              {/* LOGO POSITION */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300 block mb-1">Posicionamento da Logo:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'left', label: 'Esquerda' },
                    { id: 'center', label: 'Centralizado' },
                    { id: 'right', label: 'Direita' }
                  ].map(pos => (
                    <button
                      key={pos.id}
                      type="button"
                      onClick={() => setHeaderMasterConfig(prev => ({ ...prev, logoPosition: pos.id as any }))}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        headerMasterConfig.logoPosition === pos.id 
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md' 
                          : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* HEADER TITLE INPUT */}
              <div className="space-y-1 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Título do Cabeçalho:</label>
                <input 
                  type="text"
                  value={headerMasterConfig.headerTitle || ''}
                  onChange={(e) => setHeaderMasterConfig(prev => ({ ...prev, headerTitle: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  placeholder="Ex: VL ENGENHARIA MECÂNICA & PERÍCIAS"
                />
              </div>

              {/* SLOGAN TOGGLE */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-xs font-bold text-slate-200 block">Exibir Subtítulo/Slogan Técnico</label>
                  <span className="text-[10px] text-slate-400">INSPEÇÕES TÉCNICAS • LAUDOS PERICIAIS</span>
                </div>
                <input 
                  type="checkbox"
                  checked={headerMasterConfig.showSlogan !== false}
                  onChange={(e) => setHeaderMasterConfig(prev => ({ ...prev, showSlogan: e.target.checked }))}
                  className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowHeaderSettingsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/10"
              >
                Concluir & Aplicar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM TABLE MODAL */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-amber-400">
                <Table className="w-5 h-5 text-amber-400" />
                Gerador de Tabela Técnica Personalizada
              </h3>
              <button 
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Configure a dimensão e o tema visual da tabela a ser inserida no corpo do laudo:
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase block">Linhas:</label>
                <input 
                  type="number"
                  min="1"
                  max="30"
                  value={tableRows}
                  onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-bold text-xs rounded-xl p-2.5 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase block">Colunas:</label>
                <input 
                  type="number"
                  min="1"
                  max="12"
                  value={tableCols}
                  onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-bold text-xs rounded-xl p-2.5 focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase block">
                Tema do Cabeçalho da Tabela:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '#0f2537', text: '#ffffff', label: 'Azul Marinho (VL)' },
                  { id: '#1e293b', text: '#ffffff', label: 'Grafite Escuro' },
                  { id: '#065f46', text: '#ffffff', label: 'Verde Pericial' },
                  { id: '#991b1b', text: '#ffffff', label: 'Vermelho Alerta' },
                  { id: '#b45309', text: '#ffffff', label: 'Âmbar Destaque' },
                  { id: '#f1f5f9', text: '#0f172a', label: 'Cinza Executivo' }
                ].map(theme => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setTableHeaderBg(theme.id);
                      setTableHeaderTextColor(theme.text);
                    }}
                    className={`p-2 rounded-xl text-left border text-xs font-bold transition-all cursor-pointer flex flex-col justify-between h-14 ${
                      tableHeaderBg === theme.id ? 'border-amber-500 ring-2 ring-amber-500/30' : 'border-slate-800 hover:border-slate-700'
                    }`}
                    style={{ backgroundColor: theme.id, color: theme.text }}
                  >
                    <span className="text-[10px] opacity-90">{theme.label}</span>
                    <div className="w-full h-1 bg-white/30 rounded-full mt-1" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleInsertCustomTable(tableRows, tableCols, tableHeaderBg, tableHeaderTextColor)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/10"
              >
                Inserir Tabela
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSERT IMAGE URL MODAL */}
      {showImageUrlModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black flex items-center gap-2 text-emerald-400">
                <ImageIcon className="w-5 h-5 text-emerald-400" />
                Inserir Imagem via Link / URL
              </h3>
              <button 
                type="button"
                onClick={() => setShowImageUrlModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Cole o endereço web (URL HTTP/HTTPS) da imagem para adicioná-la diretamente no corpo da seção ativa:
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase block">URL da Imagem:</label>
              <input 
                type="text"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowImageUrlModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleInsertImageUrl}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                Inserir Imagem
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return createPortal(editorContent, document.body);
  }

  return editorContent;
}
