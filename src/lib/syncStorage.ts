import { collection, getDocs, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';
import { mockDb } from './mockDb';
import { ClientData, EquipmentData, LaudoData, ChecklistData } from '../types';

let syncInProgress = false;

export async function syncAllLocalDataToFirestore() {
  if (syncInProgress) return;
  syncInProgress = true;

  try {
    console.log("Starting unified automatic Firestore synchronization (Desktop <-> Mobile)...");

    // 1. Sync Clients
    try {
      const clientsSnap = await getDocs(collection(db, 'clients'));
      const firestoreClientsMap = new Map<string, ClientData>();
      clientsSnap.forEach(d => firestoreClientsMap.set(d.id, d.data() as ClientData));

      const mockClients = mockDb.getClients();
      let localClientsRaw = null;
      try {
        localClientsRaw = localStorage.getItem('vitor_engmec_clients');
      } catch (e) {}
      const localClients: ClientData[] = localClientsRaw ? JSON.parse(localClientsRaw) : [];
      const allLocalClients = [...mockClients, ...localClients];

      for (const cli of allLocalClients) {
        if (cli && cli.id && !firestoreClientsMap.has(cli.id)) {
          await setDoc(doc(db, 'clients', cli.id), cli);
          firestoreClientsMap.set(cli.id, cli);
        }
      }

      const mergedClients = Array.from(firestoreClientsMap.values());
      localStorage.setItem('vitor_engmec_clients', JSON.stringify(mergedClients));
    } catch (e) {
      console.warn("Client sync warning:", e);
    }

    // 2. Sync Equipments
    try {
      const eqSnap = await getDocs(collection(db, 'equipments'));
      const firestoreEqMap = new Map<string, EquipmentData>();
      eqSnap.forEach(d => firestoreEqMap.set(d.id, d.data() as EquipmentData));

      const mockEqs = mockDb.getEquipments();
      let localEqsRaw = null;
      try {
        localEqsRaw = localStorage.getItem('vitor_engmec_equipments');
      } catch (e) {}
      const localEqs: EquipmentData[] = localEqsRaw ? JSON.parse(localEqsRaw) : [];
      const allLocalEqs = [...mockEqs, ...localEqs];

      for (const eq of allLocalEqs) {
        if (eq && eq.id && !firestoreEqMap.has(eq.id)) {
          await setDoc(doc(db, 'equipments', eq.id), eq);
          firestoreEqMap.set(eq.id, eq);
        }
      }

      const mergedEqs = Array.from(firestoreEqMap.values());
      localStorage.setItem('vitor_engmec_equipments', JSON.stringify(mergedEqs));
    } catch (e) {
      console.warn("Equipment sync warning:", e);
    }

    // 3. Sync Laudos (Acervo)
    try {
      const laudosSnap = await getDocs(collection(db, 'laudos'));
      const firestoreLaudosMap = new Map<string, LaudoData>();
      laudosSnap.forEach(d => firestoreLaudosMap.set(d.id, d.data() as LaudoData));

      const mockLaudos = mockDb.getLaudos();
      let localLaudosRaw = null;
      try {
        localLaudosRaw = localStorage.getItem('vitor_engmec_laudos');
      } catch (e) {}
      const localLaudos: LaudoData[] = localLaudosRaw ? JSON.parse(localLaudosRaw) : [];
      const allLocalLaudos = [...mockLaudos, ...localLaudos];

      for (const l of allLocalLaudos) {
        if (l && l.id && !firestoreLaudosMap.has(l.id)) {
          await setDoc(doc(db, 'laudos', l.id), l);
          firestoreLaudosMap.set(l.id, l);
        }
      }

      const mergedLaudos = Array.from(firestoreLaudosMap.values());
      localStorage.setItem('vitor_engmec_laudos', JSON.stringify(mergedLaudos));
    } catch (e) {
      console.warn("Laudos sync warning:", e);
    }

    // 4. Sync Checklists
    try {
      const chkSnap = await getDocs(collection(db, 'checklists'));
      const firestoreChkMap = new Map<string, ChecklistData>();
      chkSnap.forEach(d => firestoreChkMap.set(d.id, d.data() as ChecklistData));

      const mockChks = mockDb.getChecklists();
      let localChksRaw = null;
      try {
        localChksRaw = localStorage.getItem('vitor_engmec_checklists');
      } catch (e) {}
      const localChks: ChecklistData[] = localChksRaw ? JSON.parse(localChksRaw) : [];
      const allLocalChks = [...mockChks, ...localChks];

      for (const chk of allLocalChks) {
        if (chk && chk.id && !firestoreChkMap.has(chk.id)) {
          await setDoc(doc(db, 'checklists', chk.id), chk);
          firestoreChkMap.set(chk.id, chk);
        }
      }

      const mergedChks = Array.from(firestoreChkMap.values());
      localStorage.setItem('vitor_engmec_checklists', JSON.stringify(mergedChks));
    } catch (e) {
      console.warn("Checklists sync warning:", e);
    }

    // 5. Sync Laudos Gerados com IA
    try {
      const genSnap = await getDocs(collection(db, 'laudos_gerados'));
      const firestoreGenMap = new Map<string, any>();
      genSnap.forEach(d => firestoreGenMap.set(d.id, d.data()));

      let localGenRaw = null;
      try {
        localGenRaw = localStorage.getItem('vitor_laudos_gerados');
      } catch (e) {}
      const localGen = localGenRaw ? JSON.parse(localGenRaw) : [];

      for (const g of localGen) {
        if (g && g.id && !firestoreGenMap.has(g.id)) {
          await setDoc(doc(db, 'laudos_gerados', g.id), g);
          firestoreGenMap.set(g.id, g);
        }
      }

      const mergedGen = Array.from(firestoreGenMap.values());
      localStorage.setItem('vitor_laudos_gerados', JSON.stringify(mergedGen));
    } catch (e) {
      console.warn("Laudos Gerados sync warning:", e);
    }

    // 6. Sync Pricing Proposals (unify 'proposals' collection)
    try {
      const propSnap = await getDocs(collection(db, 'proposals'));
      const firestorePropMap = new Map<string, any>();
      propSnap.forEach(d => firestorePropMap.set(d.id, d.data()));

      // Also check legacy 'pricing_proposals' if any
      try {
        const legacySnap = await getDocs(collection(db, 'pricing_proposals'));
        legacySnap.forEach(d => {
          if (!firestorePropMap.has(d.id)) {
            firestorePropMap.set(d.id, d.data());
          }
        });
      } catch (e) {}

      let localPropRaw = null;
      try {
        localPropRaw = localStorage.getItem('vitor_engmec_pricing_proposals');
      } catch (e) {}
      const localProp = localPropRaw ? JSON.parse(localPropRaw) : [];

      for (const p of localProp) {
        if (p && p.id && !firestorePropMap.has(p.id)) {
          await setDoc(doc(db, 'proposals', p.id), p);
          firestorePropMap.set(p.id, p);
        }
      }

      const mergedProp = Array.from(firestorePropMap.values());
      localStorage.setItem('vitor_engmec_pricing_proposals', JSON.stringify(mergedProp));
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
