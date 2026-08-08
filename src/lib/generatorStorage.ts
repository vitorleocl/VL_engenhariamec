import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface SavedGeneratorLaudo {
  id: string;
  type: string;
  clientName: string;
  equipmentModel: string;
  date: string;
  formData: any;
  createdAt: string;
  updatedAt: string;
}

export function extractLaudoNumber(formData: any): string {
  if (!formData || typeof formData !== 'object') return '';
  return (
    formData.variables?.numero_laudo ||
    formData.laudoParams?.laudoNumber ||
    formData.processo?.laudoNumber ||
    formData.params?.laudoNumber ||
    formData.numero_laudo ||
    ''
  ).trim();
}

export async function saveGeneratorLaudo(
  type: string, 
  clientName: string, 
  equipmentModel: string, 
  dateOrFormData: any, 
  formDataOrId?: any, 
  explicitId?: string
) {
  let resolvedDate = new Date().toISOString().split('T')[0];
  let resolvedFormData: any = {};
  let resolvedId: string | undefined = explicitId;

  // Flexible overload detection: if dateOrFormData is an object, arguments are (type, clientName, equipmentModel, formData, id)
  if (typeof dateOrFormData === 'object' && dateOrFormData !== null) {
    resolvedFormData = dateOrFormData;
    resolvedId = typeof formDataOrId === 'string' ? formDataOrId : explicitId;
  } else {
    // Standard signature: (type, clientName, equipmentModel, date, formData, id)
    if (typeof dateOrFormData === 'string' && dateOrFormData.trim()) {
      resolvedDate = dateOrFormData;
    }
    resolvedFormData = typeof formDataOrId === 'object' && formDataOrId !== null ? formDataOrId : {};
    resolvedId = explicitId;
  }

  // Extract laudoNumber/report identifier to determine if it is an overwrite
  const currentLaudoNumber = extractLaudoNumber(resolvedFormData);

  const resolvedClientName = clientName || resolvedFormData?.clientName || resolvedFormData?.cliente || resolvedFormData?.laudoParams?.clientName || resolvedFormData?.variables?.nome_cliente || 'Cliente Geral';
  const resolvedEquipment = equipmentModel || resolvedFormData?.equipmentName || resolvedFormData?.veiculoModelo || resolvedFormData?.model || resolvedFormData?.variables?.modelo_veiculo || 'Equipamento/Objeto de Inspeção';

  let finalId = resolvedId;
  let originalCreatedAt = new Date().toISOString();

  try {
    const existingLaudos = await getGeneratorLaudos();

    // 1. Check if resolvedId matches an existing item
    if (resolvedId) {
      const found = existingLaudos.find(l => l.id === resolvedId);
      if (found) {
        finalId = found.id;
        originalCreatedAt = found.createdAt;
      }
    }

    // 2. Check if currentLaudoNumber matches an existing item
    if (!finalId && currentLaudoNumber && currentLaudoNumber.length > 1) {
      const match = existingLaudos.find(l => {
        const savedNumber = extractLaudoNumber(l.formData);
        return savedNumber && savedNumber.toLowerCase() === currentLaudoNumber.toLowerCase();
      });
      if (match) {
        finalId = match.id;
        originalCreatedAt = match.createdAt;
      }
    }

    // 3. Check if clientName + equipmentModel + templateTitle matches an existing recent draft
    if (!finalId && resolvedClientName && resolvedClientName !== 'Cliente Geral') {
      const templateTitle = resolvedFormData?.templateTitle || resolvedFormData?.templateId;
      const match = existingLaudos.find(l => {
        const sameClient = l.clientName.trim().toLowerCase() === resolvedClientName.trim().toLowerCase();
        const sameEquipment = l.equipmentModel.trim().toLowerCase() === resolvedEquipment.trim().toLowerCase();
        const sameTitle = templateTitle && l.formData?.templateTitle === templateTitle;
        return sameClient && (sameEquipment || sameTitle);
      });
      if (match) {
        finalId = match.id;
        originalCreatedAt = match.createdAt;
      }
    }
  } catch (e) {
    console.warn("Error resolving overwrite target for report:", e);
  }

  const laudoId = finalId || 'gl-' + Math.random().toString(36).substr(2, 9);
  const data: SavedGeneratorLaudo = {
    id: laudoId,
    type,
    clientName: resolvedClientName,
    equipmentModel: resolvedEquipment,
    date: resolvedDate,
    formData: resolvedFormData,
    createdAt: originalCreatedAt,
    updatedAt: new Date().toISOString(),
  };

  // Ensure local persistence immediately so data is never lost
  saveLocal(data);

  let firestoreSuccess = false;
  try {
    console.log(`[generatorStorage] Gravando laudo no Firestore (ID: ${laudoId})...`);
    // Race Firestore write with a 8s timeout to prevent hanging on poor connections
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout de conexão com o banco de dados (8s)')), 8000)
    );

    await Promise.race([
      setDoc(doc(db, 'laudos_gerados', laudoId), data),
      timeoutPromise
    ]);

    firestoreSuccess = true;
    console.log(`[generatorStorage] Laudo ${laudoId} gravado com SUCESSO no Firestore.`);
  } catch (e: any) {
    console.warn(`[generatorStorage] Aviso ao gravar no Firestore (dados mantidos no LocalStorage):`, e?.message || e);
    // If it was a network error or offline mode, local data is still safely saved
  }

  return laudoId;
}

