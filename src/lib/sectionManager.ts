export interface CustomSection {
  id: string;
  title: string;
  content: string;
  images?: { data: string; caption?: string }[];
}

export interface SectionConfig {
  id: string; // unique key, e.g. "capa", "secao_1", "custom_1"
  label: string; // display name e.g. "Dados do Cliente e Objeto"
  visible: boolean;
  isCustom?: boolean;
  customData?: CustomSection;
}

export interface ReorderedSection extends SectionConfig {
  computedNumber: number | null; // 1, 2, 3... or null if cover/un-numbered
}

/**
 * Calculates dynamic numbering for visible sections in order.
 * Cover pages ("capa", "contracapa", "apresentacao", "sumario", "anexoArt") do not get section numbers.
 */
export function getNumberedSections(sections: SectionConfig[]): ReorderedSection[] {
  let counter = 1;
  const unnumberedKeys = new Set(['capa', 'contracapa', 'apresentacao', 'sumario', 'anexo', 'anexoArt']);

  return sections.map((sec) => {
    if (!sec.visible) {
      return { ...sec, computedNumber: null };
    }
    const isUnnumbered = unnumberedKeys.has(sec.id) || sec.id.toLowerCase().includes('capa') || sec.id.toLowerCase().includes('sumario');
    if (isUnnumbered) {
      return { ...sec, computedNumber: null };
    }
    const num = counter++;
    return { ...sec, computedNumber: num };
  });
}

/**
 * Helper to move section up or down in array
 */
export function moveSection(sections: SectionConfig[], index: number, direction: 'up' | 'down'): SectionConfig[] {
  const newArr = [...sections];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= newArr.length) return sections;
  
  const temp = newArr[index];
  newArr[index] = newArr[targetIndex];
  newArr[targetIndex] = temp;
  return newArr;
}

export function getStandardSectionsForReport(reportType: string): SectionConfig[] {
  return [
    { id: "capa", label: "Capa e Identificação Principal", visible: true },
    { id: "sumario", label: "Sumário Geral", visible: true },
    { id: "secao_1", label: "1. Introdução e Objetivo", visible: true },
    { id: "secao_2", label: "2. Dados da Emp. Contratante e Local", visible: true },
    { id: "secao_3", label: "3. Qualificação do Resp. Técnico", visible: true },
    { id: "secao_4", label: "4. Especificações do Equipamento / Ativo", visible: true },
    { id: "secao_5", label: "5. Documentação Técnica Analisada", visible: true },
    { id: "secao_6", label: "6. Normas Técnicas Aplicáveis", visible: true },
    { id: "secao_7", label: "7. Metodologia de Avaliação", visible: true },
    { id: "secao_8", label: "8. Registro Fotográfico de Campo", visible: true },
    { id: "secao_9", label: "9. Checklist de Conformidade", visible: true },
    { id: "secao_10", label: "10. Análise de Riscos e Não Conformidades", visible: true },
    { id: "secao_11", label: "11. Plano de Ação e Recomendações", visible: true },
    { id: "secao_12", label: "12. Parecer Conclusivo do Engenheiro", visible: true },
    { id: "secao_13", label: "13. Limitações Técnico-Periciais", visible: true },
    { id: "anexoArt", label: "Anexos e ART (CREA)", visible: true }
  ];
}
