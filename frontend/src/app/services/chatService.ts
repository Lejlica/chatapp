import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import {User} from "../model/user";
import {Subject} from "rxjs";




@Injectable({ providedIn: 'root' })
export class SignalrService {

  ime!:string;
  connectionId:string | undefined;
  activeUsers: Array<User> = new Array<User>();
  user:User = new User();
  private connectionIdSubject = new Subject<string>();

  constructor(){
  }

  hubConnection!: signalR.HubConnection;


  startConnection = () => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44316/chat', {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Hub Connection Started!');
        this.login();
        this.loginListener();
      })
      .catch(err => console.log('Error while starting connection: ' + err))
  }

  sendMsg(){
    this.hubConnection.invoke("sendMsg", "ovo je poruka", "user").then(() => {
      console.log('sendMsg.then');
    })
      .catch(err => console.error(err));
  }

  sendMsgListener(){
    this.hubConnection.on("sendMsgResponse", (msg:string) => {
      console.log(msg);
    });
  }

  login(id?:string){
    this.hubConnection.invoke("Login")
      .then(() => {
        console.log('askServer.then');
      })
      .catch(err => console.error(err));
  }

  loginListener() {
    console.log('askServerListener Started!');

    this.hubConnection.on("login_succes", (korisnik:string, id:string) => {
      console.log('askServerListener.listener!');

      var userObject = {
        username: korisnik,
        id: id
      };

      localStorage.setItem("user",JSON.stringify(userObject));

      this.imePrezime(korisnik);
      this.user.id = id;

      console.log(id);

      //this.activeUsers.push(this.user);


      this.ime = this.user.ime + " " + this.user.prezime;
    });
  }

  private imePrezime(korisnik: string) {

    const names = korisnik.split(' ');

    this.user.ime = names[0];
    this.user.prezime = names.length > 1 ? names.slice(1).join(' ') : '';

    this.activeUsers.push(this.user);
  }
}