function saveLocal(data: SavedGeneratorLaudo) {
  try {
    const list = getLocalList();
    const idx = list.findIndex(item => item.id === data.id);
    if (idx >= 0) {
      list[idx] = data;
    } else {
      list.push(data);
    }
    localStorage.setItem('vitor_laudos_gerados', JSON.stringify(list));
  } catch (e) {
    console.warn("Failed to write to localStorage:", e);
  }
}

export function getLocalList(): SavedGeneratorLaudo[] {
  try {
    const val = localStorage.getItem('vitor_laudos_gerados');
    return val ? JSON.parse(val) : [];
  } catch (e) {
    return [];
  }
}

function normalizeLaudo(l: any): SavedGeneratorLaudo | null {
  if (!l || typeof l !== 'object' || !l.id) return null;
  const clientName = l.clientName || l.formData?.clientName || l.formData?.cliente || l.formData?.laudoParams?.clientName || l.formData?.processo?.contratante || l.formData?.params?.clientName || 'Cliente Geral';
  const equipmentModel = l.equipmentModel || l.formData?.equipmentName || l.formData?.veiculoModelo || l.formData?.model || l.formData?.laudoParams?.equipmentName || 'Equipamento/Objeto de Inspeção';
  return {
    id: String(l.id),
    type: l.type || 'gerador',
    clientName,
    equipmentModel,
    date: l.date || new Date().toISOString().split('T')[0],
    formData: l.formData || {},
    createdAt: l.createdAt || l.updatedAt || new Date().toISOString(),
    updatedAt: l.updatedAt || new Date().toISOString(),
  };
}

export function deduplicateLaudos(list: SavedGeneratorLaudo[]): SavedGeneratorLaudo[] {
  const map = new Map<string, SavedGeneratorLaudo>();

  // Sort ascending by date so newer updates overwrite older records in map
  const ascList = [...list].sort((a, b) => 
    new Date(a.updatedAt || a.createdAt || 0).getTime() - new Date(b.updatedAt || b.createdAt || 0).getTime()
  );

  for (const item of ascList) {
    let key = item.id;
    const num = extractLaudoNumber(item.formData);
    if (num && num.length > 1) {
      key = `num_${item.type}_${num.toLowerCase()}`;
    }
    map.set(key, item);
  }

  const result = Array.from(map.values());
  return result.sort((a, b) => 
    new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime()
  );
}

