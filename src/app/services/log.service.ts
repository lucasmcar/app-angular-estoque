import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, getFirestore, increment, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from 'firebase/firestore';
import { BehaviorSubject, from, map, Observable } from 'rxjs';
import { MaterialUsageLog } from '../models/material-usage-log';
import { PaintCarUsageLog } from '../models/paint-car-usage-log';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../shared/dialog/dialog/dialog.component';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  private auth;
  private firestore;
  private app;
  private db;
  private userSubject = new BehaviorSubject<FirebaseUser| null>(null);

  constructor(private dialog: MatDialog) {

    this.app =  getApp();
    this.auth = getAuth();
    this.firestore = getFirestore(this.app);

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userSubject.next(user);
      } else {
        this.userSubject.next(null);
      }
    });

    this.db = collection(this.firestore, 'materialUsageLogs');
  }

  async logMaterialUsage(docSnapshot: any, usedBy: string) {
    const usageLog: MaterialUsageLog = {
      materialId: docSnapshot.id,
      materialName: docSnapshot.data()['materialName'],
      type: 'material',
      usedBy,
      usedAt: (docSnapshot.data()['createdAt'] as Timestamp).toDate(),
      quantityUsed: 1
    };

    await addDoc(collection(this.firestore, 'materialUsageLogs'), usageLog);
}

  getMaterialUsageLogs(): Observable<MaterialUsageLog[]> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        text: 'Carregando dados'
      },
      disableClose: true
    });
    const usageLogsCollection = this.db;
    return from(getDocs(usageLogsCollection).then(snapshot => {
      dialogRef.close();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()
      } as unknown as MaterialUsageLog));
    }));

    /*return from(getDocs(usageLogsCollection)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as MaterialUsageLog)))
    );*/
  }

  async logPaintCarUsage(carPaintsId: string, colorName: string, usedBy: string, quantityUsed: number) {
    try {
      const usageLog: PaintCarUsageLog = {
        carPaintsId,
        colorName,
        usedBy,
        usedAt: serverTimestamp(),
        quantityUsed
      };

      // Salvar o log no Firebase
      await addDoc(collection(this.firestore, 'paintCarUsageLogs'), usageLog);

      // Atualizar a quantidade do material no estoque
      const materialDocRef = doc(this.firestore, 'carpaints', carPaintsId);
      await updateDoc(materialDocRef, {
        quantity: increment(-quantityUsed)
      });

    } catch (error) {
      console.error('Erro ao registrar o uso do material:', error);
    }
  }


  async saveCarPaintLog(docSnapshot: any, usedBy: string ){
    console.log(docSnapshot.data())
    const usageLog: MaterialUsageLog = {
      materialId: docSnapshot.id,
      materialName: docSnapshot.data()['colorName'],
      type: 'carpaints',
      usedBy: usedBy,
      usedAt: (docSnapshot.data()['createdAt'] as Timestamp).toDate(),
      quantityUsed: 1
    };

    // Adicionar o registro de uso na coleção "materialUsageLogs"
    await addDoc(collection(this.firestore, 'materialUsageLogs'), usageLog);
  }


}
