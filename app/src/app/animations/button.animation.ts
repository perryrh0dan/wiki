import { trigger, transition, animate, style } from '@angular/animations';

export const buttonEnterAnimation = trigger('buttonEnterAnimation', [
  transition(':enter', [
    style({
      transform: 'scale(0.0) rotate(-90deg)',
    }),
    animate('250ms', style({
      transform: 'scale(1.0) rotate(0)',
    })),
  ]),
  transition(':leave', [
    style({ 
      transform: 'scale(1.0)', 
    }),
    animate('250ms', style({
      transform: 'scale(0) rotate(-90deg)',
    })),
  ]),
]);