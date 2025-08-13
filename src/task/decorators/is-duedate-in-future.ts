import { ValidationOptions, registerDecorator } from 'class-validator';

export function IsDueDateInFuture(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsDueDateInFuture',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string) {
          if (!value) return true;

          const dueDate = new Date(value);
          const now = new Date();

          return dueDate >= now;
        },
        defaultMessage() {
          return 'A data de vencimento não pode ser anterior à data atual.';
        },
      },
    });
  };
}
