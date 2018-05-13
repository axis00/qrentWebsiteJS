import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private httpClient: HttpClient) {  }

  ngOnInit() {
  }

  register(regForm: NgForm){
    console.log(regForm.value);
  }

}
