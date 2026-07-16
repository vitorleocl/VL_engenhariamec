import React from "react";
import Logo from "../Logo";
import { PMOCChecklistItem, PMOCNaoConformidade, UploadedImage, INITIAL_PMOC_ACTIVITIES } from "./pmocData";
import { FileText } from "lucide-react";

interface PMOCReportPreviewProps {
  laudoParams: {
    laudoNumber: string;
    clientName: string;
    cnpj: string;
    address: string;
    bairro: string;
    city: string;
    uf: string;
    telefone: string;
    email: string;
    buildingType: string;
    climatizedArea: string;
    numEnvironments: string;
    estimatedUsers: string;
    refrigerantType: string;
    issueDate: string;
    validityDate: string;
    rtName: string;
    rtCrea: string;
    rtArt: string;
    notes: string;
  };
  checklist: PMOCChecklistItem[];
  environments: Array<{
    id: string;
    identificacao: string;
    numOcupantesFixo: string;
    numOcupantesFlutuante: string;
    areaM2: string;
    cargaTermica: string;
    tagEquipamento: string;
  }>;
  appliances: Array<{
    id: string;
    tag: string;
    marca: string;
    modelo: string;
    capacidade: string;
    localizacao: string;
    tipo: string;
    atividades: Array<{
      id: string;
      descricao: string;
      periodicidade: string;
      statusJan?: string;
      statusFev?: string;
      statusMar?: string;
      statusAbr?: string;
      statusMai?: string;
      statusJun?: string;
      statusJul?: string;
      statusAgo?: string;
      statusSet?: string;
      statusOut?: string;
      statusNov?: string;
      statusDez?: string;
    }>;
  }>;
  naoConformidades: PMOCNaoConformidade[];
  secoes: Record<string, string>;
  uploadedImages: UploadedImage[];
  reportRef: React.RefObject<HTMLDivElement | null>;
  blankPlanning?: boolean;
  artPdf?: { name: string; size: string; data: string } | null;
  visibleSections?: Record<string, boolean>;
}

const DETAILED_ACTIVITIES_TEMPLATE = [
  { text: "Inspeção geral na instalação do equipamento, curto circuito de ar, distribuição de insuflamento nas unidades, bloqueamento na entrada e saída de ar do condensador, unidade condensadora exposta à carga térmica.", col: "M" },
  { text: "Verificar instalação elétrica", col: "M" },
  { text: "Lavar e secar o filtro de ar (se necessário trocar)", col: "M" },
  { text: "Medir tensão e corrente de funcionamento e comparar com a nominal.", col: "M" },
  { text: "Verificar aperto de todos os terminais elétricos das unidades, evitar possíveis maus contatos", col: "M" },
  { text: "Verificar obstrução de sujeira e aletas amassadas", col: "M" },
  { text: "Verificar possíveis entupimentos ou amassamentos na mangueira do dreno.", col: "M" },
  { text: "Efetuar a limpeza das serpentinas do evaporador;", col: "T" },
  { text: "Efetuar a limpeza do ventilador/rotor do evaporador;", col: "T" },
  { text: "Efetuar a limpeza da bandeja de condensado;", col: "T" },
  { text: "Fazer limpeza dos gabinetes", col: "T" },
  { text: "Verificar pressão de funcionamento;", col: "S" },
  { text: "Efetuar a limpeza do condensador;", col: "S" },
  { text: "Verificar estado dos compressores;", col: "S" },
  { text: "Verificar operação do sensor de temperatura;", col: "S" },
  { text: "Verificar estado dos suportes/coxins e corrigir caso necessário;", col: "S" },
  { text: "Verificar posicionamento, fixação e balanceamento da hélice ou turbina;", col: "S" },
  { text: "Verificar e corrigir isolante térmico das linhas de cobre", col: "S" },
  { text: "Analise da Qualidade do Ar (Conforme a RES. /09);", col: "S" }
];

