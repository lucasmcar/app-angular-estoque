import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, Firestore, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { DialogComponent } from '../shared/dialog/dialog/dialog.component';
import { DialogErrorComponent } from '../shared/dialog/dialog-error/dialog-error.component';
import { DialogSuccessComponent } from '../shared/dialog/dialog-success/dialog-success.component';
import { Collaborator } from '../models/collaborator';
import { BehaviorSubject, from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CollaboratorsService {

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

    this.db = collection(this.firestore, 'collaborators')
  }

  async addCollaborator(collaborator: Collaborator, adminUid: string){

    const dialogRef = this.dialog.open(DialogComponent, {
      data :{
        text : 'Adicionando colaborador: ' + name
      },
      disableClose: true
    });

    const userCredential = await createUserWithEmailAndPassword(this.auth, collaborator.email, collaborator.password);
    const userDoc = doc(this.db, userCredential.user.uid);


    await setDoc(userDoc, {
      ...collaborator,
      collaboratorId: userCredential.user.uid,
      createdBy: adminUid,
      createdAt: serverTimestamp()
    }).then((result) => {
      this.showSuccessDialog("Sucesso!", "Colaborador cadastrado com sucesso");
      dialogRef.close();
    }).catch((error) =>{
      this.showErrorDialog("Ops! Algo deu errado", "Erro ao adicionar colaborador");
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
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        text: 'Carregando dados'
      },
      disableClose: true
    })
    const querySnapshot = await getDocs(query(this.db, where("role", "==", "collaborator")));
    dialogRef.close();
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


  private showErrorDialog(title: string, errorMessage: string): void {
    this.dialog.open(DialogErrorComponent, {
      data: { title, errorMessage }
    });
  }

  private showSuccessDialog(title: string, successMsg: string): void{
    this.dialog.open(DialogSuccessComponent, {
      data: { title, successMsg }
    })
  }

  async removeCollaborator(email: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data :{
        text : 'Removendo colaborador'
      },
      disableClose: true
    });

    const q = query(this.db, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    const docSnapshot = querySnapshot.docs[0];
    const userDocRef = doc(this.db, docSnapshot.id);

    await deleteDoc(userDocRef)
      .then((result) => {

        /*const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const auth = getAuth();
          const user = await auth.getUserByEmail(email);
          if (user) {
            await thisdeleteUser(user);
          }
    }*/


        this.showSuccessDialog("Removido", "Colaborador excluído com sucesso");
        dialogRef.close();
        return result;
      }).catch((error) => {
        this.showErrorDialog("Erro", "Não foi possível excluir");
        dialogRef.close();
        throw error;
      });
  }

  async getCollaboratorProfile(userId: string) {
    try {
      const userDocRef = doc(this.firestore, 'collaborators', userId);
      const userDocSnap = await getDoc(userDocRef)
      if (userDocSnap.exists()) {
        return userDocSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error while fetching user', error);
      throw error;
    }
  }


}
