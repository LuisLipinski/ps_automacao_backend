import Ajv from 'ajv';
import { empresaSchema } from '../schemas/ps_empresa.schema';
import { expect } from '@playwright/test';

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(empresaSchema);

export function validarContratoEmpresa(body: any) {
  const valid = validate(body);
  expect(valid, JSON.stringify(validate.errors)).toBeTruthy();
}
