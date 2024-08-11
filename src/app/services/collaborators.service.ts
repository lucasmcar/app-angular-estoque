import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { addDoc, collection, doc, Firestore, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { DialogComponent } from '../shared/dialog/dialog/dialog.component';
import { DialogErrorComponent } from '../shared/dialog/dialog-error/dialog-error.component';
import { DialogSuccessComponent } from '../shared/dialog/dialog-success/dialog-success.component';
import { Collaborator } from '../models/collaborator';

@Injectable({
  providedIn: 'root'
})
export class CollaboratorsService {

  private auth;
  private firestore;
  private app;
  private db;

  constructor(private dialog: MatDialog) {

    this.app =  getApp();
    this.auth = getAuth();
    this.firestore = getFirestore(this.app);

    this.db = collection(this.firestore, 'users')
  }

  /*sync addColaborator1(collaborator: Collaborator){

    const dialogRef = this.dialog.open(DialogComponent, {
      data :{
        text : 'Adicionando colaborador: ' + collaborator.name
      },
      disableClose: true
    });


    const userCredential = await createUserWithEmailAndPassword(this.auth, collaborator.email, collaborator.password);
    const userId = userCredential.user.uid;

    const  collaboratorData = {
      uid : userId,
      name: collaborator.name,
      email: collaborator.email,
      role: 'collaborator',
      access: true,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(this.firestore, 'collaborators', userId), collaboratorData)
    .then((result) => {
      this.showSuccessDialog("Sucesso ao adicionar colaborador");
      dialogRef.close();
      return result;
    }).catch((error) => {
      this.showErrorDialog("Não foi  possível cadastrar");
      dialogRef.close();
      throw new Error("Erro: "+ error)
    });

  }*/



  async addCollaborator(name: string, email: string, password: string, role: string){

    const dialogRef = this.dialog.open(DialogComponent, {
      data :{
        text : 'Adicionando colaborador: ' + name
      },
      disableClose: true
    });

    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const userDoc = doc(this.db, userCredential.user.uid);

    await setDoc(userDoc, {
      name,
      email,
      role,
      access: true,
      createdAt: serverTimestamp()
    }).then((result) => {
      this.showSuccessDialog("Colaborador cadastrado com sucesso");
      dialogRef.close();
    }).catch((error) =>{
      this.showErrorDialog("Erro ao adicionar colaborador");
      dialogRef.close();
      throw error;
    });
  }

  async getUser(uid: string){
    const userDoc = doc(this.db, uid);
    const userSnap = await getDoc(userDoc);
    return userSnap.exists() ? userSnap.data() : null;
  }

  async getCollaborators() {
    const querySnapshot = await getDocs(query(this.db, where("role", "==", "collaborator")));
    return querySnapshot.docs.map(doc => doc.data());
  }

  async updateCollaboratorAccess(uid: string, access: boolean){
    const userDoc =  doc(this.db, uid);
    await updateDoc(userDoc, {access});
  }

  async getCollaboratorUidByEmail(email: string): Promise<string | null> {
    const q = query(this.db, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.id; // Retorna o UID (ID do documento)
    }
    return null;
  }


  private showErrorDialog(errorMessage: string): void {
    this.dialog.open(DialogErrorComponent, {
      data: { errorMessage }
    });
  }

  private showSuccessDialog(successMsg: string): void{
    this.dialog.open(DialogSuccessComponent, {
      data: { successMsg }
    })
  }


}
