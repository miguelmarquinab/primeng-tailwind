import { Component, inject, OnInit } from '@angular/core';
import { InputOtp } from 'primeng/inputotp';
import { Button } from 'primeng/button';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
    selector: 'app-markup-modal',
    imports: [InputOtp, Button, ReactiveFormsModule],
    templateUrl: './markup-modal.html',
    styleUrl: './markup-modal.scss',
    providers: []
})
export class MarkupModal implements OnInit {
    form!: FormGroup;
    formBuilder = inject(FormBuilder);
    private readonly dynamicDialogRef = inject(DynamicDialogRef);

    ngOnInit(): void {
        this.initPinForm();
    }

    initPinForm() {
        this.form = this.formBuilder.group({
            pin: ['',[Validators.required]],
        });
    }

    next(){
        if(this.form.valid){
            const pinValue = this.form.value.pin;
            this.dynamicDialogRef.close(pinValue);
        }
    }
}
