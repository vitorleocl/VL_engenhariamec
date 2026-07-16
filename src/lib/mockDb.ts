/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientData, EquipmentData, LaudoData, ChecklistData, UserProfile, UserRole, LaudoStatus } from '../types';

// Initial Mock Data structures
const initialClients: ClientData[] = [
  {
    id: 'c1',
    name: 'Indústrias Metalúrgicas Pernambucanas Ltda',
    email: 'contato@metalurgicapem.com.br',
    phone: '(81) 3456-1122',
    company: 'Metalúrgica PE-M',
    cnpj_cpf: '12.345.678/0001-99',
    address: 'Av. Marechal Mascarenhas de Morais, 1200, Imbiribeira, Recife - PE',
    createdAt: new Date('2026-01-15').toISOString(),
    updatedAt: new Date('2026-01-15').toISOString(),
  },
  {
    id: 'c2',
    name: 'Logística e Transportes Nordeste S.A.',
    email: 'inspecao@lognordeste.com',
    phone: '(82) 98765-4321',
    company: 'LogNordeste',
    cnpj_cpf: '98.765.432/0001-11',
    address: 'Rodovia BR-101, Km 22, Prazeres, Jaboatão dos Guararapes - PE',
    createdAt: new Date('2026-02-10').toISOString(),
    updatedAt: new Date('2026-02-10').toISOString(),
  },
  {
    id: 'c3',
    name: 'Condomínio Parque do Sol Jaqueira',
    email: 'soljaqueira@gmail.com',
    phone: '(81) 99111-2233',
    company: 'Residencial Parque do Sol',
    cnpj_cpf: '04.111.222/0001-33',
    address: 'Rua do Futuro, 450, Jaqueira, Recife - PE',
    createdAt: new Date('2026-03-01').toISOString(),
    updatedAt: new Date('2026-03-01').toISOString(),
  }
];

const initialEquipments: EquipmentData[] = [
  {
    id: 'e1',
    clientId: 'c1',
    clientName: 'Indústrias Metalúrgicas Pernambucanas Ltda',
    type: 'Prensa Hidráulica H-60',
    brand: 'Nardini-Newton',
    model: 'PH-60T',
    serialNumber: 'M-5544229',
    year: '2018',
    createdAt: new Date('2026-01-16').toISOString(),
    updatedAt: new Date('2026-01-16').toISOString(),
    potenciaInstalada: '45'
  },
  {
    id: 'e2',
    clientId: 'c2',
    clientName: 'Logística e Transportes Nordeste S.A.',
    type: 'Caminhão Munck (Palfinger)',
    brand: 'Scania / Madal Palfinger',
    model: 'MD-45007 / G440',
    serialNumber: 'SK-2200-XX',
    year: '2020',
    createdAt: new Date('2026-02-11').toISOString(),
    updatedAt: new Date('2026-02-11').toISOString(),
    potenciaInstalada: '185'
  },
  {
    id: 'e3',
    clientId: 'c3',
    clientName: 'Condomínio Parque do Sol Jaqueira',
    type: 'Playground Infantil Multi-Gira',
    brand: 'PlayPark Brinquedos',
    model: 'Iron-Wood 5',
    serialNumber: 'PP-771',
    year: '2021',
    createdAt: new Date('2026-03-02').toISOString(),
    updatedAt: new Date('2026-03-02').toISOString(),
    potenciaInstalada: ''
  },
  {
    id: 'e4',
    clientId: 'c1',
    clientName: 'Indústrias Metalúrgicas Pernambucanas Ltda',
    type: 'Sistema Chiller Ar Condicionado HVAC',
    brand: 'Carrier Space',
    model: '30RB-350S',
    serialNumber: 'CAR-990-881',
    year: '2019',
    createdAt: new Date('2026-03-05').toISOString(),
    updatedAt: new Date('2026-03-05').toISOString(),
    potenciaInstalada: '120'
  }
];

const initialLaudos: LaudoData[] = [
  {
    id: 'l1',
    numero: 'LT-2026-1025',
    clientId: 'c1',
    clientName: 'Indústrias Metalúrgicas Pernambucanas Ltda',
    equipmentId: 'e1',
    equipmentModel: 'Prensa Hidráulica (PH-60T)',
    dateInspection: '2026-05-10',
    rt: 'Vitor Leonardo Cordeiro Linhares',
    art: 'PE-18222994-01',
    status: LaudoStatus.EMITIDO,
    pdfUrl: 'https://vitorleonardo-engmec.netlify.app/mock-laudo.pdf',
    createdAt: new Date('2026-05-10').toISOString(),
    updatedAt: new Date('2026-05-10').toISOString(),
  },
  {
    id: 'l2',
    numero: 'LT-2026-1026',
    clientId: 'c2',
    clientName: 'Logística e Transportes Nordeste S.A.',
    equipmentId: 'e2',
    equipmentModel: 'Caminhão Munck (Palfinger)',
    dateInspection: '2026-05-20',
    rt: 'Vitor Leonardo Cordeiro Linhares',
    art: 'PE-18222994-02',
    status: LaudoStatus.EMITIDO,
    pdfUrl: '#',
    createdAt: new Date('2026-05-20').toISOString(),
    updatedAt: new Date('2026-05-20').toISOString(),
  },
  {
    id: 'l3',
    numero: 'LT-2026-1027',
    clientId: 'c3',
    clientName: 'Condomínio Parque do Sol Jaqueira',
    equipmentId: 'e3',
    equipmentModel: 'Playground Infantil Multi-Gira',
    dateInspection: '2026-05-28',
    rt: 'Vitor Leonardo Cordeiro Linhares',
    art: 'PE-18222994-03',
    status: LaudoStatus.EM_ELABORACAO,
    createdAt: new Date('2026-05-28').toISOString(),
    updatedAt: new Date('2026-05-28').toISOString(),
  }
];

