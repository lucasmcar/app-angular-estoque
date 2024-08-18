import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, getFirestore, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { DialogComponent } from '../shared/dialog/dialog/dialog.component';
import { DialogErrorComponent } from '../shared/dialog/dialog-error/dialog-error.component';
import { DialogSuccessComponent } from '../shared/dialog/dialog-success/dialog-success.component';
import { DataRefreshService } from './data-refresh.service';
import { SendNotificationService } from './send-notification.service';

import { LogService } from './log.service';
import { Carpaints } from '../models/carpaints';

@Injectable({
  providedIn: 'root'
})
export class CarPaintsService {

  private auth;
  private firestore;
  private app;
  private db;
  private userSubject = new BehaviorSubject<FirebaseUser | null>(null);

  constructor(
    private dialog: MatDialog,
    private dataRefreshService: DataRefreshService,
    private whatsapp: SendNotificationService,
    private logService: LogService
  ) {

    this.app = getApp();
    this.auth = getAuth();
    this.firestore = getFirestore(this.app);

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userSubject.next(user);
      } else {
        this.userSubject.next(null);
      }
    });

    this.db = collection(this.firestore, 'carpaints');

  }

  getCarPaints(orderByField: string, orderDirection: 'asc' | 'desc' = 'asc'): Observable<any[]> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        text: 'Carregando dados'
      },
      disableClose: true
    })
    const carPaintsCollection = collection(this.firestore, 'carpaints');
    const carPaintsQuery = query(carPaintsCollection, orderBy(orderByField, orderDirection));

    return new Observable<any[]>(observer => {
      const unsubscribe = onSnapshot(carPaintsQuery, snapshot => {
        dialogRef.close();
        const materials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        observer.next(materials);  // Emite os dados atualizados para os observadores
      }, error => {
        dialogRef.close();
        observer.error(error);  // Emite um erro se ocorrer algum problema
      });

      // Retorna a função de limpeza (unsubscribe) para parar de escutar as mudanças quando o Observable for destruído
      return () => unsubscribe();
    });
  }



  async addOrUpdateCarPaint(carpaint: Carpaints, userId: string): Promise<void> {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        text: 'Salvando dados...'
      },
      disableClose: true
    });

    try {
      // Referência à coleção de tintas
      const carPaintsCollection = collection(this.firestore, 'carpaints');

      // Query para verificar se já existe uma tinta com o mesmo nome
      const q = query(carPaintsCollection, where('colorName', '==', carpaint.colorName));
      const querySnapshot = await getDocs(q);

      const quantityNumber = parseInt(carpaint.quantity, 10) || 0;

      if (!querySnapshot.empty) {
        // Tinta já existe, incrementar a quantidade
        const carPaintDoc = querySnapshot.docs[0];  // Assumindo que o nome da tinta é único
        const existingData = carPaintDoc.data();

        // Atualizar a quantidade
        const newQuantity = (parseInt(existingData['quantity'] || 0)) + quantityNumber;

        // Atualizar o documento no Firebase
        await updateDoc(carPaintDoc.ref, { quantity: newQuantity });

      } else {
        // Tinta não existe, criar um novo documento
        await addDoc(carPaintsCollection, {
          ...carpaint,
          createdBy: userId,
          createdAt: serverTimestamp()
        });
      }

      this.showSuccessDialog('Sucesso', 'Tinta salva com sucesso!');
      this.dataRefreshService.triggerRefresh();
    } catch (error) {
      console.error('Erro ao salvar tinta: ', error);
      this.showErrorDialog('Erro', 'Não foi possível salvar a tinta.');
    } finally {
      dialogRef.close();
    }
  }

  updateCarPaints() { }


  async removeCarPaints(code: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        text: 'Removendo tinta...'
      },
      disableClose: true
    });

    const q = query(this.db, where("code", "==", code));
    const querySnapshot = await getDocs(q);

    const docSnapshot = querySnapshot.docs[0];
    const userDocRef = doc(this.db, docSnapshot.id);

    await deleteDoc(userDocRef)
      .then((result) => {

        this.showSuccessDialog("Removida", "Tinta removida com sucesso");
        dialogRef.close();
        return result;
      }).catch((error) => {
        this.showErrorDialog("Erro", "Não foi possível excluir");
        dialogRef.close();
        throw error;
      });
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

  async useCarPaint(code: string, newQuantity: number, usedBy: string): Promise<void> {
    const q = query(this.db, where("code", "==", code));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      const userDocRef = doc(this.db, docSnapshot.id);

      // Atualizar a quantidade no documento
      await setDoc(userDocRef, { quantity: newQuantity }, { merge: true });

      await this.logService.saveCarPaintLog(docSnapshot, usedBy);

    }
  }
}
