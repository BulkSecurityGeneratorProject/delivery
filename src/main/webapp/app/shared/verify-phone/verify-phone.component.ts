import { Component, AfterViewInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { JhiEventManager } from 'ng-jhipster';
import { HttpClient, HttpResponse } from '@angular/common/http';
import * as firebase from 'firebase';

@Component({
    selector: 'jhi-verify-phone',
    templateUrl: './verify-phone.html'
})
export class VerifyPhoneComponent implements AfterViewInit {
    @Input() number;
    sent = false;
    confirmationResult: any;
    public recaptchaVerifier: firebase.auth.RecaptchaVerifier;
    verification: string;
    constructor(
        private router: Router,
        public activeModal: NgbActiveModal,
        private http: HttpClient
    ) {

        const firebaseConfig = {
            apiKey: 'AIzaSyDwesaV0Z7pUnqQqVSVOwN3pzpPPB2ZMlM',
            projectId: 'drgreens-6888a'

          };
          if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
          }
    }

    ngAfterViewInit() {
        this.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
       this.onSubmit();
    }

    onSubmit() {
        const appVerifier = this.recaptchaVerifier;
        const phoneNumberString = '+91' + this.number.toString();
        firebase.auth().signInWithPhoneNumber(phoneNumberString, appVerifier)
          .then( confirmationResult => {
            this.sent = true;
            this.confirmationResult = confirmationResult;
          })
          .catch(err => {
            console.log('sms not sent', err);
          });
      }

      verify() {
        this.confirmationResult.confirm(this.verification)
          .then(good => {
            this.activeModal.dismiss(true);

          })
          .catch(bad => {
            // code verification was bad.
          });
      }

    cancel() {
        this.activeModal.dismiss(false);
    }
}