import { Component, OnInit } from '@angular/core';
import { User } from './models/user';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [UserService]
})
export class AppComponent implements OnInit{
  public title = 'Musify App';
  public user: User;
  public user_register: User;
  public identity: any;
  public token: any;
  public errorMessage: any;
  public alertRegister: any;

  constructor(
    private _userService: UserService
  ){
    this.user = new User('', '', '', '', '', 'ROLE_USER', '');
    this.user_register = new User('', '', '', '', '', 'ROLE_USER', '');

  }

  ngOnInit(){
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();

    console.log(this.identity);
    console.log(this.token);

  }


  public onSubmit(){

    console.log(this.user);

    //Conseguir los datos del usaurio identificado
    this._userService.signup(this.user, false).subscribe(
      response => {
        let identity = response.user;
        this.identity = identity;

        if (!identity._id){
          alert("El usuario no esta correctamente identificado")
        } else {
          //Crear Sesión en LocalStorage
          localStorage.setItem('identity', JSON.stringify(identity));

          //Conseguir token para enviar a cada petición http
          this._userService.signup(this.user, true).subscribe(
            response => {
              let token = response.token;
              this.token = token;

              if(this.token.length <= 0){
                alert("El token no se ha generado.");
              } else {
                //Crear un elemento en localstorage para tener token disponible
                localStorage.setItem('token', token);
                console.log(token);
                console.log(identity);

              }

            }
          )

        }

        console.log(response);
        }, error => {
          var errorMessage = <any>error;
        if(errorMessage != null){
          var body = error.error.message;
          this.errorMessage = body;
          console.log(error);
        }
      }
    );
  }

  logout(){
    localStorage.removeItem('identity');
    localStorage.removeItem('token');
    localStorage.clear();

    this.identity = null;
    this.token = null;
    
  }

  onSubmitRegister(){
    this._userService.register(this.user_register).subscribe( 
      response => {
        let user = response.user;
        this.user_register = user;

        if(!user._id){
          this.alertRegister = 'Error al registrarse';
       } else {
          this.alertRegister = 'El registro se ha realizado correctamente, identifícate con ' + this.user_register.email;
          this.user_register = new User('', '', '', '', '', 'ROLE_USER', '');
       }
      }, error => {
        console.log(error);
        var errorMessage = <any>error;

        if(errorMessage != null){
          var body = error.error.message;
          this.errorMessage = body;
          console.log(errorMessage);
        }
      }

    );
  }

}
