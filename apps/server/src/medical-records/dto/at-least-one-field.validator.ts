import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'AtLeastOneField', async: false })
class AtLeastOneFieldConstraint implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const [fields] = args.constraints as [string[]];
    const obj = args.object as Record<string, unknown>;
    return fields.some((field) => {
      const v = obj[field];
      return v !== undefined && v !== null && v !== '';
    });
  }

  defaultMessage(args: ValidationArguments): string {
    const [fields] = args.constraints as [string[]];
    return `Ao menos um destes campos deve ser preenchido: ${fields.join(', ')}.`;
  }
}

export function AtLeastOneField(fields: string[], options?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options,
      constraints: [fields],
      validator: AtLeastOneFieldConstraint,
    });
  };
}
