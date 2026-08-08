import { LaudoTemplate, TemplateSection } from '../types/laudoTemplate';

/**
 * Replace placeholder variables like {{nome_cliente}} in a string or html
 */
export function replaceVariables(content: string, variables: Record<string, string>): string {
  if (!content) return '';
  let result = content;
  Object.entries(variables).forEach(([key, val]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    result = result.replace(regex, val || '');
  });
  return result;
}

/**
 * Default pre-written template library (Banco de Laudos-Modelo)
 * 100% aligned with the 15 real AI models of VL Engenharia
 */
export const DEFAULT_TEMPLATES_BANK: LaudoTemplate[] = [
  // 1. SINISTRO VEICULAR / RECLASSIFICAÇÃO DE MONTA
  {
    id: 'tpl_sinistro_veicular',
    title: 'Laudo de Avaliação Técnica de Sinistro e Monta Veicular',
    category: 'sinistro',
    description: 'Laudo técnico pericial para constatação de danos em veículos automotores e motocicletas em decorrência de sinistro (Resolução CONTRAN 810/2020 e 544/2015).',
    iconName: 'Car',
    version: 1,
    variables: {
      nome_cliente: 'DIOVANE MARQUES FAGUNDES',
      documento_cliente: 'CPF/CNPJ n.º 028.043.810-99',
      curso: 'Engenharia Mecânica',
      instituicao: 'Universidade Federal de Pernambuco - UFPE',
      cpf_engenheiro: '054.321.987-00',
      numero_registro: '1822299490',
      uf: 'PE',
      nome_engenheiro: 'Vitor Leonardo Cordeiro Linhares',
      formacao_titulo: 'Engenheiro Mecânico',
      tipo_veiculo: 'Motocicleta / Passageiro',
      data_sinistro: '23/04/2026',
      hora_sinistro: '18:30',
      local_sinistro: 'Rodovia BR-293, KM 95,0 - Pinheiro Machado / RS',
      marca_veiculo: 'YAMAHA',
      modelo_veiculo: 'YZF R3',
      especie: 'Passageiro',
      placa: 'IXU-2683',
      renavam: '1114897407',
      chassi: '9C6RH0910H0002614',
      cor: 'Cinza',
      combustivel: 'Gasolina',
      ano_fabricacao: '2017',
      ano_modelo: '2017',
      resolucao_contran: 'Resolução CONTRAN n.º 544/2015, Anexo II (e Resolução CONTRAN n.º 810/2020)',
      total_pecas_danificadas: '01 Peça Com Avarias Leves',
      classificacao_dano: 'DANO DE PEQUENA MONTA',
      numero_art: 'PE202609161747',
      numero_folhas: '05 (cinco)',
      cidade_emissao: 'Recife - PE',
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      telefone_empresa: '(81) 99876-5432',
      email_empresa: 'contato@vlengenharis.com.br'
    },
    sections: [
      {
        id: 'sec_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a; margin-bottom: 8px;">LAUDO DE AVALIAÇÃO TÉCNICA E PERÍCIA DE SINISTRO VEICULAR</h1>
  <p style="font-size: 11pt; color: #475569; font-weight: 600;">CONSTATAÇÃO DE DANOS / RESOLUÇÃO CONTRAN N.º 544/2015 E N.º 810/2020</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>DESTINATÁRIO / CLIENTE:</strong> {{nome_cliente}}</p>
    <p><strong>DOCUMENTO:</strong> {{documento_cliente}}</p>
    <p><strong>VEÍCULO:</strong> {{marca_veiculo}} {{modelo_veiculo}} — PLACA {{placa}}</p>
    <p><strong>RENAVAM:</strong> {{renavam}} | <strong>CHASSI:</strong> {{chassi}}</p>
    <p><strong>RESPONSÁVEL TÉCNICO:</strong> {{nome_engenheiro}} ({{formacao_titulo}} CREA/CAU-{{uf}} {{numero_registro}})</p>
    <p><strong>ART N.º:</strong> {{numero_art}}</p>
    <p><strong>DATA DE EMISSÃO:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_carta',
        title: 'CARTA DE APRESENTAÇÃO',
        enabled: true,
        order: 2,
        contentType: 'carta_apresentacao',
        htmlContent: `<p>À/Ao <strong>{{nome_cliente}}</strong> ({{documento_cliente}})</p>
<p>Prezado(a) Senhor(a),</p>
<p>Apresentamos o presente <strong>Laudo de Avaliação Técnica Pericial</strong> referente ao veículo <strong>{{marca_veiculo}} {{modelo_veiculo}}</strong>, Placa <strong>{{placa}}</strong>, de sua propriedade, envolvido em evento de sinistro em {{data_sinistro}}.</p>
<p>Este trabalho técnico compreendeu a realização de vistoria física detalhada, registros fotográficos periciais, conferência de componentes estruturais e enquadramento regulatório com base nas Resoluções CONTRAN n.º 544/2015 e n.º 810/2020.</p>
<p>Colocamo-nos à inteira disposição para quaisquer esclarecimentos adicionais necessários.</p>
<p style="margin-top: 20px;">Atenciosamente,</p>
<p><strong>{{nome_engenheiro}}</strong><br>{{formacao_titulo}} CREA/CAU-{{uf}} {{numero_registro}}</p>`
      },
      {
        id: 'sec_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 3,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_destinatario_qualificacao',
        title: 'DESTINATÁRIO E QUALIFICAÇÃO DO RESPONSÁVEL TÉCNICO',
        enabled: true,
        order: 4,
        contentType: 'text',
        htmlContent: `<p><strong>À</strong><br><strong style="font-size: 13pt; color: #0f172a;">{{nome_cliente}}</strong><br>{{documento_cliente}}</p>
<div style="margin-top: 15px; background: #f8fafc; padding: 12px; border-left: 4px solid #0f172a; border-radius: 4px;">
  <p style="margin: 0;"><strong>QUALIFICAÇÃO DO RESPONSÁVEL TÉCNICO:</strong><br>
  <strong>{{nome_engenheiro}}</strong>, graduado em {{curso}} pela {{instituicao}}, inscrito no CPF n.º {{cpf_engenheiro}}, registro no CREA/CAU-{{uf}} sob n.º {{numero_registro}}.</p>
</div>`
      },
      {
        id: 'sec_titulo_laudo',
        title: 'TÍTULO DO LAUDO',
        enabled: true,
        order: 5,
        contentType: 'text',
        htmlContent: `<div style="text-align: center; margin: 15px 0;">
  <h2 style="font-size: 16pt; font-weight: bold; color: #0f172a; margin: 0;">LAUDO DE AVALIAÇÃO TÉCNICA</h2>
  <h3 style="font-size: 12pt; font-weight: bold; color: #334155; margin-top: 4px;">REFERENTE A CONSTATAÇÃO DE DANOS CAUSADOS A VEÍCULO AUTOMOTOR EM DECORRÊNCIA DE SINISTRO</h3>
</div>`
      },
      {
        id: 'sec_historico',
        title: 'SEÇÃO I – HISTÓRICO',
        enabled: true,
        order: 6,
        contentType: 'text',
        htmlContent: `<p>Trata-se de um sinistro, ocorrido em um veículo automotor, tipo <strong>{{tipo_veiculo}}</strong>, no dia <strong>{{data_sinistro}}</strong>, às <strong>{{hora_sinistro}}</strong> horas, na <strong>{{local_sinistro}}</strong>.</p>`
      },
      {
        id: 'sec_objetivo',
        title: 'SEÇÃO II – OBJETIVO DO TRABALHO',
        enabled: true,
        order: 7,
        contentType: 'text',
        htmlContent: `<p>O presente trabalho técnico pericial tem por objetivo a inspeção física detalhada, avaliação visual e dimensional de deformações, medições de integridade de componentes estruturais e constatação minuciosa de danos causados ao veículo automotor em decorrência do sinistro supracitado, visando fundamentar o enquadramento do montante de avarias segundo os critérios normativos em vigor.</p>`
      },
      {
        id: 'sec_dados_veiculo',
        title: 'SEÇÃO III – DADOS DO VEÍCULO',
        enabled: true,
        order: 8,
        contentType: 'vehicle_specs',
        htmlContent: `<p>Veículo inspecionado: Marca <strong>{{marca_veiculo}}</strong>, Modelo <strong>{{modelo_veiculo}}</strong>, Espécie <strong>{{especie}}</strong>, Tipo <strong>{{tipo_veiculo}}</strong>, Placa <strong>{{placa}}</strong>, RENAVAM <strong>{{renavam}}</strong>, Chassi N.º <strong>{{chassi}}</strong>, Cor <strong>{{cor}}</strong>, Combustível <strong>{{combustivel}}</strong>, Ano de Fabricação <strong>{{ano_fabricacao}}</strong>, Ano Modelo <strong>{{ano_modelo}}</strong>.</p>`
      },
      {
        id: 'sec_fotos',
        title: 'SEÇÃO IV – REGISTROS FOTOGRÁFICOS PRINCIPAIS',
        enabled: true,
        order: 9,
        contentType: 'photos',
        photos: [],
        htmlContent: `<p>Registros fotográficos do veículo vistoriado, organizados com identificação do ângulo e legenda informativa:</p>`
      },
      {
        id: 'sec_legislacao',
        title: 'SEÇÃO V – LEGISLAÇÃO',
        enabled: true,
        order: 10,
        contentType: 'text',
        htmlContent: `<p>A presente avaliação pericial pauta-se rigorosamente na legislação trânsito-veicular vigente, em especial na <strong>{{resolucao_contran}}</strong>, que estabelece os critérios técnicos padronizados para classificação de danos decorrentes de acidentes e definição de monta veicular.</p>`
      },
      {
        id: 'sec_constatacao_danos',
        title: 'SEÇÃO VI – CONSTATAÇÃO DE DANOS',
        enabled: true,
        order: 11,
        contentType: 'text',
        htmlContent: `<p>Itemização detalhada dos componentes vistoriados no veículo:</p>
<ol style="margin-left: 20px; line-height: 1.8;">
  <li><strong>Garfo Dianteiro / Suspensão:</strong> Não apresenta deformações ou danos estruturais, mantendo alinhamento original (vide Fotos de Vistoria).</li>
  <li><strong>Carenagens e Pintura Lateral:</strong> Apresenta ranhuras e escoriações superficiais decorrentes de atrito com o solo.</li>
  <li><strong>Manete e Guidão:</strong> Leve desalinhamento corrigível sem necessidade de substituição estrutural.</li>
  <li><strong>Sistema de Freios e Discos:</strong> Preservados e operacionais, sem trincas nem vazamentos de fluido hidráulico.</li>
  <li><strong>Chassi / Quadro Principal:</strong> Inspeção dimensional não constatou torção nem fissuras de solda.</li>
</ol>`
      },
      {
        id: 'sec_tabela_danos',
        title: 'SEÇÃO VII – TABELA DE CONSTATAÇÃO DE DANOS',
        enabled: true,
        order: 12,
        contentType: 'text',
        htmlContent: `<table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10pt;">
  <thead>
    <tr style="background-color: #0f172a; color: white;">
      <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 8%;">Item</th>
      <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Nome da Peça / Componente</th>
      <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 12%;">SIM (Danificado)</th>
      <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 12%;">NÃO (Íntegro)</th>
      <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; width: 12%;">N/A</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">01</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px;">Quadro / Chassi Estrutural</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">—</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; color: #047857;">X</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">—</td>
    </tr>
    <tr style="background-color: #f8fafc;">
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">02</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px;">Garfo / Coluna de Direção</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">—</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; color: #047857;">X</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">—</td>
    </tr>
    <tr>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">03</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px;">Carenagem Lateral Esquerda / Ranhuras</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; color: #b91c1c;">X</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">—</td>
      <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">—</td>
    </tr>
  </tbody>
  <tfoot>
    <tr style="background-color: #f1f5f9; font-weight: bold;">
      <td colspan="2" style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">TOTAL GERAL:</td>
      <td colspan="3" style="border: 1px solid #cbd5e1; padding: 8px; text-align: center; color: #0f172a;">{{total_pecas_danificadas}}</td>
    </tr>
  </tfoot>
</table>`
      },
      {
        id: 'sec_conclusao',
        title: 'SEÇÃO VIII – CONCLUSÃO',
        enabled: true,
        order: 13,
        contentType: 'text',
        htmlContent: `<p>Face ao exposto e fundamentado nas análises técnicas e periciais executadas no veículo, concluo que as avarias verificadas restringem-se a componentes estéticos de acabamento, sem comprometimento da geometria estrutural do conjunto, enquadrando-se juridicamente em: <strong style="font-size: 12pt; color: #047857;">{{classificacao_dano}}</strong>, nos termos da norma infralegal aplicável.</p>`
      },
      {
        id: 'sec_consideracoes_finais',
        title: 'SEÇÃO IX – CONSIDERAÇÕES FINAIS',
        enabled: true,
        order: 14,
        contentType: 'text',
        htmlContent: `<p>Acompanha o presente laudo de avaliação técnica, a Anotação de Responsabilidade Técnica – ART n.º <strong>{{numero_art}}</strong>.</p>
<p>E, para que conste, lavrei o presente documento, impresso em <strong>{{numero_folhas}}</strong> folhas, todas de um só lado, rubricadas e assinada esta última.</p>
<p style="margin-top: 15px; font-weight: bold; text-align: right;">{{cidade_emissao}}, {{data_emissao}}.</p>`
      },
      {
        id: 'sec_art_doc',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 15,
        contentType: 'art_attachment',
        artData: {
          fileName: 'ART_CREA_PE_202609161747.pdf',
          uploadedAt: new Date().toLocaleDateString('pt-BR')
        },
        htmlContent: `<p>Abaixo consta a Anotação de Responsabilidade Técnica (ART N.º {{numero_art}}) vinculada e homologada junto ao CREA-{{uf}}.</p>`
      },
      {
        id: 'sec_assinatura',
        title: 'BLOCO DE ASSINATURA DIGITAL',
        enabled: true,
        order: 16,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202609161747',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-2026-9A8B7C'
        },
        htmlContent: `<div style="text-align: center; margin-top: 25px;">
  <p>____________________________________________________</p>
  <p><strong style="font-size: 12pt;">{{nome_engenheiro}}</strong></p>
  <p>{{formacao_titulo}} CREA/CAU-{{uf}} {{numero_registro}}</p>
  <p>ART N.º {{numero_art}}</p>
</div>`
      }
    ]
  },

  // 2. LAUDO NR-12 (SEGURANÇA EM MÁQUINAS)
  {
    id: 'tpl_nr12_maquinas',
    title: 'Laudo de Apreciação de Riscos e Adequação NR-12',
    category: 'nr12',
    description: 'Laudo pericial de segurança em máquinas e equipamentos industriais (ABNT NBR ISO 12100 / NR-12).',
    iconName: 'Shield',
    version: 1,
    variables: {
      nome_cliente: 'USINA DE AÇÚCAR E ÁLCOOL PERNAMBUCANA',
      cpf_cnpj_cliente: '03.444.555/0001-66',
      endereco_cliente: 'Goiana/PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-NR12-2026/012',
      art_rrt: 'PE202601212122',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      nome_maquina: 'Prensa Hidráulica Industrial 200T',
      categoria_seguranca: 'CATEGORIA 4 (ABNT NBR 14153)',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_nr12_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO DE ADEQUAÇÃO E APRECIAÇÃO DE RISCOS — NR-12</h1>
  <p style="font-size: 11pt; color: #475569;">ABNT NBR ISO 12100 / ABNT NBR 14153</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>EMPRESA / CLIENTE:</strong> {{nome_cliente}}</p>
    <p><strong>EQUIPAMENTO:</strong> {{nome_maquina}}</p>
    <p><strong>ENGENHEIRO RESPONSÁVEL:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_nr12_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_nr12_1',
        title: '1. IDENTIFICAÇÃO DA MÁQUINA E EMPRESA',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p><strong>Empresa:</strong> {{nome_cliente}}<br><strong>Máquina Avaliada:</strong> {{nome_maquina}}<br><strong>Categoria de Segurança Exigida:</strong> {{categoria_seguranca}}</p>`
      },
      {
        id: 'sec_nr12_2',
        title: '2. APRECIAÇÃO DE RISCOS E DISPOSITIVOS DE SEGURANÇA',
        enabled: true,
        order: 4,
        contentType: 'text',
        htmlContent: `<p>Apreciação realizada com metodologia HRN (Hazard Rating Number). A máquina conta com cortina de luz certificada, botão de emergência de duplo canal e proteções intertravadas.</p>`
      },
      {
        id: 'sec_nr12_3',
        title: '3. PARECER DE CONFORMIDADE NR-12',
        enabled: true,
        order: 5,
        contentType: 'text',
        htmlContent: `<p>O equipamento atende aos requisitos de segurança física e mecânica da Norma Regulamentadora NR-12 do MTE.</p>`
      },
      {
        id: 'sec_nr12_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 6,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_NR12.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} do CREA-PE anexada.</p>`
      },
      {
        id: 'sec_nr12_4',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 7,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202601212122',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-NR12-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico / Segurança do Trabalho — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 3. LAUDO NR-13 (CALDEIRAS E VASOS DE PRESSÃO)
  {
    id: 'tpl_nr13_vasos',
    title: 'Laudo de Inspeção de Segurança NR-13 (Vasos e Caldeiras)',
    category: 'nr13',
    description: 'Laudo de teste hidrostático, ultrassom de espessura e calibração de válvulas de segurança segundo NR-13.',
    iconName: 'Flame',
    version: 1,
    variables: {
      nome_cliente: 'FRIGORÍFICO REGIONAL DO AGRESTE',
      cpf_cnpj_cliente: '09.888.777/0001-11',
      endereco_cliente: 'Caruaru/PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-NR13-2026/005',
      art_rrt: 'PE202601313133',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      tag_vaso: 'VP-01 (Compressor de Ar Comprimido 500L)',
      pmta_kgf: '12,5 kgf/cm²',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_nr13_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO TÉCNICO DE INSPEÇÃO DE SEGURANÇA — NR-13</h1>
  <p style="font-size: 11pt; color: #475569;">VASOS DE PRESSÃO, CALDEIRAS E TUBULAÇÕES</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>PROPRIETÁRIO:</strong> {{nome_cliente}}</p>
    <p><strong>EQUIPAMENTO / TAG:</strong> {{tag_vaso}}</p>
    <p><strong>ENGENHEIRO HABILITADO (PH):</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_nr13_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_nr13_1',
        title: '1. DADOS DO VASO DE PRESSÃO E CLIENTE',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p><strong>Proprietário:</strong> {{nome_cliente}}<br><strong>Equipamento / TAG:</strong> {{tag_vaso}}<br><strong>PMTA de Projeto:</strong> {{pmta_kgf}}</p>`
      },
      {
        id: 'sec_nr13_2',
        title: '2. ENSAIOS REALIZADOS (ULTRASSOM E MANOMETRIA)',
        enabled: true,
        order: 4,
        contentType: 'text',
        htmlContent: `<p>Realizada medição de espessura por ultrassom e aferição da válvula de segurança e manômetro.</p>`
      },
      {
        id: 'sec_nr13_3',
        title: '3. CONCLUSÃO DE OPERAÇÃO SEGURA',
        enabled: true,
        order: 5,
        contentType: 'text',
        htmlContent: `<p>O equipamento encontra-se APROVADO para operar na PMTA de {{pmta_kgf}} pelo período de 12 meses.</p>`
      },
      {
        id: 'sec_nr13_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 6,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_NR13.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_nr13_4',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 7,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202601313133',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-NR13-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico (Profissional Habilitado NR-13) — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 4. LAUDO PMOC / CLIMATIZAÇÃO HVAC
  {
    id: 'tpl_pmoc_hvac',
    title: 'Laudo PMOC — Plano de Manutenção de Climatização (Anvisa)',
    category: 'pmoc',
    description: 'Laudo e plano PMOC em conformidade com a Lei 13.589/2018 e Portaria MS 3.523/98.',
    iconName: 'Wind',
    version: 1,
    variables: {
      nome_cliente: 'CLÍNICA DE DIAGNÓSTICO BOA VIAGEM',
      cpf_cnpj_cliente: '10.555.666/0001-88',
      endereco_cliente: 'Recife/PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-PMOC-2026/019',
      art_rrt: 'PE202603523523',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      capacidade_instalada: '120.000 BTU/h',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_pmoc_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO E PLANO PMOC — ANVISA</h1>
  <p style="font-size: 11pt; color: #475569;">LEI N.º 13.589/2018 E PORTARIA MS 3.523/98</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>EMPRESA / CONTRATANTE:</strong> {{nome_cliente}}</p>
    <p><strong>CAPACIDADE CLIMATIZADA TOTAL:</strong> {{capacidade_instalada}}</p>
    <p><strong>ENGENHEIRO TÉCNICO RT:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_pmoc_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_pmoc_1',
        title: '1. DADOS DO EMPREENDIMENTO CLIMATIZADO',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p><strong>Empresa / Imóvel:</strong> {{nome_cliente}}<br><strong>Carga Térmica Total Instalada:</strong> {{capacidade_instalada}}</p>`
      },
      {
        id: 'sec_pmoc_2',
        title: '2. OBJETIVO DO PLANO DE MANUTENÇÃO',
        enabled: true,
        order: 4,
        contentType: 'text',
        htmlContent: `<p>Garantir a boa qualidade do ar interior nos ambientes climatizados, atendendo aos parâmetros sanitários da Anvisa (RE 09) e mitigando riscos microbiológicos.</p>`
      },
      {
        id: 'sec_pmoc_3',
        title: '3. CRONOGRAMA E PLANO DE ROTINAS MENSAL',
        enabled: true,
        order: 5,
        contentType: 'text',
        htmlContent: `<p>Atividades programadas: Limpeza de filtros, higienização de serpentinas e lavagem de dutos.</p>`
      },
      {
        id: 'sec_pmoc_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 6,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_PMOC.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} do CREA-PE anexada.</p>`
      },
      {
        id: 'sec_pmoc_4',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 7,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202603523523',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-PMOC-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico RT do PMOC — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 5. CAMINHÃO MUNCK / GUINDASTE VEICULAR
  {
    id: 'tpl_caminhao_munck',
    title: 'Laudo de Inspeção e Segurança de Caminhão Munck',
    category: 'munck',
    description: 'Laudo pericial de segurança, integridade estrutural e teste de carga em caminhão guindauto / Munck conforme NR-11, NR-12 e NBR 14768.',
    iconName: 'Truck',
    version: 1,
    variables: {
      nome_cliente: 'CONSTRUTORA E INCORPORADORA AGRESTE LTDA',
      cpf_cnpj_cliente: '08.777.666/0001-55',
      endereco_cliente: 'Igarassu/PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-MUK-2026/011',
      art_rrt: 'PE202601112233',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      marca_veiculo: 'VOLKSWAGEN / MASAL',
      modelo_veiculo: 'VW 24.280 + Munck Masal 20.000',
      placa_veiculo: 'KFD-8899',
      capacidade_carga: '20,0 Toneladas / metro',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_muk_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO DE INSPEÇÃO TÉCNICA E SEGURANÇA — CAMINHÃO MUNCK</h1>
  <p style="font-size: 11pt; color: #475569;">NR-11 / NR-12 / ABNT NBR 14768</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>PROPRIETÁRIO / CLIENTE:</strong> {{nome_cliente}}</p>
    <p><strong>EQUIPAMENTO / VEÍCULO:</strong> {{modelo_veiculo}} — PLACA {{placa_veiculo}}</p>
    <p><strong>CAPACIDADE MÁXIMA:</strong> {{capacidade_carga}}</p>
    <p><strong>ENGENHEIRO TÉCNICO:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_muk_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_muk_1',
        title: '1. DADOS TÉCNICOS DO GUINDAUTO E VEÍCULO',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p><strong>Veículo Conector:</strong> {{marca_veiculo}}<br><strong>Placa:</strong> {{placa_veiculo}}<br><strong>Capacidade Nominal do Guindaste:</strong> {{capacidade_carga}}</p>`
      },
      {
        id: 'sec_muk_2',
        title: '2. ENSAIOS E TESTE DE CARGA HIDRÁULICA',
        enabled: true,
        order: 4,
        contentType: 'text',
        htmlContent: `<p>Inspeção das sapatas estabilizadoras, mangueiras hidráulicas, válvulas de retenção de carga e ensaio de líquido penetrante.</p>`
      },
      {
        id: 'sec_muk_3',
        title: '3. PARECER CONCLUSIVO DE OPERAÇÃO SEGURA',
        enabled: true,
        order: 5,
        contentType: 'text',
        htmlContent: `<p>O equipamento encontra-se APROVADO para movimentação de cargas, cumprindo integralmente com as exigências da NR-11 e NR-12.</p>`
      },
      {
        id: 'sec_muk_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 6,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_MUNCK.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_muk_4',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 7,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202601112233',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-MUK-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico / Perito Veicular — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 6. PLAYGROUND E PARQUES INFANTIS
  {
    id: 'tpl_playground_parques',
    title: 'Laudo Técnico de Vistoria de Playground e Parques Infantis',
    category: 'playground',
    description: 'Laudo pericial de segurança e conformidade de brinquedos e superfícies de absorção de impacto (ABNT NBR 16071).',
    iconName: 'Shield',
    version: 1,
    variables: {
      nome_cliente: 'CONDOMÍNIO PARK REAL RECIFE',
      cpf_cnpj_cliente: '14.222.333/0001-99',
      endereco_cliente: 'Rua Navegantes, 1200 - Boa Viagem, Recife/PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-PLA-2026/003',
      art_rrt: 'PE202600334455',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      quantidade_brinquedos: '08 equipamentos (balanços, escorregadores, gira-gira)',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_pla_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO DE INSPEÇÃO E SEGURANÇA DE PLAYGROUND</h1>
  <p style="font-size: 11pt; color: #475569;">ABNT NBR 16071 (PARTE 1 A 7)</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>CONDOMÍNIO / CLIENTE:</strong> {{nome_cliente}}</p>
    <p><strong>ENDEREÇO:</strong> {{endereco_cliente}}</p>
    <p><strong>ENGENHEIRO TÉCNICO:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_pla_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_pla_1',
        title: '1. OBJETO DA INSPEÇÃO E QUANTITATIVO',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p><strong>Local:</strong> {{nome_cliente}}<br><strong>Quantidade de Equipamentos:</strong> {{quantidade_brinquedos}}</p>`
      },
      {
        id: 'sec_pla_2',
        title: '2. ANÁLISE DE SEGURANÇA E PONTOS DE APRISIONAMENTO',
        enabled: true,
        order: 4,
        contentType: 'text',
        htmlContent: `<p>Verificação de folgas contra aprisionamento de cabeça, pernas e roupas, e inspeção do piso emborrachado sintético.</p>`
      },
      {
        id: 'sec_pla_3',
        title: '3. PARECER FINAL DE LIBERAÇÃO',
        enabled: true,
        order: 5,
        contentType: 'text',
        htmlContent: `<p>O playground encontra-se APROVADO para uso de crianças conforme diretrizes da NBR 16071.</p>`
      },
      {
        id: 'sec_pla_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 6,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_PLAYGROUND.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_pla_4',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 7,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202600334455',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-PLA-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico / Responsável Técnico — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 7. MÁQUINAS PESADAS E LINHA AMARELA
  {
    id: 'tpl_maquinas_pesadas',
    title: 'Laudo de Inspeção e Integridade de Máquinas Pesadas',
    category: 'maquinas',
    description: 'Laudo técnico de inspeção para escavadeiras, pás carregadeiras e retroescavadeiras (NR-11/NR-12).',
    iconName: 'Wrench',
    version: 1,
    variables: {
      nome_cliente: 'MINERAÇÃO Pajeú LTDA',
      cpf_cnpj_cliente: '12.888.999/0001-44',
      endereco_cliente: 'Serra Talhada / PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-PES-2026/007',
      art_rrt: 'PE202600778899',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      nome_maquina: 'Escavadeira Hidráulica Caterpillar 320',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_pes_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO DE INSPEÇÃO TÉCNICA — MÁQUINAS PESADAS</h1>
  <p style="font-size: 11pt; color: #475569;">LINHA AMARELA / NR-11 E NR-12</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>PROPRIETÁRIO:</strong> {{nome_cliente}}</p>
    <p><strong>MÁQUINA:</strong> {{nome_maquina}}</p>
    <p><strong>ENGENHEIRO TÉCNICO:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_pes_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_pes_1',
        title: '1. ESPECIFICAÇÕES DO EQUIPAMENTO DE LINHA AMARELA',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p><strong>Equipamento:</strong> {{nome_maquina}}<br><strong>Proprietário:</strong> {{nome_cliente}}</p>`
      },
      {
        id: 'sec_pes_2',
        title: '2. INSPEÇÃO E ENSAIOS EM SISTEMAS CRÍTICOS',
        enabled: true,
        order: 4,
        contentType: 'text',
        htmlContent: `<p>Inspeção de estabilidade estrutural do lança, cilindros de elevação, esteiras de tração e freios de emergência.</p>`
      },
      {
        id: 'sec_pes_3',
        title: '3. CONCLUSÃO E CONDIÇÕES DE OPERAÇÃO',
        enabled: true,
        order: 5,
        contentType: 'text',
        htmlContent: `<p>O equipamento encontra-se APTO para operação pesada com plena observância das recomendações do fabricante.</p>`
      },
      {
        id: 'sec_pes_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 6,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_MAQUINAS_PESADAS.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_pes_4',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 7,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202600778899',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-PES-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 8. GUINDASTES INDUSTRIAIS E DE TRELIÇA
  {
    id: 'tpl_guindaste_ind',
    title: 'Laudo de Segurança e Ensaio de Carga de Guindastes',
    category: 'guindaste',
    description: 'Laudo pericial com teste de carga e ensaios não destrutivos em guindastes de lança telescópica (NBR 8400 / NBR 14768).',
    iconName: 'Tool',
    version: 1,
    variables: {
      nome_cliente: 'PORTO DE SUAPE / OPERADORA PORTUÁRIA PE',
      cpf_cnpj_cliente: '05.333.444/0001-22',
      endereco_cliente: 'Cabo de Santo Agostinho / PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-GUI-2026/009',
      art_rrt: 'PE202600990011',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      capacidade_guindaste: '80 Toneladas',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_gui_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO DE ENSAIO DE CARGA E SEGURANÇA — GUINDASTES</h1>
  <p style="font-size: 11pt; color: #475569;">NR-11 / ABNT NBR 8400 E NBR 14768</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>EMPRESA / CONTRATANTE:</strong> {{nome_cliente}}</p>
    <p><strong>CAPACIDADE NOMINAL:</strong> {{capacidade_guindaste}}</p>
    <p><strong>ENGENHEIRO TÉCNICO:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_gui_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_gui_1',
        title: '1. CARACTERÍSTICAS TÉCNICAS DO GUINDASTE',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p><strong>Empresa:</strong> {{nome_cliente}}<br><strong>Capacidade Máxima:</strong> {{capacidade_guindaste}}</p>`
      },
      {
        id: 'sec_gui_2',
        title: '2. TESTE DE CARGA ESTÁTICA E DINÂMICA (125% DA CARGA NOMINAL)',
        enabled: true,
        order: 4,
        contentType: 'text',
        htmlContent: `<p>Realizado teste de elevação de carga com sobrecarga regulamentar. Sistema de trava e freio dinâmico com desempenho aprovado sem deflexão anormal.</p>`
      },
      {
        id: 'sec_gui_3',
        title: '3. PARECER TÉCNICO FINAL',
        enabled: true,
        order: 5,
        contentType: 'text',
        htmlContent: `<p>Guindaste APROVADO para içamentos de até {{capacidade_guindaste}} com emissão da respectiva ART.</p>`
      },
      {
        id: 'sec_gui_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 6,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_GUINDASTE.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_gui_4',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 7,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202600990011',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-GUI-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 9. INSPEÇÃO VEICULAR GERAL
  {
    id: 'tpl_inspecao_veicular',
    title: 'Laudo de Inspeção Veicular Geral e Segurança Mecânica',
    category: 'sinistro',
    description: 'Laudo de inspeção pericial de segurança mecânica e integridade de frotas veiculares.',
    iconName: 'Car',
    version: 1,
    variables: {
      nome_cliente: 'TRANSPORTADORA NORDESTE EXPRESS',
      cpf_cnpj_cliente: '07.111.222/0001-33',
      endereco_cliente: 'Olinda / PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-VEI-2026/015',
      art_rrt: 'PE202601515155',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      placa_veiculo: 'KFX-9000',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_vei_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO DE INSPEÇÃO VEICULAR E SEGURANÇA MECÂNICA</h1>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>SOLICITANTE:</strong> {{nome_cliente}}</p>
    <p><strong>PLACA:</strong> {{placa_veiculo}}</p>
    <p><strong>ENGENHEIRO TÉCNICO:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_vei_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_vei_1',
        title: '1. DADOS TÉCNICOS DO VEÍCULO',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p>Veículo Placa <strong>{{placa_veiculo}}</strong> pertencente a <strong>{{nome_cliente}}</strong>.</p>`
      },
      {
        id: 'sec_vei_2',
        title: '2. INSPEÇÃO DE FREIOS, DIREÇÃO E SUSPENSÃO',
        enabled: true,
        order: 4,
        contentType: 'text',
        htmlContent: `<p>Testes de frenagem no frenômetro, verificação de alinhamento e folgas nas buchas e pivôs da suspensão.</p>`
      },
      {
        id: 'sec_vei_3',
        title: '3. CONCLUSÃO DE SEGURANÇA',
        enabled: true,
        order: 5,
        contentType: 'text',
        htmlContent: `<p>Veículo considerado APROVADO sem pendências técnicas de segurança mecânica.</p>`
      },
      {
        id: 'sec_vei_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 6,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_INSPECAO_VEICULAR.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_vei_4',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 7,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202601515155',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-VEI-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 10. MONTACARGAS E ELEVADORES DE CARGA
  {
    id: 'tpl_montacargas',
    title: 'Laudo de Inspeção de Montacargas e Elevadores de Carga',
    category: 'maquinas',
    description: 'Laudo pericial de segurança em elevadores de carga e montacargas industriais (NR-11/NR-12).',
    iconName: 'Shield',
    version: 1,
    variables: {
      nome_cliente: 'CENTRO LOGÍSTICO RECIFE S/A',
      cpf_cnpj_cliente: '11.444.333/0001-77',
      endereco_cliente: 'Jaboatão dos Guararapes / PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-MON-2026/020',
      art_rrt: 'PE202602020200',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      capacidade_montacarga: '2.000 kg (2 Toneladas)',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_mon_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO TÉCNICO DE MONTACARGAS E ELEVADORES DE CARGA</h1>
  <p style="font-size: 11pt; color: #475569;">NR-11 E ABNT NBR 14712</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>CONTRATANTE:</strong> {{nome_cliente}}</p>
    <p><strong>CAPACIDADE DE CARGA:</strong> {{capacidade_montacarga}}</p>
    <p><strong>ENGENHEIRO TÉCNICO:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_mon_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_mon_1',
        title: '1. DADOS DO ELEVADOR E EMPRESA',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p><strong>Empresa:</strong> {{nome_cliente}}<br><strong>Carga Limite:</strong> {{capacidade_montacarga}}</p>`
      },
      {
        id: 'sec_mon_2',
        title: '2. INSPEÇÃO DE CABOS DE AÇO E SISTEMAS DE FREIO DE EMERGÊNCIA',
        enabled: true,
        order: 4,
        contentType: 'text',
        htmlContent: `<p>Inspeção de desgaste nos cabos de tração, guias de alinhamento e teste do freio paraquedas instantâneo.</p>`
      },
      {
        id: 'sec_mon_3',
        title: '3. CONCLUSÃO E LIBERAÇÃO OPERACIONAL',
        enabled: true,
        order: 5,
        contentType: 'text',
        htmlContent: `<p>O montacargas encontra-se APROVADO para transporte exclusivo de cargas de até {{capacidade_montacarga}}.</p>`
      },
      {
        id: 'sec_mon_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 6,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_MONTACARGAS.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_mon_4',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 7,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202602020200',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-MON-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 11. ART & LAUDO DE MANUTENÇÃO MECÂNICA GERAL
  {
    id: 'tpl_art_manutencao',
    title: 'Laudo Técnico e ART de Manutenção Mecânica Geral',
    category: 'art',
    description: 'Laudo técnico com ART de responsabilidade técnica para reforma, fabricação ou manutenção mecânica de equipamentos.',
    iconName: 'FileCheck',
    version: 1,
    variables: {
      nome_cliente: 'INDÚSTRIA METALÚRGICA PERNAMBUCO LTDA',
      cpf_cnpj_cliente: '04.222.111/0001-00',
      endereco_cliente: 'Recife / PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-ART-2026/088',
      art_rrt: 'PE202608889900',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      descricao_servico: 'Manutenção Preventiva e Corretiva em Ponte Rolante 10T',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_art_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO TÉCNICO DE RESPONSABILIDADE E MANUTENÇÃO MECÂNICA</h1>
  <p style="font-size: 11pt; color: #475569;">COM EMISSÃO DE ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>CONTRATANTE:</strong> {{nome_cliente}}</p>
    <p><strong>SERVIÇO COBERTO:</strong> {{descricao_servico}}</p>
    <p><strong>ENGENHEIRO TÉCNICO RT:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_art_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_art_1',
        title: '1. ESCOPO DO SERVIÇO TÉCNICO',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p><strong>Contratante:</strong> {{nome_cliente}}<br><strong>Objeto:</strong> {{descricao_servico}}</p>`
      },
      {
        id: 'sec_art_2',
        title: '2. PARECER DE CONFORMIDADE E ART',
        enabled: true,
        order: 4,
        contentType: 'text',
        htmlContent: `<p>Atesta-se que a manutenção foi realizada em inteira observância com os procedimentos da engenharia mecânica e normas ABNT aplicáveis.</p>`
      },
      {
        id: 'sec_art_file',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 5,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_MANUTENCAO.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_art_3',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 6,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202608889900',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-ART-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico RT — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 12. PCM (PLANO DE CONTROLE DE MANUTENÇÃO)
  {
    id: 'tpl_pcm_manutencao',
    title: 'Laudo e Plano de Controle de Manutenção (PCM)',
    category: 'pcm',
    description: 'Plano de Gestão de Manutenção Preventiva, Preditiva e Corretiva para ativos e parques industriais.',
    iconName: 'Settings',
    version: 1,
    variables: {
      nome_cliente: 'COMPANHIA INDUSTRIAL DE BEBIDAS DO NORDESTE',
      cpf_cnpj_cliente: '02.999.888/0001-55',
      endereco_cliente: 'Suape / PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-PCM-2026/033',
      art_rrt: 'PE202603334455',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      total_ativos: '45 máquinas e equipamentos fabris',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_pcm_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">PLANO E MANIFESTO DE CONTROLE DE MANUTENÇÃO (PCM)</h1>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>CLIENTE:</strong> {{nome_cliente}}</p>
    <p><strong>PARQUE DE ATIVOS:</strong> {{total_ativos}}</p>
    <p><strong>ENGENHEIRO GESTOR:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_pcm_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_pcm_1',
        title: '1. GESTÃO DE ATIVOS E INDICADORES (MTBF / MTTR)',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p>Estruturação dos programas de manutenção preventiva com controle de horas de funcionamento e lubrificação.</p>`
      },
      {
        id: 'sec_pcm_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 4,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_PCM.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_pcm_2',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 5,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202603334455',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-PCM-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico / Gestor do PCM — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 13. CÁLCULO DE CARGA TÉRMICA HVAC
  {
    id: 'tpl_carga_termica',
    title: 'Laudo de Cálculo de Carga Térmica HVAC',
    category: 'pmoc',
    description: 'Laudo pericial de dimensionamento térmico para sistemas de climatização central e VRF (NBR 5858 / ASHRAE).',
    iconName: 'Wind',
    version: 1,
    variables: {
      nome_cliente: 'HOSPITAL SÃO LUCAS RECIFE',
      cpf_cnpj_cliente: '13.111.444/0001-99',
      endereco_cliente: 'Recife / PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-CAR-2026/014',
      art_rrt: 'PE202601414144',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      area_climatizada: '850 m²',
      carga_calculada: '360.000 BTU/h (30 TR)',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_car_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO DE DIMENSIONAMENTO E CARGA TÉRMICA HVAC</h1>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>EDIFÍCIO / CLIENTE:</strong> {{nome_cliente}}</p>
    <p><strong>ÁREA TOTAL:</strong> {{area_climatizada}} | <strong>CARGA TOTAL:</strong> {{carga_calculada}}</p>
    <p><strong>ENGENHEIRO TÉCNICO:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_car_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_car_1',
        title: '1. PARÂMETROS ARQUITETÔNICOS E OCUPAÇÃO',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p><strong>Área Útil:</strong> {{area_climatizada}}<br><strong>Carga Térmica Requerida:</strong> {{carga_calculada}}</p>`
      },
      {
        id: 'sec_car_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 4,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_CARGA_TERMICA.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_car_2',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 5,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202601414144',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-CAR-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 14. FROTA ESCOLAR E TRANSPORTE DE PASSAGEIROS
  {
    id: 'tpl_frota_escolar',
    title: 'Laudo de Inspeção de Frota Escolar e Transporte Coletivo',
    category: 'sinistro',
    description: 'Laudo de inspeção pericial para vans e ônibus escolares conforme exigências do DETRAN e CONTRAN.',
    iconName: 'Truck',
    version: 1,
    variables: {
      nome_cliente: 'PREFEITURA MUNICIPAL DE CARUARU',
      cpf_cnpj_cliente: '11.000.222/0001-44',
      endereco_cliente: 'Caruaru / PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-ESC-2026/018',
      art_rrt: 'PE202601818188',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      modelo_van: 'Mercedes-Benz Sprinter 516 CDi (20 passageiros)',
      placa_veiculo: 'KGE-3344',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_esc_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO DE INSPEÇÃO TÉCNICA — TRANSPORTE ESCOLAR</h1>
  <p style="font-size: 11pt; color: #475569;">EXIGÊNCIAS DO CTB / DETRAN E CONTRAN</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>MUNICÍPIO / CLIENTE:</strong> {{nome_cliente}}</p>
    <p><strong>VEÍCULO:</strong> {{modelo_van}} — PLACA {{placa_veiculo}}</p>
    <p><strong>ENGENHEIRO TÉCNICO:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_esc_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_esc_1',
        title: '1. VISTORIA DE CINTO DE SEGURANÇA E TACÓGRAFO',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p>Conferência de cintos de segurança subabdominais em todos os assentos, tacógrafo selado pelo INMETRO e luzes de emergência.</p>`
      },
      {
        id: 'sec_esc_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 4,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_TRANSPORTE_ESCOLAR.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_esc_2',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 5,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202601818188',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-ESC-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  },

  // 15. SEGURANÇA CONTRA INCÊNDIO E PÂNICO
  {
    id: 'tpl_fire_safety',
    title: 'Laudo de Inspeção de Segurança Contra Incêndio e Pânico',
    category: 'fire_safety',
    description: 'Laudo técnico pericial para renovação de AVCB e vistoria em sistemas de bomba de incêndio, hidrantes e sprinklers (Corpo de Bombeiros / NBR 13714).',
    iconName: 'Shield',
    version: 1,
    variables: {
      nome_cliente: 'CONDOMÍNIO SHOPPING CENTER BOA VISTA',
      cpf_cnpj_cliente: '06.555.444/0001-88',
      endereco_cliente: 'Recife / PE',
      data_vistoria: new Date().toLocaleDateString('pt-BR'),
      data_emissao: new Date().toLocaleDateString('pt-BR'),
      numero_laudo: 'LAU-FIR-2026/022',
      art_rrt: 'PE202602222211',
      engenheiro_responsavel: 'Vitor Leonardo Cordeiro Linhares',
      crea_engenheiro: 'CREA-PE 1822299490',
      vazao_bomba: '60 m³/h a 80 mca (Moto-bomba de combate a incêndio 30CV)',
      cidade_emissao: 'Recife - PE'
    },
    sections: [
      {
        id: 'sec_fir_capa',
        title: 'CAPA DO DOCUMENTO',
        enabled: true,
        order: 1,
        contentType: 'capa',
        htmlContent: `<div style="text-align: center; padding: 20px 0;">
  <h1 style="font-size: 20pt; font-weight: bold; color: #0f172a;">LAUDO DE INSPEÇÃO TÉCNICA — SEGURANÇA CONTRA INCÊNDIO (PPCI)</h1>
  <p style="font-size: 11pt; color: #475569;">SISTEMAS HIDRÁULICOS DE COMBATE A INCÊNDIO E BOMBAS</p>
  <div style="margin-top: 30px; text-align: left; background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <p><strong>EDIFÍCIO / CLIENTE:</strong> {{nome_cliente}}</p>
    <p><strong>SISTEMA:</strong> Moto-bomba de Combate a Incêndio ({{vazao_bomba}})</p>
    <p><strong>ENGENHEIRO TÉCNICO:</strong> {{engenheiro_responsavel}} ({{crea_engenheiro}})</p>
    <p><strong>ART N.º:</strong> {{art_rrt}} | <strong>DATA:</strong> {{data_emissao}}</p>
  </div>
</div>`
      },
      {
        id: 'sec_fir_sumario',
        title: 'SUMÁRIO DO LAUDO',
        enabled: true,
        order: 2,
        contentType: 'sumario',
        htmlContent: `<p style="font-style: italic; color: #64748b;">(Sumário gerado dinamicamente)</p>`
      },
      {
        id: 'sec_fir_1',
        title: '1. TESTE DE PRESSÃO E VAZÃO DA MOTO-BOMBA',
        enabled: true,
        order: 3,
        contentType: 'text',
        htmlContent: `<p>Aferição de vazão e estanqueidade da rede de hidrantes. Pressão de manômetro mantida em 8,0 bar sem oscilações.</p>`
      },
      {
        id: 'sec_fir_art',
        title: 'ANEXO — ANOTAÇÃO DE RESPONSABILIDADE TÉCNICA (ART)',
        enabled: true,
        order: 4,
        contentType: 'art_attachment',
        artData: { fileName: 'ART_COMBATE_INCENDIO.pdf', uploadedAt: new Date().toLocaleDateString('pt-BR') },
        htmlContent: `<p>ART N.º {{art_rrt}} anexada.</p>`
      },
      {
        id: 'sec_fir_2',
        title: 'ASSINATURA DIGITAL E IDENTIFICAÇÃO DO ENGENHEIRO',
        enabled: true,
        order: 5,
        contentType: 'signature',
        signatureData: {
          status: 'assinado',
          responsibleName: 'Vitor Leonardo Cordeiro Linhares',
          creaCau: 'CREA-PE 1822299490',
          artNumber: 'PE202602222211',
          signatureDate: new Date().toLocaleDateString('pt-BR'),
          verificationHash: 'VL-SIGN-FIR-2026'
        },
        htmlContent: `<div style="text-align: center; margin-top: 20px;">
  <p>____________________________________________________</p>
  <p><strong>{{engenheiro_responsavel}}</strong></p>
  <p>Engenheiro Mecânico — {{crea_engenheiro}}</p>
  <p>ART N.º {{art_rrt}}</p>
</div>`
      }
    ]
  }
];

// LocalStorage key for custom templates saved by user
const CUSTOM_TEMPLATES_KEY = 'vl_custom_laudo_templates_v1';

export function getCustomTemplates(): LaudoTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading custom templates from storage:", e);
    return [];
  }
}

export function saveCustomTemplate(template: LaudoTemplate): void {
  try {
    const existing = getCustomTemplates();
    const idx = existing.findIndex(t => t.id === template.id);
    if (idx >= 0) {
      existing[idx] = { ...template, updatedAt: new Date().toISOString() };
    } else {
      existing.push({ ...template, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isCustom: true });
    }
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Error saving custom template:", e);
  }
}

export function deleteCustomTemplate(templateId: string): void {
  try {
    const existing = getCustomTemplates().filter(t => t.id !== templateId);
    localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Error deleting custom template:", e);
  }
}

export function getAllTemplates(): LaudoTemplate[] {
  const custom = getCustomTemplates();
  return [...DEFAULT_TEMPLATES_BANK, ...custom];
}
