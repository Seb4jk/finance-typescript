import { validateRut, formatRut, validateAndFormatRut } from '../utils/rutValidator';

describe('RUT Validator', () => {
  // Test cases
  const validRuts = [
    '12345678-9',
    '12.345.678-9',
    '123456789',
    '11111111-1',
    '6-k',
    '6.661.852-5',
    '19.272.655-8',
    '8.953.996-7',
    '7480689-9'
  ];

  const invalidRuts = [
    '12345678-0', // Dígito verificador incorrecto
    '12345',      // Muy corto
    'abcdef-g',   // No numérico
    '',           // Vacío
    null,         // Nulo
    undefined,    // Indefinido
    '11111111-2', // Dígito verificador incorrecto
    '123456789x', // Dígito verificador no válido
    '99999999-9'  // Dígito verificador incorrecto
  ];

  describe('validateRut', () => {
    test.each(validRuts)('debería validar RUT válido: %s', (rut) => {
      expect(validateRut(rut)).toBe(true);
    });

    test.each(invalidRuts)('debería rechazar RUT inválido: %s', (rut: any) => {
      expect(validateRut(rut)).toBe(false);
    });
  });

  describe('validateAndFormatRut', () => {
    test.each(validRuts)('debería validar y formatear RUT válido: %s', (rut) => {
      expect(validateAndFormatRut(rut)).toBeTruthy();
    });

    test.each(invalidRuts)('debería rechazar RUT inválido en validación y formateo: %s', (rut: any) => {
      expect(validateAndFormatRut(rut)).toBeNull();
    });
  });

  describe('formatRut', () => {
    const formattingTests = [
      { input: '12345678-9', expected: '12.345.678-9' },
      { input: '123456789', expected: '12.345.678-9' },
      { input: '11111111-1', expected: '11.111.111-1' },
      { input: '6-k', expected: '6-K' },
      { input: '6k', expected: '6-K' }
    ];

    test.each(formattingTests)('debería formatear correctamente: $input', ({input, expected}) => {
      expect(formatRut(input)).toBe(expected);
    });
  });
});
