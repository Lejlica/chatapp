import {Component, HostListener, OnInit} from '@angular/core';
import {SignalrService} from "../services/chatService";
import { DatePipe } from '@angular/common';
import {User} from "../model/user";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  providers: [DatePipe]
})
export class ChatComponent implements OnInit {

  messages: { sender: string, text: string, isMine: boolean }[] = [];
  msg:string|undefined;
  activeUsers: Array<User> = new Array<User>();
  korisnik:User = new User();
  korisnikNovi!:User;
  newUserAlertVisible = false;

  constructor(public signalRservice:SignalrService,private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.signalRservice.startConnection();
    /*setTimeout(() => {
      this.sendMsg();
      this.sendMsgListener();
    }, 2000);*/

    this.userJoinedListener();
    this.sendMsgListener();
    setTimeout(() => {

    this.getUsers();
    this.getUsersListener();
    }, 2000);
  }
  userJoinedListener() {
    this.signalRservice.hubConnection.on("userJoined", (userId: string, userName: string) => {
      console.log(`${userName} (${userId}) has joined the chat.`);

      this.korisnikNovi = new User();
      this.korisnikNovi.id = userId;
      const names = userName.split(' ');
      this.korisnikNovi.ime = names[0];
      this.korisnikNovi.prezime = names.length > 1 ? names.slice(1).join(' ') : '';
      this.activeUsers.push(this.korisnikNovi);

      this.newUserAlertVisible = true;


      setTimeout(() => {
        this.newUserAlertVisible = false;
      }, 5000);

    });
  }

  getUsersListener() {
    this.signalRservice.hubConnection.on("ReceiveConnectedUsers", (users: any) => {
    console.log("ReceiveConnectedUsers.LISTENER");
    console.log(users);

      this.activeUsers = [];
      for (const user of users) {

        this.korisnikNovi = new User();

        this.korisnikNovi.id = user.userId;
        const names = user.userName.split(' ');

        this.korisnikNovi.ime = names[0];
        this.korisnikNovi.prezime = names.length > 1 ? names.slice(1).join(' ') : '';
        this.activeUsers.push(this.korisnikNovi);
      }
      console.log("this.activeUsers");
      console.log(this.activeUsers);

    });
  }
  isFriendsCredentVisible: boolean = false;

  toggleFriendsCredent() {
    this.isFriendsCredentVisible = !this.isFriendsCredentVisible;
  }
  private imePrezime(korisnik: string) {

    const names = korisnik.split(' ');

    this.korisnik.ime = names[0];
    this.korisnik.prezime = names.length > 1 ? names.slice(1).join(' ') : '';
  //console.log(this.korisnik);

  }

  @HostListener('window:beforeunload', ['$event'])
  unloadHandler(event: Event) {
    this.signalRservice.hubConnection.invoke("Logout", this.korisnik.id).then(() => {
      console.log('logout.then');
    })
      .catch(err => console.error(err));
  }

  getUsers(){
    this.signalRservice.hubConnection.invoke("sendConnectedUsers").then(() => {
      console.log('sendMsg.then');
    })
      .catch(err => console.error(err));
  }

  sendMsg(){
    this.signalRservice.hubConnection.invoke("sendMsg", this.msg, this.signalRservice.ime).then(() => {
      console.log('sendMsg.then');
    })
      .catch(err => console.error(err));

    this.msg = '';
  }

  getCurrentDateTime(): string {
    const now = new Date();
    return this.datePipe.transform(now, 'EEE, MMM d | HH:mm')!;
  }

  sendMsgListener() {
    this.signalRservice.hubConnection.on("sendMsgResponse", (msg: string, ime:string) => {
      console.log('Received message:', msg);
      console.log('sender:', ime);


      this.messages.push({ sender: ime, text: msg, isMine: false });
    });
  }

  Udji() {
    this.activeUsers.push(this.signalRservice.user);
  }
}
