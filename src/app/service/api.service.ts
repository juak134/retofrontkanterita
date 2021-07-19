import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  //Variable que contiene la configuración de las peticiones al servicio Rest
  conectionOptions = {
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  //Definición de las rutas para realización de las peticiones al servicio Rest
  domainGetOrders ='http://localhost:8888/orders/1/details';
  domainGetDetails ='http://localhost:8888/details/1/details';
  domainPostDetails ='http://localhost:8888/details/';

  constructor( private http: HttpClient) { 
    
  }

  //Función que realiza la petición al servicio rest y retorna los datos de la orden
  getOrder ( idOrder ){
    //Concadenación del id que se obtiene por parametro a la ruta 
    this.domainGetDetails ='http://localhost:8888/orders/'+idOrder+'/details'
    const url = this.domainGetDetails + '';
    return new Promise( ( resolve, reject ) => {
      //Petición Get enviando la url y la variable con la configuracion 
      this.http.get( url, this.conectionOptions )
        .subscribe( dataReceived => {
          //Petición Get enviando la url y la variable con la configuracion 
          resolve( dataReceived );
        }, ( error ) => {
          reject( error );
        } );
    });
  }

  //Función que realiza la petición al servicio rest y retorna los datos de los detalles de la orden
  getDetails( idOrder ) {
    //Concadenación del id que se obtiene por parametro a la ruta 
    this.domainGetDetails ='http://localhost:8888/details/'+idOrder+'/details'
    const url = this.domainGetDetails + '';
    return new Promise( ( resolve, reject ) => {
      //Petición Get enviando la url y la variable con la configuracion 
      this.http.get( url, this.conectionOptions )
        .subscribe( dataReceived => {
          //Retorno de la promesa con el metodo resolve 
          resolve( dataReceived );
        }, ( error ) => {
          reject( error );
        } );
    });
  }

  //Función que realiza la petición al servicio rest para guardar los datos del detalle de la orden y retorna el id de la orden
  postDetails( dataDetails ) {
    const url = this.domainPostDetails + '';
    return new Promise( ( resolve, reject ) => {
      //Petición Get enviando la url, los datos de tipo Json y la variable con la configuracion 
      this.http.post( url, JSON.stringify( dataDetails ), this.conectionOptions )
        .subscribe( dataReceived => {
          resolve( dataReceived );
        }, ( error ) => {
          reject( error );
        } );
    });
  }




  
}
