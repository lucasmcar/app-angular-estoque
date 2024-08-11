import { Injectable } from '@angular/core';
import { getApp } from 'firebase/app';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { collection, doc, Firestore, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class CollaboratorsService {

  private auth;
  private firestore;
  private app;
  private db;

  constructor() {

    this.app =  getApp();
    this.auth = getAuth();
    this.firestore = getFirestore(this.app);

    this.db = collection(this.firestore, 'users')
  }

  async addCollaborator(email: string, password: string, role: string){
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const userDoc = doc(this.db, userCredential.user.uid);

    await setDoc(userDoc, {
      email,
      role,
      access: true,
      createdAt: serverTimestamp()
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


}
