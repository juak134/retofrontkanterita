import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ApiService } from './service/api.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { FormularioComponent } from './views/formulario/formulario.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'retokanterita';
  formSearch : FormGroup;
  orderData = null;
  detailsOrder : MatTableDataSource<any>;
  columns : string[] = [
    'position',
    'detalle',
    'cantidad',
    'precio',
    'total'
  ];
  idOrder;
  constructor( private apiService : ApiService, 
               public router : Router, 
               public fb : FormBuilder,
               public dialog : MatDialog) {

  }

  ngOnInit() {
    //Llamada a la función que define las variables del formulario
    this.createForm();
  }

  createForm() {
    //Definición de la variable del fomulario
    this.formSearch = this.fb.group( {
      idOrder: [ '' ]
    }) 
  }

  searchOrder(){
    //Llamada a la función que conecta con el servicio rest y devuelve los datos de la orden
    this.apiService.getOrder( this.formSearch.value.idOrder )
    .then(( dataOrder ) => {
      if( dataOrder ){
        //Se guarda el id de la orden devuelta
        this.idOrder = this.formSearch.value.idOrder;
        //Se limpia el valor del campo del formulario
        this.formSearch.controls["idOrder"].setValue("");
        this.orderData = dataOrder;
        //llamada a la función que se conecta con el servicio rest y retorna los detalles de la orden
        this.apiService.getDetails( dataOrder['id'] )
        .then( ( dataDetails ) => {
          console.log( dataDetails );
          //Llamada a la función que lee los datos devueltos del servicio rest
          this.rearDataDetails( dataDetails );
        });
        
      }else{
        this.orderData = null;
        this.detailsOrder = null;
      }
      
    })
  }

  rearDataDetails( dataDetails ){
    const dataAux : any = [];
    //Recorrido de los detalles de la orden para ser asignados a una variabl MatTableDataSource y ser mostrados en una tabla
    dataDetails.forEach((element) => {
      const info = {
        id: element.id,
        idOrder: element.idOrder,
        detail: element.detail,
        cantidad: element.cantidad,
        precioUnitario: element.precioUnitario,
        totalDetail: element.totalDetail
      }
      dataAux.push(info);
    })
    this.detailsOrder = new MatTableDataSource( dataAux );
  }

  addDetail(){
    //Creación del componente como ventana modal enviando la configuración de este los datos como parametros
    const addDetail = this.dialog.open( FormularioComponent, {
      data:{
        idOrder : this.orderData["id"]
      },
      disableClose: true,
      autoFocus: true
    } );
    addDetail.afterClosed()
      .subscribe( savedSuccess => {
        if( savedSuccess) {
          //SI el modal es cerrado con excito se llama a la función que recupera los detalles de las ordenes para ser mostrados en la tabla
          console.log( 'In savedSuccess', savedSuccess);
          this.apiService.getDetails( this.idOrder )
          .then(( details ) => {
            this.rearDataDetails( details );
          })
        }else {
          console.log("error");   
        }
      } );

  }

  print(){
    //Definición de la variable que contiene la configuración del archivo a generar
    const contentReport = {
      content: [
        //Especificación de las columnas llevara el documento añadiendo los estilos que se desea
          {  
            text: 'Detalles de la Orden',  
            fontSize: 18,  
            alignment: 'center',  
            color: '#047886'  
          },
          { 
            columns:[
                      { text: `Número de la orden:  ${this.orderData['number']}`,  
                        alignment: 'left'   
                      },
                    ], style: 'subheader', margin: [0, 0 , 0, 0],
          },
          { 
            columns:[
                      { text: `Cliente:  ${this.orderData['client']}`,  
                        alignment: 'left'   
                      },
                    ], style: 'subheader', margin: [0, 0 , 0, 0],
          },
          { 
            columns:[
                      { text: `Total:  ${this.orderData['total']}`,  
                        alignment: 'left'   
                      },
                    ], style: 'subheader', margin: [0, 0 , 0, 0],
          },
          { 
            columns:[
                      { text: `Fecha de la Orden:  ${this.orderData['dateOrder']}`,  
                        alignment: 'left'   
                      },
                    ], style: 'subheader', margin: [0, 0 , 0, 0],
          },
          {  
            //Definición de la tabla que se creara en el documento consumiendo los datos de la variable tipo MatTableDataSource que contiene la información que llenará la tabla
              table: {  
                //Definición de cuantas lineas de cabecera 
                  headerRows: 1,  
                  //Definición del numero de columnas de la tabla 
                  widths: ['auto', 'auto', 'auto', 'auto', 'auto' ],  
                  body: [ 
                      //Definición del texto de la cabecera de la tabla 
                      ['N°', 'Detalle', 'Cantidad', 'Precio', 'Total' ],
                      //Mapeo de la variable que contiene los datos para llenar fila a fila la tabla
                      ...this.detailsOrder.data.map(p => ([p.id, p.detail, p.cantidad, p.precioUnitario, p.totalDetail])), 
                      //Definición de la ultima fila de la tabla, la cual realizará la suma de la ultima columna  
                      [{ text: 'Total', colSpan: 4 , alignment: 'right'}, {},{},{}, this.detailsOrder.data.reduce((sum, p) => sum + parseFloat(p.totalDetail), 0).toFixed(2)]  
                  ]  
              }  
          }
          ],
            styles: {
              subheader: {
                fontSize: 12,
                bold: true,   
                alignment: 'right' 
              },
              story: {
                italic: true,
                alignment: 'center',
                width: '5%',
              }
            },
            pageSize: 'A7',
            pageOrientation: 'landscape',
            pageMargins: [ 10, 10, 10, 10 ]
      };
    pdfMake.createPdf(contentReport).open();

  }

}
