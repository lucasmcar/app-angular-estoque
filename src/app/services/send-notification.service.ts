
import { Injectable } from '@angular/core';
import { Twilio } from 'twilio';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiKeys } from '../../keys/apis-keys';

@Injectable({
  providedIn: 'root'
})
export class SendNotificationService {

  private accountSid = ApiKeys.twilio_sid;
  private authToken = ApiKeys.twilio_auth_token;
  private twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;

  constructor(private http: HttpClient) {



  }

  sendWhatsAppMessage(to: string, message: string): Observable<any> {
    const body = new URLSearchParams();
    body.set('From', 'whatsapp:+14155238886'); // Número WhatsApp do Twilio
    body.set('To', `whatsapp:${to}`);
    body.set('Body', message);

    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${this.accountSid}:${this.authToken}`),
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    return this.http.post(this.twilioUrl, body.toString(), { headers });
  }


}
