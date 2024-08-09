import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword} from 'firebase/auth';
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
      disableClose: true
    });
    return signInWithEmailAndPassword(this.auth, email, password)
    .then((result) => {
      dialogRef.close();
      return result;
    }).catch((error) =>{
      this.showErrorDialog("Usuário ou senha inválidos");
      dialogRef.close();
    });
  }

  signUp(email: string, password: string){
    const dialogRef =  this.dialog.open(DialogComponent, {
      disableClose: true
    });
    return createUserWithEmailAndPassword(this.auth, email, password)
    .then((result) =>{
        this.showSuccessDialog("Usuário cadastro com sucesso")
        dialogRef.close();
        return result;
    }).catch((error) =>{
      this.showErrorDialog("Não foi possível cadastrar");
      dialogRef.close();
    })

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


  async getUser() : Promise<FirebaseUser | null>{
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
          resolve(user);
      });
    });
  }
}
