import firebase, { ensureDb } from "@/app/lib/firebase";
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
  QuerySnapshot,
} from "firebase/firestore";

export type Package = {
  id?: string;
  name: string;
  description?: string;
  createdAt?: any;
};

export type SubPackage = {
  id?: string;
  packageId: string;
  name: string;
  description?: string;
};

export type WorkOrder = {
  id?: string;
  packageId: string;
  subPackageId?: string;
  title: string;
  status?: string;
  createdAt?: any;
  office?: string | number | null;
  osNumber?: string | number | null;
  tag?: string | number | null;
  machineName?: string | null;
  task?: string | null;
  responsible?: string | null;
  [key: string]: any;
};

export type WorkOrderLog = {
  id?: string;
  workOrderId: string;
  message: string;
  createdAt?: any;
};

function col(path: string) {
  return collection(ensureDb(), path);
}

export class PackageService {
  static async list(): Promise<Package[]> {
    const snap = await getDocs(col("packages"));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Package) }));
  }

  static async get(id: string): Promise<Package | null> {
    const d = await getDoc(doc(col("packages"), id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as Package) };
  }

  static async create(data: Package): Promise<string> {
    const ref = await addDoc(col("packages"), {
      ...data,
      createdAt: serverTimestamp(),
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
    const q = query(col("subpackages"), where("packageId", "==", packageId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as SubPackage) }));
  }

  static async get(id: string): Promise<SubPackage | null> {
    const d = await getDoc(doc(col("subpackages"), id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as SubPackage) };
  }

  static async create(data: SubPackage): Promise<string> {
    const ref = await addDoc(col("subpackages"), data as DocumentData);
    return ref.id;
  }
}

export class WorkOrderService {
  static async listByPackage(packageId: string): Promise<WorkOrder[]> {
    const q = query(col("workorders"), where("packageId", "==", packageId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrder) }));
  }

  static async listBySubPackage(subPackageId: string): Promise<WorkOrder[]> {
    const q = query(col("workorders"), where("subPackageId", "==", subPackageId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrder) }));
  }

  static async get(id: string): Promise<WorkOrder | null> {
    const d = await getDoc(doc(col("workorders"), id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as WorkOrder) };
  }

  static async create(data: WorkOrder): Promise<string> {
    const ref = await addDoc(col("workorders"), {
      ...data,
      createdAt: serverTimestamp(),
    } as DocumentData);
    return ref.id;
  }

  static async update(id: string, data: Partial<WorkOrder>) {
    await updateDoc(doc(col("workorders"), id), data as DocumentData);
  }
}

export class WorkOrderLogService {
  static async listByWorkOrder(workOrderId: string): Promise<WorkOrderLog[]> {
    const q = query(col("workorderlogs"), where("workOrderId", "==", workOrderId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrderLog) }));
  }

  static async add(log: WorkOrderLog): Promise<string> {
    const ref = await addDoc(col("workorderlogs"), {
      ...log,
      createdAt: serverTimestamp(),
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
