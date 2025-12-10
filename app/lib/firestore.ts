import { ensureAuth, ensureDb } from "@/app/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";

export type Package = {
  id?: string;
  name: string;
  description?: string;
  createdAt?: any;
  createdBy?: string;
  ownerId?: string;
  ownerEmail?: string | null;
};

export type SubPackage = {
  id?: string;
  packageId: string;
  name: string;
  description?: string;
  createdAt?: any;
  createdBy?: string;
  ownerId?: string;
  ownerEmail?: string | null;
};

export type WorkOrder = {
  id?: string;
  packageId: string;
  subPackageId?: string | null;
  title: string;
  status?: string;
  progress?: number;
  createdAt?: any;
  updatedAt?: any;
  office?: string | number | null;
  osNumber?: string | number | null;
  tag?: string | number | null;
  machineName?: string | null;
  task?: string | null;
  responsible?: string | null;
  importOrder?: number | null;
  [key: string]: any;
  createdBy?: string;
  ownerId?: string;
  ownerEmail?: string | null;
};

export type WorkOrderLog = {
  id?: string;
  workOrderId: string;
  message: string;
  createdAt?: any;
  createdBy?: string;
  ownerId?: string;
  ownerEmail?: string | null;
};

function getCurrentUser() {
  try {
    return ensureAuth().currentUser;
  } catch (error) {
    console.warn("Não foi possível obter o usuário atual:", error);
    return null;
  }
}

function col(path: string) {
  return collection(ensureDb(), path);
}

function removeUndefined<T extends Record<string, any>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as T;
}

export class PackageService {
  static async list(): Promise<Package[]> {
    const docs = await getDocs(col("packages"));
    return docs.docs.map((d) => ({ id: d.id, ...(d.data() as Package) }));
  }

  static async get(id: string): Promise<Package | null> {
    const d = await getDoc(doc(col("packages"), id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as Package) };
  }

  static async create(data: Package): Promise<string> {
    const user = getCurrentUser();
    const ref = await addDoc(col("packages"), {
      ...data,
      createdAt: serverTimestamp(),
      createdBy: user?.uid ?? null,
      ownerId: user?.uid ?? null,
      ownerEmail: user?.email ?? null,
    } as DocumentData);
    return ref.id;
  }

  static async update(id: string, data: Partial<Package>) {
    await updateDoc(doc(col("packages"), id), data as DocumentData);
  }

  static async remove(id: string) {
    await deleteDoc(doc(col("packages"), id));
  }
}

export class SubPackageService {
  static async listByPackage(packageId: string): Promise<SubPackage[]> {
    const docs = await getDocs(query(col("subpackages"), where("packageId", "==", packageId)));
    return docs.docs.map((d) => ({ id: d.id, ...(d.data() as SubPackage) }));
  }

  static async get(id: string): Promise<SubPackage | null> {
    const d = await getDoc(doc(col("subpackages"), id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as SubPackage) };
  }

  static async create(data: SubPackage): Promise<string> {
    const user = getCurrentUser();
    const ref = await addDoc(
      col("subpackages"),
      {
        ...data,
        createdAt: serverTimestamp(),
        createdBy: user?.uid ?? null,
        ownerId: user?.uid ?? null,
        ownerEmail: user?.email ?? null,
      } as DocumentData
    );
    return ref.id;
  }

  static async update(id: string, data: Partial<SubPackage>) {
    await updateDoc(doc(col("subpackages"), id), data as DocumentData);
  }

  static async remove(id: string) {
    await deleteDoc(doc(col("subpackages"), id));
  }
}

export class WorkOrderService {
  static async listByPackage(packageId: string): Promise<WorkOrder[]> {
    const docs = await getDocs(query(col("workorders"), where("packageId", "==", packageId)));
    return docs.docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrder) }));
  }

  static async listBySubPackage(subPackageId: string): Promise<WorkOrder[]> {
    const docs = await getDocs(query(col("workorders"), where("subPackageId", "==", subPackageId)));
    return docs.docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrder) }));
  }

  static async get(id: string): Promise<WorkOrder | null> {
    const d = await getDoc(doc(col("workorders"), id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as WorkOrder) };
  }

  static async create(data: WorkOrder): Promise<string> {
    const user = getCurrentUser();
    const ref = await addDoc(
      col("workorders"),
      removeUndefined({
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.uid ?? null,
        ownerId: user?.uid ?? null,
        ownerEmail: user?.email ?? null,
      }) as DocumentData
    );
    return ref.id;
  }

  static async update(id: string, data: Partial<WorkOrder>) {
    await updateDoc(
      doc(col("workorders"), id),
      removeUndefined({ ...data, updatedAt: serverTimestamp() }) as DocumentData
    );
  }

  static async remove(id: string) {
    await deleteDoc(doc(col("workorders"), id));
  }
}

export class WorkOrderLogService {
  static async listByWorkOrder(workOrderId: string): Promise<WorkOrderLog[]> {
    const docs = await getDocs(query(col("workorderlogs"), where("workOrderId", "==", workOrderId)));
    return docs.docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrderLog) }));
  }

  static async add(log: WorkOrderLog): Promise<string> {
    const user = getCurrentUser();
    const ref = await addDoc(col("workorderlogs"), {
      ...log,
      createdAt: serverTimestamp(),
      createdBy: user?.uid ?? null,
      ownerId: user?.uid ?? null,
      ownerEmail: user?.email ?? null,
    } as DocumentData);
    return ref.id;
  }
}

export default {
  PackageService,
  SubPackageService,
  WorkOrderService,
  WorkOrderLogService,
};