export default function PMOCReportPreview({
  laudoParams,
  checklist,
  environments,
  appliances,
  naoConformidades,
  secoes,
  uploadedImages,
  reportRef,
  blankPlanning = false,
  artPdf = null,
  visibleSections = {}
}: PMOCReportPreviewProps) {
  return (
    <div className="bg-slate-300 dark:bg-slate-950/80 p-4 md:p-8 min-h-screen flex justify-center overflow-x-auto print:p-0 print:bg-white">
      <div 
        ref={reportRef}
        id="pmoc-report-container"
        className="w-[210mm] min-h-[297mm] bg-white text-slate-900 shadow-2xl p-[15mm] md:p-[20mm] font-sans text-xs relative flex flex-col justify-between print:shadow-none print:p-0 print:w-full"
        style={{ boxSizing: "border-box" }}
      >
        {/* =========================================================================
            PAGE 1: CAPA
           ========================================================================= */}
        {visibleSections.capa !== false && (
          <div className="flex flex-col justify-between min-h-[255mm] border-4 border-slate-900 p-8 md:p-12 relative overflow-hidden page-break-after-always">
          <div className="flex justify-between items-center border-b-2 border-slate-950 pb-4">
            <div className="flex items-center gap-2">
              <Logo className="w-12 h-12 text-[#134074]" />
              <div>
                <span className="font-sans font-black text-lg tracking-wider text-[#134074]">VL ENGENHARIA</span>
                <p className="text-[8px] uppercase tracking-widest text-slate-500 font-mono">Consultoria & Laudos Técnicos</p>
              </div>
            </div>
            <div className="text-right font-mono text-[9px] text-slate-500">
              <p className="font-bold text-[#134074]">DOCUMENTO OFICIAL</p>
              <p>Nº {laudoParams.laudoNumber}</p>
            </div>
          </div>

          <div className="my-auto space-y-8 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#134074]/10 rounded-full text-[#134074] text-[9px] font-bold font-mono tracking-widest uppercase">
              Plano de Manutenção Preventiva Regulamentar
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-slate-950 font-sans uppercase">
              PMOC
            </h1>
            <h2 className="text-lg md:text-xl font-bold tracking-wide text-[#134074] uppercase font-sans border-t border-b border-slate-200 py-3">
              Plano de Manutenção, Operação e Controle
            </h2>
            <p className="text-slate-500 text-xs font-sans max-w-lg mx-auto">
              Estabelecido em estrito cumprimento à <strong>Lei Federal nº 13.589/2018</strong>, 
              à <strong>Portaria MS nº 3.523/1998</strong> do Ministério da Saúde e à 
              regulamentação <strong>RE nº 09/2003</strong> da ANVISA.
            </p>
          </div>

          <div className="space-y-6 border-t-2 border-slate-950 pt-6 font-sans">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">ESTABELECIMENTO:</p>
                <p className="font-bold text-slate-900 text-xs">{laudoParams.clientName}</p>
                <p className="text-slate-500 text-[10px]">{laudoParams.address}, {laudoParams.bairro}</p>
                <p className="text-slate-500 text-[10px]">{laudoParams.city} - {laudoParams.uf} | CNPJ: {laudoParams.cnpj}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">RESPONSÁVEL TÉCNICO ENGENHARIA:</p>
                <p className="font-bold text-slate-900 text-xs">{laudoParams.rtName}</p>
                <p className="text-slate-500 text-[10px]">CREA-PE: {laudoParams.rtCrea} | ART: {laudoParams.rtArt}</p>
                <p className="text-slate-500 text-[10px]">VL Engenharia Ltda</p>
              </div>
            </div>

            <div className="flex justify-between items-end pt-4 text-[9px] font-mono text-slate-400">
              <p>EMISSÃO: {laudoParams.issueDate}</p>
              <p>REVISÃO: 00</p>
              <p>VALIDADE: {laudoParams.validityDate}</p>
            </div>
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 2: CARTA DE APRESENTAÇÃO
           ========================================================================= */}
        {visibleSections.apresentacao !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">CARTA DE APRESENTAÇÃO</span>
              <span className="font-mono text-[9px] text-slate-400">PMOC - VL ENGENHARIA</span>
            </div>

            <div className="space-y-4 text-slate-700 leading-relaxed font-sans text-xs">
              <p className="text-right text-slate-500 font-mono">Recife, {laudoParams.issueDate}</p>
              
              <p>À Direção e Administração de <strong>{laudoParams.clientName}</strong>,</p>
              
              <p>
                Prezados Senhores,
              </p>
              
              <p>
                Temos a satisfação de apresentar e entregar o <strong>Plano de Manutenção, Operação e Controle (PMOC)</strong> 
                referente aos sistemas de climatização artificial instalados nas dependências de sua edificação, em atendimento 
                pleno à legislação nacional vigente estabelecida pela <strong>Lei nº 13.589 de 12 de janeiro de 2018</strong>.
              </p>
              
              <p>
                A VL Engenharia, sob a responsabilidade do Engenheiro Mecânico <strong>Vitor Leonardo C. Linhares</strong>, 
                conduziu as auditorias de campo, o levantamento termotécnico e a modelagem do plano preventivo constante neste documento. 
                Nossa atuação visa não apenas resguardar juridicamente o estabelecimento perante os órgãos de vigilância sanitária competentes (VISA), 
                mas primordialmente assegurar a integridade e saúde das pessoas que ocupam estes recintos, otimizando a qualidade do ar interior, 
                a durabilidade dos equipamentos de climatização e reduzindo o consumo de energia elétrica predial.
              </p>
              
              <p>
                Este plano detalha rigorosamente as rotinas mensais, trimestrais, semestrais e anuais de intervenção preventiva, higiene de filtros, 
                higienização biocida de serpentinas e controle de parâmetros. Os formulários e diários de bordo anexados deverão ser sistematicamente 
                assinados pelos técnicos executores, servindo como livro de registro obrigatório de disponibilidade imediata em fiscalizações.
              </p>
              
              <p>
                Colocamo-nos à inteira disposição para prestar quaisquer assessoria técnica, esclarecimentos adicionais e vistorias periciais subsequentes.
              </p>
              
              <p className="pt-4">Atenciosamente,</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-8 border-t border-slate-200">
            <div className="w-48 h-12 flex items-center justify-center border-b border-slate-900 font-mono text-[10px] text-slate-400">
              {/* Espaço de assinatura */}
              [ ASSINATURA DIGITAL DISPONÍVEL ]
            </div>
            <p className="font-bold text-slate-900 mt-2">{laudoParams.rtName}</p>
            <p className="text-slate-500 text-[10px] font-mono">Engenheiro Mecânico Responsável | CREA-PE: {laudoParams.rtCrea}</p>
            <p className="text-slate-400 text-[9px] font-mono">vitorleonardocl@gmail.com | (81) 98444-2592</p>
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 3: SUMÁRIO
           ========================================================================= */}
        {visibleSections.sumario !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SUMÁRIO DE SEÇÕES</span>
              <span className="font-mono text-[9px] text-slate-400">ESTRUTURA DO PMOC</span>
            </div>

            <div className="space-y-3 font-mono text-[10.5px] text-slate-700">
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 1: Introdução e Base Legal</span>
                <span className="font-bold">Pág. 04</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 2: Dados do Estabelecimento</span>
                <span className="font-bold">Pág. 04</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 3: Responsável pelo PMOC (VL Engenharia)</span>
                <span className="font-bold">Pág. 05</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 4: Inventário dos Sistemas de Climatização</span>
                <span className="font-bold">Pág. 05</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 5: Descrição Detalhada do Sistema</span>
                <span className="font-bold">Pág. 06</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 6: Parâmetros Físicos de Operação</span>
                <span className="font-bold">Pág. 06</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1 col-span-2">
                <span>SEÇÃO 7: Plano de Manutenção Preventiva por Componente</span>
                <span className="font-bold">Pág. 07</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 8: Cronograma Anual e Diário de Lançamento</span>
                <span className="font-bold">Pág. 08</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 9: Monitoramento de Qualidade de Ar Interior (QAI)</span>
                <span className="font-bold">Pág. 09</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 10: Diretrizes de Operação de Sistemas</span>
                <span className="font-bold">Pág. 09</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 11: Registros e Formulários de Manutenção</span>
                <span className="font-bold">Pág. 10</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 12: Resultados da Inspeção Sanitária e Checklist</span>
                <span className="font-bold">Pág. 11</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 13: Recomendações e Não Conformidades</span>
                <span className="font-bold">Pág. 12</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 14: Conclusão Pericial e Validade Legal</span>
                <span className="font-bold">Pág. 13</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 15: Limitações da Auditoria Técnica</span>
                <span className="font-bold">Pág. 13</span>
              </div>
              <div className="flex justify-between border-b border-dashed border-slate-200 pb-1">
                <span>SEÇÃO 16: Anexo Fotográfico Técnico de Campo</span>
                <span className="font-bold">Pág. 14</span>
              </div>
            </div>
          </div>

          <div className="bg-[#134074]/5 border border-[#134074]/15 p-4 rounded-xl text-slate-500 font-sans leading-relaxed">
            <h4 className="font-bold text-[#134074] uppercase text-[10px] mb-1">IMPORTANTE PARA FISCALIZAÇÃO:</h4>
            <p className="text-[10px]">
              O presente volume constitui o memorial do PMOC do estabelecimento, devendo ser mantido obrigatoriamente arquivado no local e de forma acessível a agentes da Vigilância Sanitária e do Ministério do Trabalho, acompanhado do respectivo recolhimento da ART de engenharia.
            </p>
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 4: INTRODUÇÃO, BASE LEGAL E DADOS DO ESTABELECIMENTO
           ========================================================================= */}
        {visibleSections.secoes1_2 !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SEÇÕES 1 & 2</span>
              <span className="font-mono text-[9px] text-slate-400">INTRODUÇÃO, BASE LEGAL E DADOS</span>
            </div>

            {/* SEÇÃO 1 */}
            <div className="space-y-2">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 1: INTRODUÇÃO E BASE LEGAL DO PMOC
              </h3>
              <p className="text-slate-700 leading-relaxed font-sans text-justify">
                {secoes.introducao || "Introdução técnica geral..."}
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 font-sans">
                <p className="font-bold text-slate-800 text-[10px]">ENQUADRAMENTOS LEGAIS E DISPOSITIVOS VIGENTES:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[10px]">
                  <li><strong>Lei Federal nº 13.589/2018:</strong> Torna compulsória a manutenção de sistemas de ar condicionado em edifícios públicos e privados de uso coletivo.</li>
                  <li><strong>Portaria MS nº 3.523/1998 (Ministério da Saúde):</strong> Regulamenta as rotinas de limpeza, parâmetros de higiene, sanidade física dos componentes e a obrigatoriedade do PMOC.</li>
                  <li><strong>Resolução RE nº 09/2003 (ANVISA):</strong> Estabelece os limites e métodos de ensaio para a Qualidade do Ar Interior (parâmetros microbiológicos e químicos).</li>
                  <li><strong>Normas Técnicas ABNT NBR 16401 (Partes 1, 2 e 3):</strong> Regulamentam as taxas de renovação de ar externo, conforto térmico e filtragem.</li>
                </ul>
              </div>
            </div>

            {/* SEÇÃO 2 */}
            <div className="space-y-2 pt-4">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 2: DADOS DO ESTABELECIMENTO DE USO COLETIVO
              </h3>
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 font-sans">
                <table className="w-full text-left border-collapse text-xs">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2.5 font-bold bg-slate-100 text-slate-700 w-44">Razão Social / Nome do Local</td>
                      <td className="p-2.5 text-slate-800">{laudoParams.clientName}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold bg-slate-100 text-slate-700">Inscrição CNPJ</td>
                      <td className="p-2.5 text-slate-800 font-mono">{laudoParams.cnpj}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold bg-slate-100 text-slate-700">Endereço Completo</td>
                      <td className="p-2.5 text-slate-800">{laudoParams.address}, {laudoParams.bairro}, {laudoParams.city} - {laudoParams.uf}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold bg-slate-100 text-slate-700">Atividade Predial / Tipo</td>
                      <td className="p-2.5 text-slate-800">{laudoParams.buildingType}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold bg-slate-100 text-slate-700">Área Climatizada Total</td>
                      <td className="p-2.5 text-slate-800 font-mono font-bold">{laudoParams.climatizedArea}</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold bg-slate-100 text-slate-700">Ambientes Climatizados</td>
                      <td className="p-2.5 text-slate-800 font-mono">{environments.length} cadastrados</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold bg-slate-100 text-slate-700">Número Estimado de Usuários</td>
                      <td className="p-2.5 text-slate-800">{laudoParams.estimatedUsers}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-3">
            Página 04 de 14 | PMOC Nº {laudoParams.laudoNumber} | VL Engenharia
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 5: DADOS DO RESPONSÁVEL E INVENTÁRIO DOS SISTEMAS
           ========================================================================= */}
        {visibleSections.secoes3_4_5 !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SEÇÕES 3 & 4</span>
              <span className="font-mono text-[9px] text-slate-400">RESPONSÁVEL TÉCNICO E INVENTÁRIO</span>
            </div>

            {/* SEÇÃO 3 */}
            <div className="space-y-2">
              <h3 className="font-black text-xs text-emerald-600 dark:text-emerald-500 uppercase font-mono border-l-4 border-emerald-500 pl-2">
                SEÇÃO 3: DADOS DA EMPRESA EMISSORA / RESPONSÁVEL PELO PMOC
              </h3>
              <p className="text-slate-700 font-sans text-justify">
                A responsabilidade técnica pela elaboração do Plano, orientação física de manutenção, controle de biocidas de higienização das serpentinas e acompanhamento de conformidade regulamentar compete à <strong>VL Engenharia</strong> sob a supervisão do perito credenciado:
              </p>
              
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-emerald-50/20 font-sans">
                <table className="w-full text-left border-collapse text-xs">
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="p-2 font-bold bg-emerald-100/40 text-slate-750 w-44">Responsável Técnico</td>
                      <td className="p-2 text-slate-850 font-bold">{laudoParams.rtName}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-emerald-100/40 text-slate-750">Registro CREA / UF</td>
                      <td className="p-2 text-slate-850 font-mono font-bold">{laudoParams.rtCrea}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-emerald-100/40 text-slate-750">ART de Engenharia Mecânica</td>
                      <td className="p-2 text-slate-850 font-mono">{laudoParams.rtArt}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-emerald-100/40 text-slate-750">E-mail de Contato</td>
                      <td className="p-2 text-slate-850 font-mono">{laudoParams.email}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-emerald-100/40 text-slate-750">Telefone de Atendimento</td>
                      <td className="p-2 text-slate-850 font-mono">{laudoParams.telefone}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* SEÇÃO 4 */}
            <div className="space-y-2 pt-4">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 4: INVENTÁRIO DOS EQUIPAMENTOS E SISTEMAS DE CLIMATIZAÇÃO
              </h3>
              <p className="text-slate-700 font-sans">
                Relação física detalhada e TAG de identificação de todos os condicionadores de ar mapeados e abrangidos pelas rotinas preventivas de engenharia:
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase font-mono text-[9px]">
                      <th className="p-2 w-14">TAG</th>
                      <th className="p-2">Tipo</th>
                      <th className="p-2">Fabricante</th>
                      <th className="p-2">Capacidade</th>
                      <th className="p-2">Localização Física</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {appliances.map((ap) => (
                      <tr key={ap.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2 font-bold font-mono text-slate-900">{ap.tag}</td>
                        <td className="p-2 text-slate-800">{ap.tipo}</td>
                        <td className="p-2 text-slate-800">{ap.marca} / {ap.modelo}</td>
                        <td className="p-2 font-mono text-slate-900">{ap.capacidade}</td>
                        <td className="p-2 text-slate-600">{ap.localizacao}</td>
                      </tr>
                    ))}
                    {appliances.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 italic">Nenhum equipamento cadastrado.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-3">
            Página 05 de 14 | PMOC Nº {laudoParams.laudoNumber} | VL Engenharia
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 6: DESCRIÇÃO DO SISTEMA E PARÂMETROS DE OPERAÇÃO
           ========================================================================= */}
        {visibleSections.secao6 !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SEÇÕES 5 & 6</span>
              <span className="font-mono text-[9px] text-slate-400">DESCRIÇÃO DO SISTEMA E PARÂMETROS</span>
            </div>

            {/* SEÇÃO 5 */}
            <div className="space-y-2">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 5: DESCRIÇÃO DO SISTEMA CLIMATIZADO
              </h3>
              <p className="text-slate-700 leading-relaxed font-sans text-justify">
                {secoes.sistemas_climatizacao || "Descrição técnica detalhada dos sistemas de expansão direta e central de fancoils instalados..."}
              </p>
              
              <div className="grid grid-cols-2 gap-3 font-sans text-[10px] text-slate-600 bg-slate-50 border border-slate-150 p-2.5 rounded-lg">
                <div>
                  <p className="font-bold text-slate-800">FLUÍDO REFRIGERANTE UTILIZADO:</p>
                  <p>{laudoParams.refrigerantType}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800">FILTROS INSTALADOS (MÍNIMO):</p>
                  <p>Filtros Sintéticos classe G3 / G4 e Filtros Finos F7 (Centrais)</p>
                </div>
              </div>
            </div>

            {/* SEÇÃO 6 */}
            <div className="space-y-2 pt-4">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 6: PARÂMETROS LEGAIS DE OPERAÇÃO E CONFORTO TÉRMICO
              </h3>
              <p className="text-slate-700 font-sans">
                Parâmetros físicos operacionais exigidos para sistemas de climatização em ambientes de uso coletivo para garantir condições sanitárias e de conforto:
              </p>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-750 font-bold uppercase font-mono text-[9px] border-b border-slate-200">
                      <th className="p-2">Parâmetro de Controle</th>
                      <th className="p-2 w-28 text-center">Valor Referência</th>
                      <th className="p-2 w-28 text-center">Faixa Aceitável</th>
                      <th className="p-2 w-32 text-center">Normativa Base</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-sans">
                    <tr>
                      <td className="p-2 font-bold text-slate-800">TBS (Temperatura Bulbo Seco)</td>
                      <td className="p-2 text-center font-mono">23°C a 26°C</td>
                      <td className="p-2 text-center font-mono">± 1,5°C</td>
                      <td className="p-2 text-center text-slate-500">ANVISA RE 09/2003</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-800">UR (Umidade Relativa)</td>
                      <td className="p-2 text-center font-mono">40% a 65%</td>
                      <td className="p-2 text-center font-mono">± 5%</td>
                      <td className="p-2 text-center text-slate-500">ANVISA RE 09/2003</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-800">CO2 (Dióxido de Carbono)</td>
                      <td className="p-2 text-center font-mono">&lt; 1.000 ppm</td>
                      <td className="p-2 text-center font-mono">Limite Máximo</td>
                      <td className="p-2 text-center text-slate-500">ANVISA RE 09/2003</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-800">Renovação de Ar Externo</td>
                      <td className="p-2 text-center font-mono">27 m³/h /pessoa</td>
                      <td className="p-2 text-center font-mono">conforme ocupação</td>
                      <td className="p-2 text-center text-slate-500">ABNT NBR 16401</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-800">Velocidade do Ar Insuflado</td>
                      <td className="p-2 text-center font-mono">&lt; 0,25 m/s</td>
                      <td className="p-2 text-center font-mono">Limite de Corrente</td>
                      <td className="p-2 text-center text-slate-500">ABNT NBR 16401</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold text-slate-800">Material Particulado (Poeiras)</td>
                      <td className="p-2 text-center font-mono">&lt; 80 µg/m³</td>
                      <td className="p-2 text-center font-mono">Monitoramento Anual</td>
                      <td className="p-2 text-center text-slate-500">ANVISA RE 09/2003</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-3">
            Página 06 de 14 | PMOC Nº {laudoParams.laudoNumber} | VL Engenharia
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 7: PLANO DE MANUTENÇÃO PREVENTIVA POR COMPONENTE
           ========================================================================= */}
        {visibleSections.secao7 !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SEÇÃO 7</span>
              <span className="font-mono text-[9px] text-slate-400">PLANO DE MANUTENÇÃO PREVENTIVA</span>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 7: PROTOCOLO PADRÃO DE MANUTENÇÃO PREVENTIVA
              </h3>
              <p className="text-slate-700 font-sans">
                Especificação exata das rotinas operacionais preventivas que devem ser executadas obrigatoriamente por técnicos qualificados para cada subsistema:
              </p>

              <div className="space-y-4 font-sans text-[10px]">
                {/* Filtros */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <span className="font-bold text-[#134074] uppercase">7.1 FILTROS DE AR</span>
                    <span className="font-mono text-[9px] bg-[#134074] text-white px-1.5 py-0.5 rounded font-bold uppercase">Mensal / Trimestral</span>
                  </div>
                  <p className="text-slate-650 leading-relaxed text-justify">
                    Inspecionar visualmente os filtros de ar das evaporadoras mensalmente. Efetuar limpeza a cada 30 dias (filtros classe G3/G4 de tela plástica) utilizando água e sabão neutro com secagem natural. Substituir filtros finos descartáveis (classe F7 superiores) semestralmente ou quando o diferencial de pressão atingir o limite recomendado do fabricante.
                  </p>
                </div>

                {/* Serpentinas */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <span className="font-bold text-[#134074] uppercase">7.2 SERPENTINAS EVAPORADORAS & BANDEJAS</span>
                    <span className="font-mono text-[9px] bg-[#134074] text-white px-1.5 py-0.5 rounded font-bold uppercase">Mensal / Semestral</span>
                  </div>
                  <p className="text-slate-650 leading-relaxed text-justify">
                    Verificar a serpentina e bacia de condensado mensalmente contra biofilmes ou lodos. Aplicar lavagem química semestral com detergente desincrustante específico e aplicação de biocida sanitizante VL Engenharia homologado para eliminar germes, fungos e bactérias e manter o dreno desimpedido.
                  </p>
                </div>

                {/* Condensadoras */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <span className="font-bold text-[#134074] uppercase">7.3 CONDENSADORAS & COMPRESSOR</span>
                    <span className="font-mono text-[9px] bg-[#134074] text-white px-1.5 py-0.5 rounded font-bold uppercase">Mensal / Semestral</span>
                  </div>
                  <p className="text-slate-650 leading-relaxed text-justify">
                    Inspecionar visualmente as serpentinas da unidade externa mensalmente contra folhagens ou poeiras. Realizar limpeza hidráulica pressurizada semestralmente. Medir mensalmente as pressões de sucção e descarga do compressor, checar corrente (amperagem) de motores e buscar vibrações mecânicas anômalas.
                  </p>
                </div>

                {/* Elétrica e Fluido */}
                <div className="border border-slate-200 rounded-lg p-3 space-y-1.5 bg-slate-50">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <span className="font-bold text-[#134074] uppercase">7.4 SISTEMA ELÉTRICO & FLUIDO REFRIGERANTE</span>
                    <span className="font-mono text-[9px] bg-[#134074] text-white px-1.5 py-0.5 rounded font-bold uppercase">Semestral / Anual</span>
                  </div>
                  <p className="text-slate-650 leading-relaxed text-justify">
                    Inspecionar quadros de força, reapertar bornes de contato e testar aterramento das carcaças semestralmente. Medir resistência de isolação de enrolamentos de motores anualmente. Monitorar vazamentos do fluído térmico ecológico semestralmente através de detector eletrônico de vazamentos.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-3">
            Página 07 de 14 | PMOC Nº {laudoParams.laudoNumber} | VL Engenharia
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 8: CRONOGRAMA ANUAL DE MANUTENÇÃO (PLANILHA DE LANÇAMENTO)
           ========================================================================= */}
        {visibleSections.secao8 !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SEÇÃO 8</span>
              <span className="font-mono text-[9px] text-slate-400">CRONOGRAMA ANUAL</span>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 8: CRONOGRAMA ANUAL E REGISTRO DE MANUTENÇÃO (MÊS A MÊS)
              </h3>
              <p className="text-slate-700 font-sans">
                Ficha operacional demonstrando as rotinas programadas (P) e executadas (E) durante o período de vigência técnica do PMOC para os principais equipamentos:
              </p>

              <div className="space-y-5 text-[9px]">
                {appliances.map((ap) => (
                  <div key={ap.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                    <div className="bg-slate-50 p-2 border-b border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-[#134074] font-mono">EQUIPAMENTO: {ap.tag} ({ap.localizacao} - {ap.tipo})</span>
                      <span className="text-[8px] bg-slate-200 font-bold font-mono px-2 py-0.5 rounded text-slate-600">CAPACIDADE: {ap.capacidade}</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-center border-collapse text-[8px] font-mono">
                        <thead>
                          <tr className="bg-slate-100/50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                            <th className="p-1.5 text-left w-48 font-sans text-[8.5px] text-slate-700">Atividades de Rotina</th>
                            <th className="p-1.5 w-10 border-r border-slate-200">Per.</th>
                            <th className="p-1">JAN</th>
                            <th className="p-1">FEV</th>
                            <th className="p-1">MAR</th>
                            <th className="p-1">ABR</th>
                            <th className="p-1">MAI</th>
                            <th className="p-1">JUN</th>
                            <th className="p-1">JUL</th>
                            <th className="p-1">AGO</th>
                            <th className="p-1">SET</th>
                            <th className="p-1">OUT</th>
                            <th className="p-1">NOV</th>
                            <th className="p-1">DEZ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {ap.atividades?.map((act) => (
                            <tr key={act.id} className="hover:bg-slate-55">
                              <td className="p-1.5 text-left font-sans text-slate-700 leading-snug">{act.descricao}</td>
                              <td className="p-1.5 text-center font-bold text-slate-500 border-r border-slate-200">{act.periodicidade.substring(0, 3)}.</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusJan === 'E' ? 'text-emerald-600 bg-emerald-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusJan || "P")}</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusFev === 'E' ? 'text-emerald-600 bg-emerald-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusFev || "P")}</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusMar === 'E' ? 'text-emerald-600 bg-emerald-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusMar || "P")}</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusAbr === 'E' ? 'text-emerald-600 bg-emerald-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusAbr || "P")}</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusMai === 'E' ? 'text-emerald-600 bg-emerald-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusMai || "P")}</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusJun === 'E' ? 'text-emerald-600 bg-emerald-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusJun || "P")}</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusJul === 'E' ? 'text-emerald-600 bg-emerald-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusJul || "P")}</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusAgo === 'E' ? 'text-emerald-600 bg-emerald-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusAgo || "P")}</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusSet === 'E' ? 'text-[#134074] bg-slate-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusSet || "P")}</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusOut === 'E' ? 'text-emerald-600 bg-emerald-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusOut || "P")}</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusNov === 'E' ? 'text-[#134074] bg-slate-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusNov || "P")}</td>
                              <td className={`p-1 font-bold ${!blankPlanning && act.statusDez === 'E' ? 'text-emerald-600 bg-emerald-50' : !blankPlanning ? 'text-blue-500' : ''}`}>{blankPlanning ? "\u00A0" : (act.statusDez || "P")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-3">
            Página 08 de 14 | PMOC Nº {laudoParams.laudoNumber} | VL Engenharia
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 9: MONITORAMENTO DE QAI E PROCEDIMENTOS OPERACIONAIS
           ========================================================================= */}
        {visibleSections.secoes9_10 !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SEÇÕES 9 & 10</span>
              <span className="font-mono text-[9px] text-slate-400">MONITORAMENTO DE QAI E OPERAÇÃO</span>
            </div>

            {/* SEÇÃO 9 */}
            <div className="space-y-2">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 9: MONITORAMENTO DA QUALIDADE DO AR INTERIOR (QAI)
              </h3>
              <p className="text-slate-700 leading-relaxed font-sans text-justify">
                {secoes.metodologia || "Descrição metodológica de monitoramento..."}
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1.5 font-sans text-[10px] text-slate-600">
                <p className="font-bold text-slate-800 uppercase text-[9.5px]">PROTOCOLO DE MONITORAMENTO EXIGIDO:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li><strong>Frequência de Análise:</strong> Mínimo de 01 vez ao ano (ou semestral para ocupação crítica).</li>
                  <li><strong>Parâmetros Microbiológicos:</strong> Contagem de colônias de fungos (razão ar interior/ar exterior &lt; 1,5) e pesquisa de patógenos.</li>
                  <li><strong>Ações de Alerta Sanitário:</strong> Em caso de não conformidade físico-química ou microbiológica, deve ser acionado isolamento de duto, limpeza de plenum e readequação imediata da tomada de ar de renovação.</li>
                </ul>
              </div>
            </div>

            {/* SEÇÃO 10 */}
            <div className="space-y-2 pt-4">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 10: PROCEDIMENTOS DE OPERAÇÃO DOS SISTEMAS
              </h3>
              
              <div className="space-y-2 text-slate-700 leading-relaxed font-sans text-xs">
                <p>
                  <strong>10.1 Procedimento de Partida e Parada:</strong> A partida inicial das unidades centrais (fancoils) deve anteceder a ocupação principal em 30 minutos para renovação e desinfecção inicial de ar viciado residual. A parada programada deve ocorrer 15 minutos após desocupação total das salas.
                </p>
                <p>
                  <strong>10.2 Ajustes e Setpoints de Temperatura:</strong> Os termostatos ambientais devem operar rigidamente travados na faixa térmica de conforto de <strong>23°C a 24°C</strong> de forma a proteger a integridade dos ocupantes e evitar cargas excessivas ao compressor de friagem.
                </p>
                <p>
                  <strong>10.3 Regime de Emergências Técnicas:</strong> Em caso de fumaça acidental, princípio de incêndio ou vazamentos pesados de fluídos mecânicos, os sistemas de ventilação artificial devem sofrer interrupção emergencial de painel e fechamento de dampers para contenção de gases.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-3">
            Página 09 de 14 | PMOC Nº {laudoParams.laudoNumber} | VL Engenharia
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 10: REGISTROS E FORMULÁRIOS OBRIGATÓRIOS (PRONTOS PARA USO)
           ========================================================================= */}
        {visibleSections.secao11 !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SEÇÃO 11</span>
              <span className="font-mono text-[9px] text-slate-400">REGISTROS E FORMULÁRIOS IMPRESSOS</span>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 11: FORMULÁRIO DE REGISTRO PREVENTIVO MENSAL (MODELO OFICIAL)
              </h3>
              <p className="text-slate-700 font-sans">
                Formulário físico modelo pronto para impressão e arquivamento manual no diário de manutenção física da casa de máquinas:
              </p>

              {/* Ficha Mensal */}
              <div className="border-2 border-slate-900 rounded-xl p-4 space-y-4 font-sans bg-white text-[9.5px]">
                <div className="flex justify-between items-center border-b border-slate-300 pb-2">
                  <span className="font-bold text-slate-900 text-xs">DIÁRIO DE BORDO: CONTROLE MENSAL PMOC</span>
                  <span className="font-mono text-[9px]">MÊS/ANO: _____/_____</span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-2">
                  <p><strong>ESTABELECIMENTO:</strong> {laudoParams.clientName}</p>
                  <p><strong>RESP. MANUTENÇÃO:</strong> ____________________________</p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-800">ITENS DE ROTINA OBRIGATÓRIOS VERIFICADOS (MARQUE COM X):</p>
                  <table className="w-full text-left border-collapse text-[9px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold">
                        <th className="p-1">Descrição do Item Mensal</th>
                        <th className="p-1 text-center w-12">SIM</th>
                        <th className="p-1 text-center w-12">NÃO</th>
                        <th className="p-1 text-center w-12">DATA</th>
                        <th className="p-1">ASSINATURA OPERADOR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {appliances.length > 0 ? (
                        appliances.flatMap((ap) => 
                          (ap.atividades || []).map((act, actIdx) => (
                            <tr key={`${ap.id}-${act.id || actIdx}`}>
                              <td className="p-1 font-sans text-slate-800">
                                <span className="font-bold text-[#134074]">[{ap.tag}]</span> {act.descricao} ({act.periodicidade})
                              </td>
                              <td className="p-1 text-center border-l border-r border-slate-200 font-mono text-[8px]">[  ]</td>
                              <td className="p-1 text-center border-r border-slate-200 font-mono text-[8px]">[  ]</td>
                              <td className="p-1 text-center border-r border-slate-200 font-mono text-[8.5px]">___/___</td>
                              <td className="p-1 font-mono text-[8.5px]">_________________________________</td>
                            </tr>
                          ))
                        )
                      ) : (
                        INITIAL_PMOC_ACTIVITIES.map((act, idx) => (
                          <tr key={act.id || idx}>
                            <td className="p-1 font-sans text-slate-800">
                              {idx + 1}. {act.descricao} ({act.periodicidade})
                            </td>
                            <td className="p-1 text-center border-l border-r border-slate-200 font-mono text-[8px]">[  ]</td>
                            <td className="p-1 text-center border-r border-slate-200 font-mono text-[8px]">[  ]</td>
                            <td className="p-1 text-center border-r border-slate-200 font-mono text-[8.5px]">___/___</td>
                            <td className="p-1 font-mono text-[8.5px]">_________________________________</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <p><strong>ANOTAÇÕES DE OCORRÊNCIAS / REPAROS CORRETIVOS:</strong></p>
                  <div className="h-10 border border-dashed border-slate-300 rounded mt-1 bg-slate-50/50"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-3">
            Página 10 de 14 | PMOC Nº {laudoParams.laudoNumber} | VL Engenharia
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 11: RESULTADOS DA INSPEÇÃO SANITÁRIA E CHECKLIST
           ========================================================================= */}
        {visibleSections.secao12 !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SEÇÃO 12</span>
              <span className="font-mono text-[9px] text-slate-400">CHECKLIST SANITÁRIO PMOC</span>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 12: AUDITORIA DE REQUISITOS SANITÁRIOS GERAIS
              </h3>
              <p className="text-slate-700 font-sans">
                Resultado detalhado dos 18 itens técnicos sanitários auditados em campo por meio da vistoria física executada na planta:
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-[9.5px] font-sans">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase font-mono text-[8.5px] border-b border-slate-200">
                      <th className="p-2 w-32">Subsistema / Foco</th>
                      <th className="p-2">Item Técnico Requisitado</th>
                      <th className="p-2 w-20 text-center">Status</th>
                      <th className="p-2">Nota / Observação Pericial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {checklist.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-1.5 font-bold text-[#134074]">{it.category}</td>
                        <td className="p-1.5 text-slate-800 leading-snug">{it.text}</td>
                        <td className="p-1.5 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-black border ${
                            it.status === 'OK' 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                              : it.status === 'NOK'
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-slate-100 text-slate-400 border-slate-200'
                          }`}>
                            {it.status}
                          </span>
                        </td>
                        <td className="p-1.5 text-slate-500 italic leading-snug">{it.nota}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-3">
            Página 11 de 14 | PMOC Nº {laudoParams.laudoNumber} | VL Engenharia
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 12: NÃO CONFORMIDADES IDENTIFICADAS E PLANO DE AÇÃO
           ========================================================================= */}
        {visibleSections.secao13 !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SEÇÃO 13</span>
              <span className="font-mono text-[9px] text-slate-400">NÃO CONFORMIDADES E PLANO DE AÇÃO</span>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 13: PLANO DE AÇÃO DE CORREÇÕES TÉCNICAS (CONFORME ISO 12100)
              </h3>
              <p className="text-slate-700 font-sans">
                Relação das irregularidades mecânicas ou sanitárias constatadas na auditoria física e suas respectivas ações e recomendações de regularização recomendadas pelo Engenheiro Responsável:
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-[9px] font-sans">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase font-mono text-[8px] border-b border-slate-200">
                      <th className="p-2 w-14">Ref</th>
                      <th className="p-2 w-28">Localização / Unidade</th>
                      <th className="p-2">Problema / Desvio Constatado</th>
                      <th className="p-2 w-28">Grau de Risco</th>
                      <th className="p-2">Ação Corretiva Recomendada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {naoConformidades.map((nc) => (
                      <tr key={nc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2 font-bold font-mono text-slate-900">{nc.id}</td>
                        <td className="p-2 font-bold text-[#134074]">{nc.equipamento}</td>
                        <td className="p-2 text-slate-800 leading-snug">{nc.problema}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[7.5px] font-mono font-black border ${
                            nc.prioridade === 'IMEDIATO' 
                              ? 'bg-red-55 text-red-600 border-red-200' 
                              : nc.prioridade === 'CURTO PRAZO'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : 'bg-blue-50 text-blue-600 border-blue-200'
                          }`}>
                            {nc.prioridade}
                          </span>
                          <p className="text-[8px] text-slate-400 mt-1">Normativa: {nc.norma}</p>
                        </td>
                        <td className="p-2 text-slate-700 leading-snug">{nc.recomendacao} <p className="text-[8px] text-[#134074] font-mono font-bold mt-1">Prazo: {nc.prazo} / {nc.responsavel}</p></td>
                      </tr>
                    ))}
                    {naoConformidades.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 italic">Nenhuma não conformidade cadastrada no sistema.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-3">
            Página 12 de 14 | PMOC Nº {laudoParams.laudoNumber} | VL Engenharia
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 13: CONCLUSÃO PERICIAL E VALIDADE LEGAL
           ========================================================================= */}
        {visibleSections.secao14 !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-after-always">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SEÇÕES 14 & 15</span>
              <span className="font-mono text-[9px] text-slate-400">CONCLUSÃO E VALIDADE DO PMOC</span>
            </div>

            {/* SEÇÃO 14 */}
            <div className="space-y-3">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 14: PARECER TÉCNICO CONCLUSIVO DE ENGENHARIA
              </h3>
              <p className="text-slate-700 leading-relaxed font-sans text-justify">
                {secoes.conclusao_text || "Conclusão técnica geral sobre as instalações e conformidade do PMOC perante os órgãos de fiscalização sanitária..."}
              </p>
              
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 text-emerald-800 font-sans space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-emerald-600 text-white font-mono font-black px-2 py-0.5 rounded">STATUS REGULAMENTAR: APROVADO</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  Declara-se em conformidade técnica e operacional de engenharia o Plano de Manutenção, Operação e Controle (PMOC) do estabelecimento para o período de 12 meses, contados a partir da data de sua emissão oficial.
                </p>
              </div>
            </div>

            {/* SEÇÃO 15 */}
            <div className="space-y-2 pt-4">
              <h3 className="font-black text-xs text-slate-500 uppercase font-mono border-l-4 border-slate-400 pl-2">
                SEÇÃO 15: LIMITAÇÕES E DIRETRIZES DA AUDITORIA
              </h3>
              <p className="text-slate-600 leading-relaxed font-sans text-justify text-[10px]">
                Este memorial técnico do PMOC foi elaborado com base exclusivamente na inspeção física visual e testes de funcionamento dinâmico estático das instalações na data de sua realização. Alterações no leiaute dos recintos, modificações de equipamentos de climatização por equipes não credenciadas, falta de assinatura de diários de manutenção periódica ou descumprimento das rotinas preventivas de filtros acarretam a invalidação técnica integral do parecer legal constante neste documento de engenharia.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center pt-8 border-t border-slate-200">
            <div className="w-48 h-12 flex items-center justify-center border-b border-slate-900 font-mono text-[10px] text-slate-400">
              [ CHAVE DIGITAL DE CERTIFICAÇÃO RT ]
            </div>
            <p className="font-bold text-slate-900 mt-2">{laudoParams.rtName}</p>
            <p className="text-slate-500 text-[10px] font-mono">Engenheiro Mecânico Responsável | CREA-PE: {laudoParams.rtCrea}</p>
            <p className="text-slate-400 text-[9px] font-mono">Próxima Revisão Compulsória: {laudoParams.validityDate}</p>
          </div>
        </div>
        )}

        {/* =========================================================================
            PAGE 14: ANEXOS (IMAGENS DE CAMPO)
           ========================================================================= */}
        {visibleSections.secao15 !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">SEÇÃO 16</span>
              <span className="font-mono text-[9px] text-slate-400">ANEXO FOTOGRÁFICO DE CAMPO</span>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                SEÇÃO 16: EVIDÊNCIAS VISUAIS DE SEGURANÇA E OPERAÇÃO
              </h3>
              <p className="text-slate-700 font-sans">
                Registros fotográficos obtidos em campo para diagnóstico pericial do estado de higienização das serpentinas, integridade física de filtros e conexões mecânicas:
              </p>

              {/* Photos grid */}
              <div className="grid grid-cols-2 gap-4">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-2.5 space-y-2 bg-slate-50 flex flex-col justify-between">
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-250 flex items-center justify-center relative">
                      <img 
                        src={img.data} 
                        alt={img.name} 
                        className="object-cover w-full h-full"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="font-mono text-[8px] font-bold text-[#134074] block uppercase">REGISTRO FOTO {String(idx + 1).padStart(2, '0')}</span>
                      <p className="text-[9px] text-slate-600 italic leading-snug">{img.description}</p>
                    </div>
                  </div>
                ))}
                {uploadedImages.length === 0 && (
                  <div className="col-span-2 py-12 border-2 border-dashed border-slate-350 rounded-2xl flex flex-col items-center justify-center text-slate-400 font-mono italic p-6">
                    Nenhuma foto anexada ao relatório. Faça upload de fotos na aba de parâmetros para que sejam exibidas oficialmente nesta seção de Anexos.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-3">
            Página 14 de 14 | PMOC Nº {laudoParams.laudoNumber} | VL Engenharia | FIM DO MEMORIAL
          </div>
        </div>
        )}

        {/* =========================================================================
            DETAILED PLAN AND CONTROL SHEETS PER APPLIANCE
           ========================================================================= */}
        {visibleSections.fichasIndividuais !== false && appliances.map((ap, idx) => (
          <div key={`sheet-${ap.id}`} className="min-h-[255mm] flex flex-col justify-between py-6 page-break-before-always font-sans text-[10px]">
            <div className="space-y-3">
              {/* Page Title & Appliance Info */}
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-2">
                <div className="flex items-center gap-1.5">
                  <Logo className="w-8 h-8 text-[#134074]" />
                  <div>
                    <span className="font-sans font-black text-xs tracking-wider text-[#134074]">VL ENGENHARIA</span>
                    <p className="text-[7px] uppercase font-mono text-slate-400">PMOC - Plano de Manutenção Individual</p>
                  </div>
                </div>
                <div className="text-right font-mono text-[8px] text-slate-500">
                  <p className="font-bold text-[#134074] text-[9px]">FICHA INDIVIDUAL DE CONTROLE</p>
                  <p className="text-[10px]">TAG: <span className="font-bold text-slate-900 text-xs">{ap.tag}</span></p>
                </div>
              </div>

              {/* Title Block */}
              <div className="bg-[#134074] text-white p-1.5 text-center uppercase tracking-wider text-[11px] font-black rounded">
                PLANO DE MANUTENÇÃO E CONTROLE
              </div>

              {/* Appliance Metadata Table */}
              <div className="grid grid-cols-4 gap-2 text-[9px] bg-slate-50 border border-slate-200 p-2 rounded">
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase font-mono">TAG DO EQUIPAMENTO</p>
                  <p className="font-bold text-slate-900 font-mono text-xs">{ap.tag}</p>
                </div>
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase font-mono">FABRICANTE / MODELO</p>
                  <p className="font-bold text-slate-900 truncate">{ap.marca} / {ap.modelo || "S/M"}</p>
                </div>
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase font-mono">CAPACIDADE / TIPO</p>
                  <p className="font-bold text-slate-900">{ap.capacidade} ({ap.tipo})</p>
                </div>
                <div>
                  <p className="text-[7.5px] font-bold text-slate-400 uppercase font-mono">LOCALIZAÇÃO FÍSICA</p>
                  <p className="font-bold text-slate-900 truncate">{ap.localizacao}</p>
                </div>
              </div>

              <p className="text-[8.5px] italic text-slate-500 font-bold leading-none">
                Atividades conforme estabelecido na norma NBR 13971, Resolução n° 09 e Portaria MS- n° 3523
              </p>

              {/* The Activities Table */}
              <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left border-collapse text-[8px] font-sans">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[7px]">
                      <th className="p-1 px-1.5">ATIVIDADES (MENSAL / TRIMESTRAL / SEMESTRAL)</th>
                      <th className="p-1 w-10 text-center border-l border-slate-200">M</th>
                      <th className="p-1 w-10 text-center border-l border-slate-200">T</th>
                      <th className="p-1 w-10 text-center border-l border-slate-200">S</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 leading-tight">
                    {(ap.atividades || []).length > 0 ? (
                      ap.atividades.map((act, index) => {
                        const isMensal = act.periodicidade === "Mensal" || act.periodicidade === "M" || (act as any).col === "M";
                        const isTrimestral = act.periodicidade === "Trimestral" || act.periodicidade === "T" || (act as any).col === "T";
                        const isSemestral = act.periodicidade === "Semestral" || act.periodicidade === "S" || (act as any).col === "S";
                        return (
                          <tr key={index} className="hover:bg-slate-50/50">
                            <td className="p-0.5 px-1.5 text-slate-800 font-medium">
                              {act.descricao}
                            </td>
                            <td className="p-0.5 text-center font-black text-emerald-600 border-l border-slate-200 bg-slate-50/20 text-[8.5px]">
                              {blankPlanning ? "\u00A0" : (isMensal ? "X" : "")}
                            </td>
                            <td className="p-0.5 text-center font-black text-[#134074] border-l border-slate-200 bg-slate-50/20 text-[8.5px]">
                              {blankPlanning ? "\u00A0" : (isTrimestral ? "X" : "")}
                            </td>
                            <td className="p-0.5 text-center font-black text-blue-600 border-l border-slate-200 bg-slate-50/20 text-[8.5px]">
                              {blankPlanning ? "\u00A0" : (isSemestral ? "X" : "")}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      DETAILED_ACTIVITIES_TEMPLATE.map((act, index) => (
                        <tr key={index} className="hover:bg-slate-50/50">
                          <td className="p-0.5 px-1.5 text-slate-800 font-medium">
                            {act.text}
                          </td>
                          <td className="p-0.5 text-center font-black text-emerald-600 border-l border-slate-200 bg-slate-50/20 text-[8.5px]">
                            {blankPlanning ? "\u00A0" : (act.col === "M" ? "X" : "")}
                          </td>
                          <td className="p-0.5 text-center font-black text-[#134074] border-l border-slate-200 bg-slate-50/20 text-[8.5px]">
                            {blankPlanning ? "\u00A0" : (act.col === "T" ? "X" : "")}
                          </td>
                          <td className="p-0.5 text-center font-black text-blue-600 border-l border-slate-200 bg-slate-50/20 text-[8.5px]">
                            {blankPlanning ? "\u00A0" : (act.col === "S" ? "X" : "")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Section: CONTROLE DAS MANUTENÇÕES */}
              <div className="space-y-1 pt-1">
                <h4 className="font-black text-[8px] text-slate-900 uppercase font-mono tracking-wider border-b pb-0.5">
                  CONTROLE DAS MANUTENÇÕES (REGISTRO EXECUTIVO MANUAL)
                </h4>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-[7.5px] font-mono">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[7px]">
                        <th className="p-0.5 px-1.5 w-24">MÊS/ANO</th>
                        <th className="p-0.5 w-36 border-l border-slate-200">REALIZADA EM:</th>
                        <th className="p-0.5 border-l border-slate-200">TÉCNICO RESP.</th>
                        <th className="p-0.5 border-l border-slate-200 w-44">ASSINATURA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[1, 2, 3].map((row) => (
                        <tr key={row} className="h-5">
                          <td className="p-0.5 px-1.5 border-r border-slate-200 font-bold text-slate-300">_____ / _____</td>
                          <td className="p-0.5 border-r border-slate-200 font-bold text-slate-300">____/____/____</td>
                          <td className="p-0.5 border-r border-slate-200"></td>
                          <td className="p-0.5"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section: OCORRÊNCIAS EM SITUAÇÕES DE FALHA E OUTRAS EMERGÊNCIAS */}
              <div className="space-y-1">
                <h4 className="font-black text-[8px] text-slate-900 uppercase font-mono tracking-wider border-b pb-0.5">
                  OCORRÊNCIAS EM SITUAÇÕES DE FALHA DO EQUIPAMENTO E OUTRAS EMERGÊNCIAS
                </h4>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-[7.5px] font-mono">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[7px]">
                        <th className="p-0.5 px-1.5 w-32">DATA</th>
                        <th className="p-0.5 border-l border-slate-200">DESCRIÇÃO DO PROBLEMA E SOLUÇÃO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[1, 2].map((row) => (
                        <tr key={row} className="h-5">
                          <td className="p-0.5 px-1.5 border-r border-slate-200 font-bold text-slate-300">____/____/____</td>
                          <td className="p-0.5"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Signatures & Footer block at bottom of the page */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4 text-[8px]">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">
                    RESPONSÁVEL TÉCNICO MANUTENÇÃO: <span className="font-normal text-slate-400">______________________________________</span>
                  </p>
                  <p className="font-bold text-slate-800">
                    ASSINATURA: <span className="font-normal text-slate-400">___________________________________________________</span>
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">
                    RESPONSÁVEL TÉCNICO( PH): <span className="font-normal text-slate-400">__________________________________________</span>
                  </p>
                  <p className="font-bold text-slate-800">
                    ASSINATURA: <span className="font-normal text-slate-400">___________________________________________________</span>
                  </p>
                </div>
              </div>

              <div className="text-center font-mono text-[7px] text-slate-400 pt-1 flex justify-between">
                <span>Anexo A • Ficha Técnica de Campo: {ap.tag} | PMOC Nº {laudoParams.laudoNumber}</span>
                <span>VL Engenharia • Responsabilidade Técnica: Vitor Leonardo</span>
              </div>
            </div>
          </div>
        ))}

        {/* =========================================================================
            ART PDF ATTACHMENT PAGE
           ========================================================================= */}
        {visibleSections.anexoArt !== false && (
          <div className="min-h-[255mm] flex flex-col justify-between py-6 page-break-before-always font-sans">
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <span className="font-sans font-black text-sm tracking-widest text-[#134074]">ANEXO DE ENGENHARIA</span>
              <span className="font-mono text-[9px] text-slate-400">ART DE RESPONSABILIDADE TÉCNICA</span>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-xs text-[#134074] uppercase font-mono border-l-4 border-[#134074] pl-2">
                ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)
              </h3>
              <p className="text-slate-700 font-sans text-xs">
                Em estrita obediência à <strong>Lei Federal nº 6.496/1977</strong>, apresenta-se a ART correspondente a este memorial do PMOC, formalmente registrada perante o Conselho Regional de Engenharia e Agronomia (CREA-PE).
              </p>

              {artPdf ? (
                <div className="border-2 border-dashed border-red-200 rounded-2xl p-8 bg-red-50/5 text-center space-y-4 mt-8">
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-bold text-slate-900 font-sans">Documento PDF Anexado com Sucesso</p>
                    <p className="text-xs text-slate-500 font-mono">Nome do arquivo: {artPdf.name}</p>
                    <p className="text-xs text-slate-400 font-mono">Tamanho: {artPdf.size} | Status: Integrado ao PDF de Impressão</p>
                  </div>
                  
                  <div className="max-w-md mx-auto p-4 bg-white border border-slate-200 rounded-xl shadow-xs text-left text-[9px] text-slate-600 font-mono space-y-1">
                    <p className="font-bold text-slate-800 uppercase text-[8px]">Metadados de Autenticidade da ART:</p>
                    <p>• Número de Registro: <span className="font-bold text-slate-950">{laudoParams.rtArt}</span></p>
                    <p>• Responsável Técnico: <span className="font-bold text-slate-950">{laudoParams.rtName}</span></p>
                    <p>• CREA de Origem: <span className="font-bold text-slate-950">{laudoParams.rtCrea}</span></p>
                    <p>• Certificado de Validade: <span className="font-bold text-emerald-600">ATIVO & VINCULADO</span></p>
                  </div>

                  {/* PDF preview inside frame if base64 pdf is available */}
                  {artPdf.data.startsWith("data:application/pdf") && (
                    <div className="pt-4 print:hidden">
                      <object 
                        data={artPdf.data} 
                        type="application/pdf" 
                        className="w-full h-[120mm] rounded-xl border border-slate-200 shadow-sm"
                      >
                        <p className="text-xs text-slate-400">Seu navegador não consegue pré-visualizar este PDF de forma embutida, mas ele será integrado e impresso corretamente.</p>
                      </object>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 font-mono italic space-y-3">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-600">Nenhum arquivo PDF de ART anexado.</p>
                    <p className="text-[10px] text-slate-400 font-sans leading-relaxed">Você pode anexar a ART em PDF na primeira aba (Estabelecimento & RT) para que os dados do arquivo e a pré-visualização apareçam automaticamente aqui.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="text-center text-[9px] font-mono text-slate-400 border-t border-slate-200 pt-3 flex justify-between print:pt-2">
            <span>Anexo B • ART de Climatização</span>
            <span>PMOC Nº {laudoParams.laudoNumber} | FIM DO DOCUMENTO</span>
          </div>
        </div>
        )}

      </div>
    </div>
  );
}
