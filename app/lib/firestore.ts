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
  QueryConstraint,
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
  subPackageId?: string;
  title: string;
  status?: string;
  progress?: number;
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

function isOwner(data: { ownerId?: string; createdBy?: string }, userId: string) {
  if (data.ownerId) {
    return data.ownerId === userId;
  }
  return data.createdBy === userId;
}

async function fetchOwnedDocs(
  collectionPath: string,
  userId: string,
  extraConstraints: QueryConstraint[] = []
) {
  const primarySnap = await getDocs(
    query(col(collectionPath), where("ownerId", "==", userId), ...extraConstraints)
  );

  if (primarySnap.docs.length > 0) {
    return primarySnap.docs;
  }

  const fallbackSnap = await getDocs(
    query(col(collectionPath), where("createdBy", "==", userId), ...extraConstraints)
  );

  return fallbackSnap.docs;
}

function col(path: string) {
  return collection(ensureDb(), path);
}

export class PackageService {
  static async list(): Promise<Package[]> {
    const user = requireUser();
    const docs = await fetchOwnedDocs("packages", user.uid);
    return docs.map((d) => ({ id: d.id, ...(d.data() as Package) }));
  }

  static async get(id: string): Promise<Package | null> {
    const user = requireUser();
    const d = await getDoc(doc(col("packages"), id));
    if (!d.exists()) return null;
    const data = d.data() as Package;
    if (!isOwner(data, user.uid)) {
      throw new Error("Você não tem permissão para acessar este pacote.");
    }
    return { id: d.id, ...data };
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
    requireUser();
    await updateDoc(doc(col("packages"), id), data as DocumentData);
  }

  static async remove(id: string) {
    requireUser();
    await deleteDoc(doc(col("packages"), id));
  }
}

export class SubPackageService {
  static async listByPackage(packageId: string): Promise<SubPackage[]> {
    const user = requireUser();
    const docs = await fetchOwnedDocs("subpackages", user.uid, [where("packageId", "==", packageId)]);
    return docs.map((d) => ({ id: d.id, ...(d.data() as SubPackage) }));
  }

  static async get(id: string): Promise<SubPackage | null> {
    const user = requireUser();
    const d = await getDoc(doc(col("subpackages"), id));
    if (!d.exists()) return null;
    const data = d.data() as SubPackage;
    if (!isOwner(data, user.uid)) {
      throw new Error("Você não tem permissão para acessar este subpacote.");
    }
    return { id: d.id, ...data };
  }

  static async create(data: SubPackage): Promise<string> {
    const user = requireUser();
    const ref = await addDoc(
      col("subpackages"),
      {
        ...data,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        ownerId: user.uid,
        ownerEmail: user.email ?? null,
      } as DocumentData
    );
    return ref.id;
  }

  static async update(id: string, data: Partial<SubPackage>) {
    requireUser();
    await updateDoc(doc(col("subpackages"), id), data as DocumentData);
  }

  static async remove(id: string) {
    requireUser();
    await deleteDoc(doc(col("subpackages"), id));
  }
}

export class WorkOrderService {
  static async listByPackage(packageId: string): Promise<WorkOrder[]> {
    const user = requireUser();
    const docs = await fetchOwnedDocs("workorders", user.uid, [where("packageId", "==", packageId)]);
    return docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrder) }));
  }

  static async listBySubPackage(subPackageId: string): Promise<WorkOrder[]> {
    const user = requireUser();
    const docs = await fetchOwnedDocs("workorders", user.uid, [where("subPackageId", "==", subPackageId)]);
    return docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrder) }));
  }

  static async get(id: string): Promise<WorkOrder | null> {
    const user = requireUser();
    const d = await getDoc(doc(col("workorders"), id));
    if (!d.exists()) return null;
    const data = d.data() as WorkOrder;
    if (!isOwner(data, user.uid)) {
      throw new Error("Você não tem permissão para acessar este serviço.");
    }
    return { id: d.id, ...data };
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
    requireUser();
    await updateDoc(doc(col("workorders"), id), data as DocumentData);
  }

  static async remove(id: string) {
    requireUser();
    await deleteDoc(doc(col("workorders"), id));
  }
}

export class WorkOrderLogService {
  static async listByWorkOrder(workOrderId: string): Promise<WorkOrderLog[]> {
    const user = requireUser();
    const docs = await fetchOwnedDocs("workorderlogs", user.uid, [where("workOrderId", "==", workOrderId)]);
    return docs.map((d) => ({ id: d.id, ...(d.data() as WorkOrderLog) }));
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
