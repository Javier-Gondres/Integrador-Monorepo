/**
 * Referencia de cómo lanzar errores desde services sin try/catch innecesarios.
 * No se registra en ningún módulo: es documentación ejecutable para el equipo.
 */
import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';

import {
  AuthException,
  BusinessException,
  ErrorCodes,
  InventoryException,
} from '../index';

@Injectable()
export class ServiceErrorHandlingExample {
  /** Auth: regla de negocio explícita → excepción de dominio. */
  async loginExample(email: string, password: string): Promise<void> {
    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      throw AuthException.invalidCredentials();
    }
    // Comparar password… si falla:
    void password;
    throw AuthException.invalidCredentials();
  }

  /** Inventario: factories con contexto opcional. */
  async reserveStockExample(
    productId: string,
    quantity: number,
  ): Promise<void> {
    const product = await prisma.user.findUnique({ where: { id: productId } });
    if (!product) {
      throw InventoryException.productNotFound(productId);
    }
    void quantity;
    throw InventoryException.insufficientStock('Producto demo');
  }

  /**
   * Prisma: no envolver P2002/P2025 en try/catch.
   * El GlobalExceptionFilter los traduce a 409/404 con códigos estándar.
   */
  async createUserExample(email: string): Promise<void> {
    await prisma.user.create({
      data: {
        email,
        passwordHash: 'hash',
        firstName: 'Demo',
        lastName: 'Usuario',
      },
    });
  }

  /** Negocio genérico cuando no hay factory de dominio. */
  async assertCustomerExistsExample(customerId: string): Promise<void> {
    const customer = await prisma.user.findUnique({
      where: { id: customerId },
    });
    if (!customer) {
      throw BusinessException.notFound(
        ErrorCodes.CUSTOMER_NOT_FOUND,
        'Cliente no encontrado',
      );
    }
  }

  /** Pagos: BusinessException con código reutilizable. */
  chargePaymentExample(): void {
    const paymentSucceeded = false;
    if (!paymentSucceeded) {
      throw new BusinessException(
        ErrorCodes.PAYMENT_FAILED,
        'No se pudo procesar el pago',
      );
    }
  }
}
