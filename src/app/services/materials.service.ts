import { Injectable } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, onSnapshot, Firestore, getDoc, getDocs, getFirestore, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { DialogComponent } from '../shared/dialog/dialog/dialog.component';
import { DialogErrorComponent } from '../shared/dialog/dialog-error/dialog-error.component';
import { DialogSuccessComponent } from '../shared/dialog/dialog-success/dialog-success.component';
import { DataRefreshService } from './data-refresh.service';
import { Materials } from '../models/materials';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialsService {

  private auth;
  private firestore;
  private app;
  private db;
  private userSubject = new BehaviorSubject<FirebaseUser| null>(null);


  constructor(
    private dialog: MatDialog,
    private dataRefreshService: DataRefreshService,
    private logService: LogService
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

    this.db = collection(this.firestore, 'materials');
  }


  async addMaterial(material: Materials, userId: string){
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        text: 'Salvando dados...'
      },
      disableClose: true
    });

    try {
      // Referência à coleção de material
      const materialsCollection = this.db;

      // Query para verificar se já existe um material com o mesmo nome
      const q = query(materialsCollection, where('materialName', '==', material.materialName));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Material já existe, incrementar a quantidade
        const materialDoc = querySnapshot.docs[0];  // Se nome  da tinta é único
        const existingData = materialDoc.data();

        // Atualizar a quantidade
        const newQuantity = (existingData['quantity'] || 0) + 1;

        // Atualizar o documento no Firebase
        await updateDoc(materialDoc.ref, { quantity: newQuantity });

      } else {
        // Material não existe, criar um novo documento
        await addDoc(materialsCollection, {
          ...material,
          createdBy: userId,
          createdAt: serverTimestamp()
        });
      }

      this.showSuccessDialog('Sucesso', 'Material registado com sucesso!');
      this.dataRefreshService.triggerRefresh();
    } catch (error) {
      console.error('Erro ao salvar material: ', error);
      this.showErrorDialog('Erro', 'Não foi possível salvar a material.');
    } finally {
      dialogRef.close();
    }
  }

  getMaterials(orderByField: string, orderDirection: 'asc' | 'desc' = 'asc'): Observable<any[]> {
    const dialogRef = this.dialog.open(DialogComponent,{
      data :{
        text: 'Carregando dados'
      },
      disableClose: true
    });
    const materialCollection = this.db;
    const materialsQuery = query(materialCollection, orderBy(orderByField, orderDirection));

    return new Observable<any[]>(observer => {
      const unsubscribe = onSnapshot(materialsQuery, snapshot => {
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

    /*return from(getDocs(carPaintsQuery).then(snapshot => {
      dialogRef.close();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data()
      }));
    }));*/
  }

  updateMaterial(id: string, material: any): Observable<void> {
    const dialogRef = this.dialog.open(DialogComponent,{
      data :{
        text: 'Atualizando material...'
      },
      disableClose: true
    })
    const materialDoc = doc(this.firestore, 'materials', id);
    console.log(id)
    return from(updateDoc(materialDoc, material).then(() => {
      this.showSuccessDialog('Atualizado', 'Material atualizado com sucesso')
      dialogRef.close();
    }).catch((error )=>{
      this.showErrorDialog('Erro', 'Não foi possível atualizar');
      dialogRef.close();
    }));
  }


  async removeMaterial(materialName: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data :{
        text : 'Removendo material...'
      },
      disableClose: true
    });

    const q = query(this.db, where("materialName", "==", materialName));
    const querySnapshot = await getDocs(q);

    const docSnapshot = querySnapshot.docs[0];
    const userDocRef = doc(this.db, docSnapshot.id);

    await deleteDoc(userDocRef)
      .then((result) => {

        this.showSuccessDialog("Removida", "Material removido com sucesso");
        dialogRef.close();
        return result;
      }).catch((error) => {
        this.showErrorDialog("Erro", "Não foi possível excluir");
        dialogRef.close();
        throw error;
      });
  }

  async useMaterial(materialName: string, newQuantity: number, usedBy: string){
    const q = query(this.db, where("materialName", "==", materialName));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      const userDocRef = doc(this.db, docSnapshot.id);

      // Atualizar a quantidade no documento
      await setDoc(userDocRef, { quantity: newQuantity }, { merge: true });

      // Registrar o uso do material
      /*onst usageLog: MaterialUsageLog = {
        materialId: docSnapshot.id,
        materialName: docSnapshot.data()['colorName'],
        usedBy: usedBy,
        usedAt: serverTimestamp(),
        quantityUsed: 1
      };*/

      await this.logService.logMaterialUsage(docSnapshot, usedBy);
  }
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
