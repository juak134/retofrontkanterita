import { Component, OnInit, Inject, NgZone  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { ApiService } from 'src/app/service/api.service';

@Component({
  selector: 'app-formulario',
  templateUrl: './formulario.component.html',
  styleUrls: ['./formulario.component.css']
})
export class FormularioComponent implements OnInit {
  formDetail : FormGroup;
  constructor( public fb : FormBuilder,
               public dialogRef : MatDialogRef<FormularioComponent>,
               private apiService : ApiService,
               @Inject( MAT_DIALOG_DATA ) public data : any) { }

  ngOnInit(){
    this.createForm();
  }

  modalClose() {
    //Cierre del componente modal con parametro false indicando que no se completó la funcionalidad
    this.dialogRef.close( false );
  }

  createForm(){
    //Definición de las variables del formulario con la configuracion y especificaciones por cada dato
    this.formDetail = this.fb.group( {
      detail: [ "", [ Validators.required, 
                       Validators.pattern('[a-zA-Z0-9  ]*'), 
                       Validators.maxLength(35),
                       Validators.minLength(3), ] ],
      cantidad: [ "", [ Validators.required, 
                         Validators.pattern('[0-9., ]*') ] ],

      precioUnitario: [ "", [ Validators.required, 
                               Validators.pattern('[0-9., ]*') ] ]
    });
    this.formDetail.valueChanges
    .pipe(debounceTime(400))
    .subscribe(data => this.onValueChanged(data));
  }
  //Funcion que cada que se realiza un cambion en el formulario activa mensajes de error en caso que sea necesario
  onValueChanged(data?: any) {
    if (!this.formDetail) { return; }
    const form = this.formDetail;
    for (const field in this.formErrors) {
        this.formErrors[field] = [];
        this.formDetail[field] = '';
      const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
              this.formErrors[field].push(messages[key]);
          }
      }
    }
  }

  formErrors = {
    'detail': [],
    'cantidad': [],
    'precioUnitario': []
  };
  //Definición de los mensajes de error que se mostrará cuando se incumpla las condiciones del formulario 
  validationMessages = {
    'detail': {
      'minlength':     'Mínimo 3 caracteres.',
      'maxlength':     'Máximo 35 caracteres.',
      'pattern':       'Solo letras.',
      'required':      'El campo no debe ser vacío.'
    },
    'cantidad' :{
      'pattern':       'Solo número.',
    },
    'precioUnitario' :{
      'pattern':       'Solo número.',
    }
  }

  addDetail(){
    //Asignación de la variable que llevará los datos a seran enviados por parametro 
    const data = {
      idOrder : this.data.idOrder,
      detail : this.formDetail.value.detail,
      cantidad : this.formDetail.value.cantidad,
      precioUnitario : this.formDetail.value.precioUnitario,
      totalDetail : ( parseFloat( this.formDetail.value.precioUnitario )*parseFloat(this.formDetail.value.cantidad ) ).toFixed(2)
    }
    //Consumo del servicio que guarda los datos en la BD h2
    this.apiService.postDetails( data )
    .then(( details ) => {
        console.log( details );
        //Cierra con excito el componente modal como excitoso 
        this.dialogRef.close( true );
    })
  }
}