const initialChecklists: ChecklistData[] = [
  {
    id: 'ck1',
    type: 'nr12',
    clientId: 'c1',
    clientName: 'Indústrias Metalúrgicas Pernambucanas Ltda',
    equipmentId: 'e1',
    equipmentModel: 'Prensa Hidráulica (PH-60T)',
    questions: {
      'q1_bimanual': true,
      'q2_clausuras': true,
      'q3_sensor_porta': true,
      'q4_parada_emergente': true,
      'q5_painel_eletrico': false,
      'q6_art_instalacao': true,
    },
    signatureUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', // Placeholder DOT
    digitalSignature: 'MD5:d41d8cd98f00b204e9800998ecf8427e',
    inspectorName: 'Vitor Leonardo C. Linhares',
    createdAt: new Date('2026-05-10').toISOString(),
    updatedAt: new Date('2026-05-10').toISOString(),
  }
];

class MockDatabase {
  private getStorageItem<T>(key: string, initial: T[]): T[] {
    const item = localStorage.getItem(`vitor_engmec_${key}`);
    if (!item) {
      localStorage.setItem(`vitor_engmec_${key}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(item);
  }

  private setStorageItem<T>(key: string, data: T[]): void {
    localStorage.setItem(`vitor_engmec_${key}`, JSON.stringify(data));
  }

  // Clients
  getClients(): ClientData[] {
    return this.getStorageItem('clients', initialClients);
  }
  saveClient(client: ClientData): void {
    const clients = this.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) {
      clients[index] = { ...client, updatedAt: new Date().toISOString() };
    } else {
      clients.push(client);
    }
    this.setStorageItem('clients', clients);
  }
  deleteClient(id: string): void {
    const clients = this.getClients().filter(c => c.id !== id);
    this.setStorageItem('clients', clients);
  }

  // Equipment
  getEquipments(): EquipmentData[] {
    return this.getStorageItem('equipments', initialEquipments);
  }
  saveEquipment(eq: EquipmentData): void {
    const eqs = this.getEquipments();
    const index = eqs.findIndex(e => e.id === eq.id);
    if (index >= 0) {
      eqs[index] = { ...eq, updatedAt: new Date().toISOString() };
    } else {
      eqs.push(eq);
    }
    this.setStorageItem('equipments', eqs);
  }
  deleteEquipment(id: string): void {
    const eqs = this.getEquipments().filter(e => e.id !== id);
    this.setStorageItem('equipments', eqs);
  }

  // Laudos
  getLaudos(): LaudoData[] {
    return this.getStorageItem('laudos', initialLaudos);
  }
  saveLaudo(laudo: LaudoData): void {
    const laudos = this.getLaudos();
    const index = laudos.findIndex(l => l.id === laudo.id);
    if (index >= 0) {
      laudos[index] = { ...laudo, updatedAt: new Date().toISOString() };
    } else {
      laudos.push(laudo);
    }
    this.setStorageItem('laudos', laudos);
  }
  deleteLaudo(id: string): void {
    const laudos = this.getLaudos().filter(l => l.id !== id);
    this.setStorageItem('laudos', laudos);
  }

  // Checklists
  getChecklists(): ChecklistData[] {
    return this.getStorageItem('checklists', initialChecklists);
  }
  saveChecklist(chk: ChecklistData): void {
    const chks = this.getChecklists();
    const index = chks.findIndex(c => c.id === chk.id);
    if (index >= 0) {
      chks[index] = { ...chk, updatedAt: new Date().toISOString() };
    } else {
      chks.push(chk);
    }
    this.setStorageItem('checklists', chks);
  }
  deleteChecklist(id: string): void {
    const chks = this.getChecklists().filter(c => c.id !== id);
    this.setStorageItem('checklists', chks);
  }

  // Users Simulation (Admin/Client Auth states)
  getCurrentUserProfile(): UserProfile | null {
    const userJson = localStorage.getItem('vitor_engmec_simulated_user');
    if (!userJson) return null;
    return JSON.parse(userJson);
  }
  saveSimulatedUser(profile: UserProfile | null): void {
    if (profile) {
      localStorage.setItem('vitor_engmec_simulated_user', JSON.stringify(profile));
    } else {
      localStorage.removeItem('vitor_engmec_simulated_user');
    }
  }
}

export const mockDb = new MockDatabase();
