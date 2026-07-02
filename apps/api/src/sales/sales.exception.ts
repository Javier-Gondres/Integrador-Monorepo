import { HttpStatus } from '@nestjs/common';
import { BusinessException, ErrorCodes } from 'src/common/errors';

/**
 * Errores del dominio de ventas / facturación (POS).
 */
export class SalesException extends BusinessException {
  static noOpenCashShift(): SalesException {
    return new SalesException(
      ErrorCodes.NO_OPEN_CASH_SHIFT,
      'No hay un turno de caja abierto para registrar la venta',
      HttpStatus.CONFLICT,
    );
  }

  static paymentsTotalMismatch(expected: number, received: number): SalesException {
    return new SalesException(
      ErrorCodes.PAYMENTS_TOTAL_MISMATCH,
      `La suma de los pagos (RD$ ${received.toFixed(2)}) no coincide con el monto a pagar (RD$ ${expected.toFixed(2)})`,
      HttpStatus.BAD_REQUEST,
    );
  }

  static customerRequired(): SalesException {
    return new SalesException(
      ErrorCodes.CUSTOMER_REQUIRED,
      'Toda venta debe estar vinculada a un cliente registrado',
      HttpStatus.BAD_REQUEST,
    );
  }

  static customerRequiredForCredit(): SalesException {
    return new SalesException(
      ErrorCodes.CUSTOMER_REQUIRED_FOR_CREDIT,
      'Las ventas a crédito y el uso de notas de crédito requieren seleccionar un cliente',
      HttpStatus.BAD_REQUEST,
    );
  }

  static creditNoteNotAvailable(): SalesException {
    return new SalesException(
      ErrorCodes.CREDIT_NOTE_NOT_AVAILABLE,
      'Una o más notas de crédito no están disponibles para este cliente',
      HttpStatus.CONFLICT,
    );
  }

  static reservationNotFound(): SalesException {
    return new SalesException(
      ErrorCodes.RESERVATION_NOT_FOUND,
      'La reserva indicada no existe',
      HttpStatus.NOT_FOUND,
    );
  }

  static reservationNotActive(): SalesException {
    return new SalesException(
      ErrorCodes.RESERVATION_NOT_ACTIVE,
      'La reserva indicada no está activa',
      HttpStatus.CONFLICT,
    );
  }
}