export function getDeletedIds(): string[] {
  try {
    const raw = localStorage.getItem('vitor_deleted_laudo_ids');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function markAsDeleted(id: string, reportNumber?: string) {
  try {
    const list = getDeletedIds();
    const cleanId = (id || '').trim();
    const cleanNum = (reportNumber || '').trim().toLowerCase();
    if (cleanId && !list.includes(cleanId)) list.push(cleanId);
    if (cleanNum && !list.includes(cleanNum)) list.push(cleanNum);
    localStorage.setItem('vitor_deleted_laudo_ids', JSON.stringify(list));
  } catch (e) {}
}

export function isDeleted(id: string, reportNumber?: string): boolean {
  const list = getDeletedIds();
  const cleanId = (id || '').trim();
  const cleanNum = (reportNumber || '').trim().toLowerCase();
  if (cleanId && list.includes(cleanId)) return true;
  if (cleanNum && list.includes(cleanNum)) return true;
  return false;
}

export async function getGeneratorLaudos(): Promise<SavedGeneratorLaudo[]> {
  const localList = getLocalList();
  let list: SavedGeneratorLaudo[] = [];
  
  try {
    const snap = await getDocs(collection(db, 'laudos_gerados'));
    snap.forEach(d => {
      const norm = normalizeLaudo(d.data());
      if (norm && !isDeleted(norm.id, extractLaudoNumber(norm.formData))) {
        list.push(norm);
      }
    });
  } catch (e) {
    console.warn("Failed to fetch from Firestore:", e);
  }

  // Merge local list items missing in Firestore without blocking
  if (localList.length > 0) {
    for (const item of localList) {
      const normItem = normalizeLaudo(item);
      if (normItem && !isDeleted(normItem.id, extractLaudoNumber(normItem.formData)) && !list.some(f => f.id === normItem.id)) {
        list.push(normItem);
        // Non-blocking background sync
        setDoc(doc(db, 'laudos_gerados', normItem.id), normItem).catch(err => {
          console.warn("Failed to sync local laudo to Firestore:", err);
        });
      }
    }
  }

  if (list.length === 0) {
    localList.forEach(item => {
      const normItem = normalizeLaudo(item);
      if (normItem && !isDeleted(normItem.id, extractLaudoNumber(normItem.formData))) {
        list.push(normItem);
      }
    });
  }

  const sorted = deduplicateLaudos(list).filter(l => !isDeleted(l.id, extractLaudoNumber(l.formData)));
  try {
    localStorage.setItem('vitor_laudos_gerados', JSON.stringify(sorted));
  } catch (e) {}

  return sorted;
}

export function subscribeToGeneratorLaudos(callback: (laudos: SavedGeneratorLaudo[]) => void) {
  try {
    return onSnapshot(collection(db, 'laudos_gerados'), (snap) => {
      const list: SavedGeneratorLaudo[] = [];
      snap.forEach(d => {
        const norm = normalizeLaudo(d.data());
        if (norm && !isDeleted(norm.id, extractLaudoNumber(norm.formData))) {
          list.push(norm);
        }
      });
      // Fallback merge local list
      const localList = getLocalList();
      for (const item of localList) {
        const normItem = normalizeLaudo(item);
        if (normItem && !isDeleted(normItem.id, extractLaudoNumber(normItem.formData)) && !list.some(f => f.id === normItem.id)) {
          list.push(normItem);
        }
      }
      const sorted = deduplicateLaudos(list).filter(l => !isDeleted(l.id, extractLaudoNumber(l.formData)));
      try { localStorage.setItem('vitor_laudos_gerados', JSON.stringify(sorted)); } catch (e) {}
      callback(sorted);
    }, (err) => {
      console.warn("Error listening to laudos_gerados:", err);
      callback(deduplicateLaudos(getLocalList()).filter(l => !isDeleted(l.id, extractLaudoNumber(l.formData))));
    });
  } catch (e) {
    callback(deduplicateLaudos(getLocalList()).filter(l => !isDeleted(l.id, extractLaudoNumber(l.formData))));
    return () => {};
  }
}

export async function deleteGeneratorLaudo(id: string, reportNumber?: string) {
  const targetReportNum = (reportNumber || '').trim().toLowerCase();

  // 1. Mark as deleted in tracking set immediately
  markAsDeleted(id, targetReportNum);

  // 2. Remove from localStorage synchronously FIRST
  try {
    const list = getLocalList();
    const filtered = list.filter(item => {
      const matchId = item.id === id;
      const itemNum = extractLaudoNumber(item.formData).toLowerCase();
      const matchNum = targetReportNum && itemNum && itemNum === targetReportNum;
      return !matchId && !matchNum;
    });
    localStorage.setItem('vitor_laudos_gerados', JSON.stringify(filtered));
  } catch (e) {
    console.warn("Failed to delete from localStorage:", e);
  }

  // 3. Delete direct document by ID from Firestore
  try {
    await deleteDoc(doc(db, 'laudos_gerados', id));
  } catch (e) {
    console.warn("Direct delete by ID failed or doc not found in Firestore:", e);
  }

  // 4. Query Firestore collection to remove any matching documents
  try {
    const snap = await getDocs(collection(db, 'laudos_gerados'));
    snap.forEach(async (d) => {
      const data = d.data();
      const num = extractLaudoNumber(data.formData).toLowerCase();
      const matchId = d.id === id || data.id === id;
      const matchNum = targetReportNum && num && num === targetReportNum;

      if (matchId || matchNum) {
        try {
          await deleteDoc(doc(db, 'laudos_gerados', d.id));
        } catch (err) {
          console.warn("Failed to delete matching Firestore doc:", d.id, err);
        }
      }
    });
  } catch (e) {
    console.warn("Failed querying Firestore for document deletion:", e);
  }
}
