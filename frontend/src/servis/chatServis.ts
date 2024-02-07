import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection: HubConnection;

  private messageReceived = new Subject<{ user: string, message: string }>();

  constructor() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl('https://localhost:7008/hub-putanja') // Replace with your backend URL
      .build();

    this.hubConnection.start()
      .then(() => console.log('SignalR connection established'))
      .catch(err => console.error('Error while establishing SignalR connection:', err));

    this.hubConnection.on('ReceiveMessage', (user: string, message: string) => {
      this.messageReceived.next({ user, message });
    });
  }

  sendMessage(user: string, message: string): void {
    this.hubConnection.invoke('SendMessage', user, message)
      .catch(err => console.error('Error while sending message:', err));
  }

  getMessageObservable() {
    return this.messageReceived.asObservable();
  }
}
