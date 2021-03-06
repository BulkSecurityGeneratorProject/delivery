import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserCartService } from 'app/shared/service/userCart.service';
import { UserAddressService } from '../../shared/service/userAddressService';

import { Principal } from '../auth/principal.service';
import { AuthServerProvider } from '../auth/auth-jwt.service';
import { JhiTrackerService } from '../tracker/tracker.service';
import { MessagingService } from 'app/shared/service/messaging.service';
import { NgxNotificationService } from 'ngx-notification';

@Injectable({ providedIn: 'root' })
export class LoginService implements OnDestroy {
    notification: any;
    constructor(
        private router: Router,
        private principal: Principal,
        private trackerService: JhiTrackerService,
        private authServerProvider: AuthServerProvider,
        private cartService: UserCartService,
        private userAddressService: UserAddressService,
        private messagingService: MessagingService,
        private ngxNotificationService: NgxNotificationService
    ) {}
    playAudio() {
        const audio = new Audio();
        audio.src = '../../../content/bell.wav';
        audio.load();
        audio.play();
      }
    login(credentials, callback?) {
        const cb = callback || function() {};

        return new Promise((resolve, reject) => {
            this.authServerProvider.login(credentials).subscribe(
                data => {
                    this.cartService.setCart(null);
                    this.userAddressService.setUserAddresses(null);
                    try {
                        this.messagingService.init();
                    } catch (err) {
                        console.log(err);
                    }
                    this.trackerService.disconnect();
                    this.trackerService.connect();
                    this.notification = this.trackerService.receive().subscribe(res => {
                        this.ngxNotificationService.sendMessage('New Order Received - Order#' + res.id , 'dark', 'top-center');
                        this.playAudio();
                    });
                    this.trackerService.subscribeOrder();

                    this.principal.identity(true).then(account => {
                       // this.trackerService.sendActivity();
                       if (account !== null && account.authorities !== null && account !== undefined && account.authorities.indexOf('ROLE_ADMIN') !== -1) {
                        this.trackerService.subscribe();
                        }
                        resolve(data);
                    });
                    return cb();
                },
                err => {
                    this.logout();
                    reject(err);
                    return cb(err);
                }
            );
        });
    }

    loginWithToken(jwt, rememberMe) {
        return this.authServerProvider.loginWithToken(jwt, rememberMe);
    }

    logout() {
        this.messagingService.deleteToken();
        this.authServerProvider.logout().subscribe();
        this.principal.authenticate(null);
        this.trackerService.disconnect();
    }

    ngOnDestroy() {
        this.notification.unsubscribe();
    }
}
