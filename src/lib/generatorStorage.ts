import { collection, addDoc, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, getIsRealFirebase } from './firebase';

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

export async function saveGeneratorLaudo(type: string, clientName: string, equipmentModel: string, date: string, formData: any, id?: string) {
  // Extract laudoNumber/report identifier to determine if it is an overwrite
  let currentLaudoNumber = '';
  if (formData) {
    if (formData.laudoParams?.laudoNumber) {
      currentLaudoNumber = formData.laudoParams.laudoNumber;
    } else if (formData.processo?.laudoNumber) {
      currentLaudoNumber = formData.processo.laudoNumber;
    } else if (formData.params?.laudoNumber) {
      currentLaudoNumber = formData.params.laudoNumber;
    }
  }

  let finalId = id;
  let originalCreatedAt = new Date().toISOString();

  // If there's a report number, search for an existing entry with the same type and report number to overwrite it
  if (currentLaudoNumber) {
    try {
      const existingLaudos = await getGeneratorLaudos();
      const match = existingLaudos.find(l => {
        if (l.type !== type) return false;
        
        let savedLaudoNumber = '';
        if (l.formData) {
          if (l.formData.laudoParams?.laudoNumber) {
            savedLaudoNumber = l.formData.laudoParams.laudoNumber;
          } else if (l.formData.processo?.laudoNumber) {
            savedLaudoNumber = l.formData.processo.laudoNumber;
          } else if (l.formData.params?.laudoNumber) {
            savedLaudoNumber = l.formData.params.laudoNumber;
          }
        }
        return savedLaudoNumber && savedLaudoNumber.trim().toLowerCase() === currentLaudoNumber.trim().toLowerCase();
      });

      if (match) {
        finalId = match.id;
        originalCreatedAt = match.createdAt;
      }
    } catch (e) {
      console.warn("Failed to check for duplicate report number:", e);
    }
  } else if (id) {
    // If no report number but we received an ID, try to preserve its original createdAt
    try {
      const existingLaudos = await getGeneratorLaudos();
      const found = existingLaudos.find(l => l.id === id);
      if (found) {
        originalCreatedAt = found.createdAt;
      }
    } catch (e) {
      // ignore
    }
  }

  const laudoId = finalId || 'gl-' + Math.random().toString(36).substr(2, 9);
  const data: SavedGeneratorLaudo = {
    id: laudoId,
    type,
    clientName: clientName || 'Cliente não informado',
    equipmentModel: equipmentModel || 'Equipamento/Objeto não informado',
    date: date || new Date().toISOString().split('T')[0],
    formData,
    createdAt: originalCreatedAt,
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'laudos_gerados', laudoId), data);
  } catch (e) {
    console.error("Error saving to Firestore:", e);
  }
  saveLocal(data);
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

export async function getGeneratorLaudos(): Promise<SavedGeneratorLaudo[]> {
  const localList = getLocalList();
  let list: SavedGeneratorLaudo[] = [];
  
  try {
    const snap = await getDocs(collection(db, 'laudos_gerados'));
    snap.forEach(d => list.push(d.data() as SavedGeneratorLaudo));
  } catch (e) {
    console.warn("Failed to fetch from Firestore:", e);
  }

  // Merge local list items missing in Firestore without blocking
  if (localList.length > 0) {
    for (const item of localList) {
      if (item && item.id && !list.some(f => f.id === item.id)) {
        list.push(item);
        // Non-blocking background sync
        setDoc(doc(db, 'laudos_gerados', item.id), item).catch(err => {
          console.warn("Failed to sync local laudo to Firestore:", err);
        });
      }
    }
  }

  if (list.length === 0) {
    list = localList;
  }

  // Clean / filter only valid entries with clientName
  const cleaned = list.filter(l => l && l.clientName && l.clientName.trim() !== '');

  return cleaned.sort((a,b) => new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime());
}

export async function deleteGeneratorLaudo(id: string) {
  if (getIsRealFirebase()) {
    try {
      await deleteDoc(doc(db, 'laudos_gerados', id));
    } catch (e) {
      console.warn("Failed to delete from Firestore:", e);
    }
  }
  try {
    const list = getLocalList();
    const filtered = list.filter(item => item.id !== id);
    localStorage.setItem('vitor_laudos_gerados', JSON.stringify(filtered));
  } catch (e) {
    console.warn("Failed to delete from localStorage:", e);
  }
}
