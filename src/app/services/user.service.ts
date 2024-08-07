import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { serverTimestamp, setDoc, doc, getFirestore } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private auth;
  private firestore;
  private userSubject = new BehaviorSubject<FirebaseUser | null>(null);
  public user$ = this.userSubject.asObservable();


  constructor() {
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

    try {
      const userProfile = {
        name,
        companyName,
        phone,
        createdAt: serverTimestamp()
      };
      await setDoc(doc(this.firestore, 'users', userId), userProfile, { merge: true });
    } catch (error) {
      console.error('Error saving user profile', error);
      throw error;
    }
  }

  getUserProfile(){
    
  }
}
