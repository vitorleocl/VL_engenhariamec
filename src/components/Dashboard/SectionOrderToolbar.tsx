import React, { useState } from 'react';
import { SectionConfig, CustomSection, moveSection, getNumberedSections } from '../../lib/sectionManager';
import { 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Wand2, 
  Image as ImageIcon, 
  Layers, 
  Check, 
  X,
  FileText
} from 'lucide-react';
import { generateEngineeringDiagnostic, DiagnosticInput } from '../../lib/engineeringDiagnosticEngine';

interface SectionOrderToolbarProps {
  sections: SectionConfig[];
  onUpdateSections: (newSections: SectionConfig[]) => void;
  onApplyAIDiagnostic?: (diagnostic: any) => void;
  diagnosticInputData?: DiagnosticInput;
  className?: string;
}

export default function SectionOrderToolbar({
  sections,
  onUpdateSections,
  onApplyAIDiagnostic,
  diagnosticInputData,
  className = ""
}: SectionOrderToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingCustomId, setEditingCustomId] = useState<string | null>(null);

  // Custom section form state
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [customImages, setCustomImages] = useState<{ data: string; caption?: string }[]>([]);
  const [imageCaption, setImageCaption] = useState('');

  // AI loading
  const [loadingAI, setLoadingAI] = useState(false);

  const numberedSections = getNumberedSections(sections);

  const handleToggleVisibility = (id: string) => {
    const updated = sections.map(sec => 
      sec.id === id ? { ...sec, visible: !sec.visible } : sec
    );
    onUpdateSections(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const updated = moveSection(sections, index, direction);
    onUpdateSections(updated);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImages(prev => [
            ...prev,
            { data: event.target!.result as string, caption: imageCaption || file.name }
          ]);
          setImageCaption('');
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (idx: number) => {
    setCustomImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSaveCustomSection = () => {
    if (!customTitle.trim()) {
      alert("Por favor, informe o título da seção personalizada.");
      return;
    }

    if (editingCustomId) {
      // Edit existing
      const updated = sections.map(sec => {
        if (sec.id === editingCustomId) {
          return {
            ...sec,
            label: customTitle,
            customData: {
              id: editingCustomId,
              title: customTitle,
              content: customContent,
              images: customImages
            }
          };
        }
        return sec;
      });
      onUpdateSections(updated);
    } else {
      // Add new
      const newCustomId = 'custom_' + Date.now();
      const newCustom: CustomSection = {
        id: newCustomId,
        title: customTitle,
        content: customContent,
        images: customImages
      };

      const newConfig: SectionConfig = {
        id: newCustomId,
        label: customTitle,
        visible: true,
        isCustom: true,
        customData: newCustom
      };

      onUpdateSections([...sections, newConfig]);
    }

    // Reset
    setCustomTitle('');
    setCustomContent('');
    setCustomImages([]);
    setEditingCustomId(null);
    setShowCustomModal(false);
  };

  const handleEditCustom = (sec: SectionConfig) => {
    if (!sec.customData) return;
    setEditingCustomId(sec.id);
    setCustomTitle(sec.customData.title);
    setCustomContent(sec.customData.content || '');
    setCustomImages(sec.customData.images || []);
    setShowCustomModal(true);
  };

  const handleDeleteCustom = (id: string) => {
    if (confirm("Deseja realmente remover esta seção personalizada?")) {
      const updated = sections.filter(sec => sec.id !== id);
      onUpdateSections(updated);
    }
  };

  const handleRunAI = async () => {
    if (!diagnosticInputData) return;
    setLoadingAI(true);
    try {
      const result = await generateEngineeringDiagnostic(diagnosticInputData);
      if (onApplyAIDiagnostic) {
        onApplyAIDiagnostic(result);
      }
      alert("Diagnóstico Pericial por IA e Engenharia gerado e aplicado ao laudo com sucesso!");
    } catch (err) {
      console.error("Erro ao gerar diagnóstico:", err);
      alert("Falha ao processar diagnóstico.");
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-4 text-white space-y-4 shadow-xl ${className}`}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              Gerenciador de Seções e Diagnóstico do Laudo
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono border border-amber-500/30">
                Ajuste PDF & Ordem
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Escolha quais seções aparecem no PDF, ordene-as livremente ou inclua novas seções personalizadas.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {diagnosticInputData && onApplyAIDiagnostic && (
            <button
              onClick={handleRunAI}
              disabled={loadingAI}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-lg shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {loadingAI ? (
                <Wand2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
              )}
              {loadingAI ? 'Analisando...' : 'Diagnóstico por IA'}
            </button>
          )}

          <button
            onClick={() => {
              setEditingCustomId(null);
              setCustomTitle('');
              setCustomContent('');
              setCustomImages([]);
              setShowCustomModal(true);
            }}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            + Nova Seção Customizada
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
          >
            {isOpen ? 'Ocultar Painel' : 'Configurar Seções (' + sections.filter(s => s.visible).length + '/' + sections.length + ')'}
          </button>
        </div>
      </div>

      {/* Expandable Section Order List */}
      {isOpen && (
        <div className="space-y-2 pt-1 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
          <p className="text-xs text-slate-400 mb-2 font-mono flex items-center justify-between">
            <span>Ordene as seções para alterar o fluxo do documento final:</span>
            <span className="text-amber-400">{sections.filter(s => s.visible).length} seções ativas</span>
          </p>

          <div className="space-y-1.5">
            {numberedSections.map((sec, idx) => (
              <div
                key={sec.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-all ${
                  sec.visible
                    ? 'bg-slate-800/80 border-slate-700 text-slate-200'
                    : 'bg-slate-900/50 border-slate-800/60 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Dynamic section number badge */}
                  <div
                    className={`w-12 text-center py-0.5 rounded font-mono text-[10px] font-bold ${
                      sec.computedNumber
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {sec.computedNumber ? `#${sec.computedNumber}` : 'CAPA'}
                  </div>

                  <span className="font-medium truncate max-w-[280px] sm:max-w-[420px]">
                    {sec.label}
                  </span>

                  {sec.isCustom && (
                    <span className="bg-blue-500/20 text-blue-300 text-[9px] font-mono px-2 py-0.5 rounded border border-blue-500/30">
                      Personalizada
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Custom section actions */}
                  {sec.isCustom && (
                    <>
                      <button
                        onClick={() => handleEditCustom(sec)}
                        title="Editar Seção Personalizada"
                        className="p-1 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCustom(sec.id)}
                        title="Excluir Seção"
                        className="p-1 hover:bg-rose-500/20 text-rose-400 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Up / Down buttons */}
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    title="Mover para cima"
                    className="p-1 hover:bg-slate-700 disabled:opacity-20 text-slate-300 rounded transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    title="Mover para baixo"
                    className="p-1 hover:bg-slate-700 disabled:opacity-20 text-slate-300 rounded transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle visibility */}
                  <button
                    onClick={() => handleToggleVisibility(sec.id)}
                    title={sec.visible ? 'Ocultar do PDF' : 'Exibir no PDF'}
                    className={`p-1.5 rounded transition-colors ${
                      sec.visible
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {sec.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal for Creating / Editing Custom Section */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold flex items-center gap-2 text-amber-400">
                <FileText className="w-5 h-5" />
                {editingCustomId ? 'Editar Seção Personalizada' : 'Incluir Nova Seção Personalizada'}
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Título da Seção *
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Ex: Análise de Vibração e Anomalias Complementares"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Conteúdo / Memorial Pericial em Texto
                </label>
                <textarea
                  rows={6}
                  value={customContent}
                  onChange={e => setCustomContent(e.target.value)}
                  placeholder="Digite os detalhes técnicos, observações de campo, referências adicionais ou ressalvas da inspeção..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-amber-400 font-sans leading-relaxed"
                />
              </div>

              {/* Images list for custom section */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Anexar Fotografias para esta Seção (Opcional)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={imageCaption}
                    onChange={e => setImageCaption(e.target.value)}
                    placeholder="Legenda da foto (ex: Trinca no cordão de solda)"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <label className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1 transition-colors">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Adicionar Foto
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {customImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {customImages.map((img, idx) => (
                      <div key={idx} className="relative group bg-slate-800 border border-slate-700 rounded-lg overflow-hidden p-1">
                        <img src={img.data} alt="Foto Custom" className="w-full h-24 object-cover rounded" />
                        <p className="text-[10px] text-slate-300 font-mono mt-1 truncate px-1">{img.caption || `Foto #${idx + 1}`}</p>
                        <button
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCustomSection}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Salvar Seção no Laudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
