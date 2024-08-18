import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, getFirestore, increment, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { async, BehaviorSubject, from, map, Observable } from 'rxjs';
import { MaterialUsageLog } from '../models/material-usage-log';
import { PaintCarUsageLog } from '../models/paint-car-usage-log';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../shared/dialog/dialog/dialog.component';
import { DialogErrorComponent } from '../shared/dialog/dialog-error/dialog-error.component';
import { DialogSuccessComponent } from '../shared/dialog/dialog-success/dialog-success.component';

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
      type: 'Material',
      usedBy,
      usedAt: serverTimestamp(),
      quantityUsed: 1
    };

    await addDoc(collection(this.firestore, 'materialUsageLogs'), usageLog);
}

  getMaterialUsageLogs(orderByField: string, orderDirection:'asc' | 'desc' = 'asc'): Observable<MaterialUsageLog[]> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        text: 'Carregando dados'
      },
      disableClose: true
    });
    const usageLogsCollection = this.db;
    const usagelogsQuery = query(usageLogsCollection, orderBy(orderByField, orderDirection));
    return new Observable<any[]>(observer => {
      const unsubscribe = onSnapshot(usagelogsQuery, snapshot => {
        dialogRef.close();
        const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as MaterialUsageLog));
        console.log(materials)
        observer.next(materials);  // Emite os dados atualizados para os observadores
      }, error => {
        dialogRef.close();
        observer.error(error);  // Emite um erro se ocorrer algum problema
      });

      // Retorna a função de limpeza (unsubscribe) para parar de escutar as mudanças quando o Observable for destruído
      return () => unsubscribe();

    });
  }


  async saveCarPaintLog(docSnapshot: any, usedBy: string ){
    const usageLog: MaterialUsageLog = {
      materialId: docSnapshot.id,
      materialName: docSnapshot.data()['colorName'],
      type: 'Tintas',
      usedBy: usedBy,
      usedAt: serverTimestamp(),
      quantityUsed: 1
    };

    // Adicionar o registro de uso na coleção "materialUsageLogs"
    await addDoc(collection(this.firestore, 'materialUsageLogs'), usageLog);
  }

  async clearLogs(): Promise<void> {
    const dialogRef = this.dialog.open(DialogComponent, {
        data: {
            text: 'Removendo logs...'
        },
        disableClose: true
    });

    try {
        const usageLogsCollection = this.db;
        const querySnapshot = await getDocs(usageLogsCollection);

        // Loop através dos documentos e deletá-los
        const batch = writeBatch(this.firestore);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        this.showSuccessDialog('Sucesso', 'Todos os logs foram removidos.');
    } catch (error) {
        console.error('Erro ao remover logs: ', error);
        this.showErrorDialog('Erro', 'Não foi possível remover os logs.');
    } finally {
        dialogRef.close();
    }
}

private showErrorDialog(title: string, errorMessage: string): void {
  this.dialog.open(DialogErrorComponent, {
    data: { title, errorMessage }
  });
}

private showSuccessDialog(title: string, successMsg: string): void {
  this.dialog.open(DialogSuccessComponent, {
    data: { title, successMsg }
  })
}



}
