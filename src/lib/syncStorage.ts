import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { mockDb } from './mockDb';
import { ClientData, EquipmentData, LaudoData, ChecklistData } from '../types';

let syncInProgress = false;

export async function syncAllLocalDataToFirestore() {
  if (syncInProgress) return;
  syncInProgress = true;

  try {
    console.log("Starting unified automatic Firestore synchronization...");

    // 1. Sync Clients
    try {
      const clientsSnap = await getDocs(collection(db, 'clients'));
      const existingClientIds = new Set<string>();
      clientsSnap.forEach(d => existingClientIds.add(d.id));

      const mockClients = mockDb.getClients();
      let localClientsRaw = null;
      try {
        localClientsRaw = localStorage.getItem('vitor_engmec_clients');
      } catch (e) {}
      const localClients: ClientData[] = localClientsRaw ? JSON.parse(localClientsRaw) : [];
      const allClients = [...mockClients, ...localClients];

      for (const cli of allClients) {
        if (cli && cli.id && (!existingClientIds.has(cli.id) || cli.name?.toLowerCase().includes('campo grande') || cli.company?.toLowerCase().includes('campo grande'))) {
          await setDoc(doc(db, 'clients', cli.id), cli);
          existingClientIds.add(cli.id);
        }
      }
    } catch (e) {
      console.warn("Client sync warning:", e);
    }

    // 2. Sync Equipments
    try {
      const eqSnap = await getDocs(collection(db, 'equipments'));
      const existingEqIds = new Set<string>();
      eqSnap.forEach(d => existingEqIds.add(d.id));

      const mockEqs = mockDb.getEquipments();
      let localEqsRaw = null;
      try {
        localEqsRaw = localStorage.getItem('vitor_engmec_equipments');
      } catch (e) {}
      const localEqs: EquipmentData[] = localEqsRaw ? JSON.parse(localEqsRaw) : [];
      const allEqs = [...mockEqs, ...localEqs];

      for (const eq of allEqs) {
        if (eq && eq.id && !existingEqIds.has(eq.id)) {
          await setDoc(doc(db, 'equipments', eq.id), eq);
          existingEqIds.add(eq.id);
        }
      }
    } catch (e) {
      console.warn("Equipment sync warning:", e);
    }

    // 3. Sync Laudos (Acervo)
    try {
      const laudosSnap = await getDocs(collection(db, 'laudos'));
      const existingLaudoIds = new Set<string>();
      laudosSnap.forEach(d => existingLaudoIds.add(d.id));

      const mockLaudos = mockDb.getLaudos();
      let localLaudosRaw = null;
      try {
        localLaudosRaw = localStorage.getItem('vitor_engmec_laudos');
      } catch (e) {}
      const localLaudos: LaudoData[] = localLaudosRaw ? JSON.parse(localLaudosRaw) : [];
      const allLaudos = [...mockLaudos, ...localLaudos];

      for (const l of allLaudos) {
        if (l && l.id && !existingLaudoIds.has(l.id)) {
          await setDoc(doc(db, 'laudos', l.id), l);
          existingLaudoIds.add(l.id);
        }
      }
    } catch (e) {
      console.warn("Laudos sync warning:", e);
    }

    // 4. Sync Checklists
    try {
      const chkSnap = await getDocs(collection(db, 'checklists'));
      const existingChkIds = new Set<string>();
      chkSnap.forEach(d => existingChkIds.add(d.id));

      const mockChks = mockDb.getChecklists();
      let localChksRaw = null;
      try {
        localChksRaw = localStorage.getItem('vitor_engmec_checklists');
      } catch (e) {}
      const localChks: ChecklistData[] = localChksRaw ? JSON.parse(localChksRaw) : [];
      const allChks = [...mockChks, ...localChks];

      for (const chk of allChks) {
        if (chk && chk.id && !existingChkIds.has(chk.id)) {
          await setDoc(doc(db, 'checklists', chk.id), chk);
          existingChkIds.add(chk.id);
        }
      }
    } catch (e) {
      console.warn("Checklists sync warning:", e);
    }

    // 5. Sync Laudos Gerados com IA
    try {
      const genSnap = await getDocs(collection(db, 'laudos_gerados'));
      const existingGenIds = new Set<string>();
      genSnap.forEach(d => existingGenIds.add(d.id));

      let localGenRaw = null;
      try {
        localGenRaw = localStorage.getItem('vitor_laudos_gerados');
      } catch (e) {}
      const localGen = localGenRaw ? JSON.parse(localGenRaw) : [];

      for (const g of localGen) {
        if (g && g.id && !existingGenIds.has(g.id)) {
          await setDoc(doc(db, 'laudos_gerados', g.id), g);
          existingGenIds.add(g.id);
        }
      }
    } catch (e) {
      console.warn("Laudos Gerados sync warning:", e);
    }

    // 6. Sync Pricing Proposals
    try {
      const propSnap = await getDocs(collection(db, 'pricing_proposals'));
      const existingPropIds = new Set<string>();
      propSnap.forEach(d => existingPropIds.add(d.id));

      let localPropRaw = null;
      try {
        localPropRaw = localStorage.getItem('vitor_engmec_pricing_proposals');
      } catch (e) {}
      const localProp = localPropRaw ? JSON.parse(localPropRaw) : [];

      for (const p of localProp) {
        if (p && p.id && !existingPropIds.has(p.id)) {
          await setDoc(doc(db, 'pricing_proposals', p.id), p);
          existingPropIds.add(p.id);
        }
      }
    } catch (e) {
      console.warn("Pricing proposals sync warning:", e);
    }

    console.log("Unified Firestore synchronization completed successfully.");
  } catch (err) {
    console.error("Failed to complete Firestore synchronization:", err);
  } finally {
    syncInProgress = false;
  }
}
