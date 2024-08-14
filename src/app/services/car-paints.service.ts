import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { DialogComponent } from '../shared/dialog/dialog/dialog.component';
import { DialogErrorComponent } from '../shared/dialog/dialog-error/dialog-error.component';
import { DialogSuccessComponent } from '../shared/dialog/dialog-success/dialog-success.component';
import { DataRefreshService } from './data-refresh.service';
import { SendNotificationService } from './send-notification.service';

@Injectable({
  providedIn: 'root'
})
export class CarPaintsService {

  private auth;
  private firestore;
  private app;
  private db;
  private userSubject = new BehaviorSubject<FirebaseUser| null>(null);

  constructor(
    private dialog: MatDialog,
    private dataRefreshService: DataRefreshService,
    private whatsapp: SendNotificationService
  ) {

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

    this.db = collection(this.firestore, 'carpaints');

  }




  getCarPaints(orderByField: string, orderDirection: 'asc' | 'desc' = 'asc'): Observable<any[]> {
    const dialogRef = this.dialog.open(DialogComponent,{
      data :{
        text: 'Carregando dados'
      },
      disableClose: true
    })
    const carPaintsCollection = collection(this.firestore, 'carpaints');
    const carPaintsQuery = query(carPaintsCollection, orderBy(orderByField, orderDirection));

    return from(getDocs(carPaintsQuery).then(snapshot => {
      dialogRef.close();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()
      }));
    }));
  }

  async addCarPaints(colorGroup: string, colorName: string, code: string, brand: string, userId: string){

    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        text: 'Adicionando nova tinta...'
      },
      disableClose: true
    })


    const carPaints = {
      colorGroup,
      colorName,
      code,
      brand,
      uid: userId,
      createdAt: serverTimestamp()
    };
    await addDoc(collection(this.firestore, 'carpaints'), carPaints)
      .then((result) => {
        this.showSuccessDialog('Sucesso', 'Tinta cadastrada com sucesso');

        const collaboratorPhoneNumber = '+5551996699337'; // Número de telefone do colaborador (com o código do país)
        const message = `Uma nova tinta foi adicionada: ${carPaints.colorName} (${carPaints.code})`;
        //this.whatsapp.sendWhatsAppMessage(collaboratorPhoneNumber, message);
        dialogRef.close();
        this.dataRefreshService.triggerRefresh();
        return result;
      }).catch((error) => {
        this.showErrorDialog('Ops! algi deu errado', 'Erro ao cadastrar perfil');
        dialogRef.close();
        throw error;
      });
  }

  updateCarPaints(){}


  async removeCarPaints(code: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data :{
        text : 'Removendo tinta...'
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

  private showSuccessDialog(title: string,  successMsg: string): void {
    this.dialog.open(DialogSuccessComponent, {
      data: { title, successMsg }
    })
  }
}
