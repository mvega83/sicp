import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

/**
 * Calcula el dígito verificador de un RUN/RUT chileno con el algoritmo módulo 11
 * (el mismo que usa el Registro Civil). Se multiplica cada dígito del cuerpo, de
 * derecha a izquierda, por una secuencia 2,3,4,5,6,7,2,3,4... y se suman los
 * resultados; el resto de esa suma contra 11 define el dígito verificador.
 */
function calcularDigitoVerificador(cuerpo: string): string {
  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  if (resto === 11) return '0';
  if (resto === 10) return 'K';
  return String(resto);
}

/**
 * Decorador de class-validator para validar un RUN chileno completo (cuerpo +
 * dígito verificador), aceptando formatos con o sin puntos (ej. "12.345.678-9" o
 * "12345678-9"). Uso: @EsRunValido() sobre un campo string del DTO.
 */
export function EsRunValido(opciones?: ValidationOptions) {
  return function (objeto: object, nombrePropiedad: string) {
    registerDecorator({
      name: 'esRunValido',
      target: objeto.constructor,
      propertyName: nombrePropiedad,
      options: opciones,
      validator: {
        validate(valor: unknown) {
          if (typeof valor !== 'string') return false;
          const run = valor.replace(/\./g, '').toUpperCase();
          if (!/^\d{7,8}-[0-9K]$/.test(run)) return false;

          const [cuerpo, digitoVerificadorRecibido] = run.split('-');
          return calcularDigitoVerificador(cuerpo) === digitoVerificadorRecibido;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} no es un RUN válido (formato esperado: 12345678-9)`;
        },
      },
    });
  };
}
