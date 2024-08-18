import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { getFirestore, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../shared/dialog/dialog/dialog.component';
import { DialogErrorComponent } from '../shared/dialog/dialog-error/dialog-error.component';
import { DialogSuccessComponent } from '../shared/dialog/dialog-success/dialog-success.component';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private auth;
  private firestore;
  private userSubject = new BehaviorSubject<FirebaseUser | null>(null)
  public user$ = this.userSubject.asObservable();

  constructor(private dialog: MatDialog) {
    const app = getApp();
    this.auth = getAuth();
    this.firestore = getFirestore (app);

    onAuthStateChanged(this.auth, (user) =>{
      if(user){
        this.userSubject.next(user);
      } else {
        this.userSubject.next(null);
      }
    })
  }

  login(email: string, password: string) {
    const dialogRef = this.dialog.open(DialogComponent, {
      data : {
        text : 'Acessando perfil'
      },
      disableClose: true
    });
    return signInWithEmailAndPassword(this.auth, email, password)
    .then(async (result) => {
      const user = result.user;

      const userDocRef = doc(this.firestore, 'collaborators', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Verifica se o campo 'access' está definido e é verdadeiro
        if (userData['access'] === false) {
          console.log(userData['access']);
          this.showErrorDialog("Erro!","Usuário não permitido");
          dialogRef.close();
          return null;
        }
        // Se 'access' não estiver definido, considera que o usuário é um administrador
        dialogRef.close();
        return result;
      } else {
        // Caso o documento não exista, considera que o usuário é um administrador
        dialogRef.close();
        return result;
      }
    }).catch((error) =>{
      this.showErrorDialog("Ops! Algo deu errado!", "Usuário ou senha inválidos");
      dialogRef.close();
    });
  }

  signUp(email: string, password: string){
    const dialogRef =  this.dialog.open(DialogComponent, {
      data: {
        text: "Criando conta..."
      },
      disableClose: true
    });
    return createUserWithEmailAndPassword(this.auth, email, password)
    .then((result) =>{
        this.showSuccessDialog("Sucesso!","Usuário cadastro com sucesso")
        dialogRef.close();
        return result;
    }).catch((error) =>{
      this.showErrorDialog("Ops! Algo deu errado!","Não foi possível cadastrar");
      dialogRef.close();
    })

  }

  signOut(){
    const dialogRef =  this.dialog.open(DialogComponent, {
      data : {
        text : 'Saindo...'
      },
      disableClose: true
    });
    return signOut(this.auth).then((result) => {
      dialogRef.close();
    }).catch(error => console.error('Error', error));
  }

  private showErrorDialog(title: string, errorMessage: string): void {
    this.dialog.open(DialogErrorComponent, {
      data: {title, errorMessage }
    });
  }

  private showSuccessDialog(title: string, successMsg: string): void{
    this.dialog.open(DialogSuccessComponent, {
      data: {title,  successMsg }
    })
  }


  async getUser() : Promise<FirebaseUser | null>{
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
          resolve(user);
      });
    });
  }
}
