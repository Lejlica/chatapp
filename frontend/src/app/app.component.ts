import {Component, OnDestroy, OnInit} from "@angular/core";
import {SignalrService} from "./services/chatService";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit, OnDestroy{
  constructor(public signalRservice:SignalrService) {
  }

  ngOnInit(): void {
    //this.signalRservice.startConnection();

  }

  sendMsg(){
    this.signalRservice.hubConnection.invoke("sendMsg", "ovo je poruka", "user").then(() => {
      console.log('sendMsg.then');
    })
      .catch(err => console.error(err));
  }

  sendMsgListener(){
    this.signalRservice.hubConnection.on("sendMsgResponse", (msg:string) => {
      console.log(msg);
    });
  }

  ngOnDestroy() {
    this.signalRservice.hubConnection.off("askServerResponse");
  }


  }



