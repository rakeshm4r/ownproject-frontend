// src/app/validators.ts

import { AbstractControl, ValidatorFn } from '@angular/forms';

export function emailAtSymbolValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const email = control.value;
    if (!email) {
      return null; // Don't validate if there's no email
    }

    return email.includes('@') ? null : { 'atSymbol': true };
  };
}

export function emailDomainValidator(allowedDomains: string[]): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const email = control.value;
    if (!email) {
      return null; // Don't validate if there's no email
    }

    const domain = email.split('@')[1];
    return allowedDomains.includes(domain) ? null : { 'domain': { value: control.value } };
  };
}