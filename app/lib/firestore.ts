import firebase, { ensureAuth, ensureDb } from "@/app/lib/firebase";
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
  createdBy?: string;
  ownerId?: string;
  ownerEmail?: string | null;
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

function requireUser() {
  const auth = ensureAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Usuário não autenticado. Faça login para continuar.");
  }
  return user;
}

function col(path: string) {
  return collection(ensureDb(), path);
}

export class PackageService {
  static async list(): Promise<Package[]> {
    const user = requireUser();
    const snap = await getDocs(query(col("packages"), where("createdBy", "==", user.uid)));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Package) }));
  }

  static async get(id: string): Promise<Package | null> {
    const d = await getDoc(doc(col("packages"), id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as Package) };
  }

  static async create(data: Package): Promise<string> {
    const user = requireUser();
    const ref = await addDoc(col("packages"), {
      ...data,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      ownerId: user.uid,
      ownerEmail: user.email ?? null,
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
    const user = requireUser();
    const q = query(
      col("subpackages"),
      where("packageId", "==", packageId),
      where("createdBy", "==", user.uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as SubPackage) }));
  }

  static async get(id: string): Promise<SubPackage | null> {
    const d = await getDoc(doc(col("subpackages"), id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as SubPackage) };
  }

  static async create(data: SubPackage): Promise<string> {
    const user = requireUser();
    const ref = await addDoc(
      col("subpackages"),
      {
        ...data,
        createdBy: user.uid,
        ownerId: user.uid,
        ownerEmail: user.email ?? null,
      } as DocumentData
    );
    return ref.id;
  }
}

export class WorkOrderService {
  static async listByPackage(packageId: string): Promise<WorkOrder[]> {
    const user = requireUser();
    const q = query(
      col("workorders"),
      where("packageId", "==", packageId),
      where("createdBy", "==", user.uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrder) }));
  }

  static async listBySubPackage(subPackageId: string): Promise<WorkOrder[]> {
    const user = requireUser();
    const q = query(
      col("workorders"),
      where("subPackageId", "==", subPackageId),
      where("createdBy", "==", user.uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrder) }));
  }

  static async get(id: string): Promise<WorkOrder | null> {
    const d = await getDoc(doc(col("workorders"), id));
    if (!d.exists()) return null;
    return { id: d.id, ...(d.data() as WorkOrder) };
  }

  static async create(data: WorkOrder): Promise<string> {
    const user = requireUser();
    const ref = await addDoc(col("workorders"), {
      ...data,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      ownerId: user.uid,
      ownerEmail: user.email ?? null,
    } as DocumentData);
    return ref.id;
  }

  static async update(id: string, data: Partial<WorkOrder>) {
    await updateDoc(doc(col("workorders"), id), data as DocumentData);
  }
}

export class WorkOrderLogService {
  static async listByWorkOrder(workOrderId: string): Promise<WorkOrderLog[]> {
    const user = requireUser();
    const q = query(
      col("workorderlogs"),
      where("workOrderId", "==", workOrderId),
      where("createdBy", "==", user.uid)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrderLog) }));
  }

  static async add(log: WorkOrderLog): Promise<string> {
    const user = requireUser();
    const ref = await addDoc(col("workorderlogs"), {
      ...log,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      ownerId: user.uid,
      ownerEmail: user.email ?? null,
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
