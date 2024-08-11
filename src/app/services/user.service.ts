import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { serverTimestamp, setDoc, doc, getFirestore, getDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { DialogComponent } from '../shared/dialog/dialog/dialog.component';
import { DialogErrorComponent } from '../shared/dialog/dialog-error/dialog-error.component';
import { DialogSuccessComponent } from '../shared/dialog/dialog-success/dialog-success.component';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private auth;
  private firestore;
  private userSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public user$ = this.userSubject.asObservable();


  constructor(private dialog: MatDialog) {
    const app = getApp(); // Obtem a instância do Firebase já inicializada
    this.auth = getAuth();
    this.firestore = getFirestore(app);

    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userSubject.next(user);
      } else {
        this.userSubject.next(null);
      }
    });
  }

  async createUserProfile(userId: string, name: string, companyName: string, phone: string){

    const dialogRef =  this.dialog.open(DialogComponent, {
      data :{
        text : 'Criando perfil...'
      },
      disableClose: true
    }
  )


      const userProfile = {
        name,
        companyName,
        phone,
        createdAt: serverTimestamp()
      };
      await setDoc(doc(this.firestore, 'users', userId), userProfile, { merge: true })
      .then((result) => {
        this.showSuccessDialog('Usuário cadastrado com sucesso')
        dialogRef.close();
        return result;
      }).catch ((error) => {
        this.showErrorDialog('Erro ao cadastrar perfil');
        dialogRef.close();
        throw error;
      });

  }

  async getUserProfile(userId: string){
    try{
      const userDocRef = doc(this.firestore, 'users', userId);
      const userDocSnap = await getDoc(userDocRef)
      if(userDocSnap.exists()){
        return userDocSnap.data();
      } else {
        return null;
      }
    }catch( error ){
      console.error('Error while fetching user', error);
      throw error;
    }
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
