import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';
import type { CompanyContext } from 'src/common/company';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

@Injectable()
export class DashboardService {
  async getSummary(
    company: CompanyContext,
    branchId?: string,
    days: number = 7,
  ) {
    const targetBranchId = branchId === 'todas' ? undefined : branchId;

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const yesterdayStart = startOfDay(subDays(today, 1));
    const yesterdayEnd = endOfDay(subDays(today, 1));

    const startDate = startOfDay(subDays(today, days - 1));

    // Parallel queries to prevent database blocking
    const [
      salesToday,
      salesYesterday,
      receivables,
      payables,
      salesHistory,
      purchasesHistory,
      topSaleItems,
      recentMovements,
    ] = await Promise.all([
      // 1. Sales Today
      prisma.sale.aggregate({
        where: {
          branch: { companyId: company.id },
          branchId: targetBranchId,
          status: 'COMPLETED',
          createdAt: { gte: todayStart, lte: todayEnd },
        },
        _sum: { total: true },
      }),

      // 2. Sales Yesterday
      prisma.sale.aggregate({
        where: {
          branch: { companyId: company.id },
          branchId: targetBranchId,
          status: 'COMPLETED',
          createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
        },
        _sum: { total: true },
      }),

      // 3. Accounts Receivable Outstanding
      prisma.accountReceivable.aggregate({
        where: {
          customer: { companyId: company.id },
          status: { in: ['OPEN', 'PARTIAL'] },
        },
        _sum: { balance: true },
      }),

      // 4. Accounts Payable Outstanding
      prisma.accountPayable.aggregate({
        where: {
          supplier: { companyId: company.id },
          status: { in: ['OPEN', 'PARTIAL'] },
        },
        _sum: { balance: true },
      }),

      // 5. Sales History (Daily)
      prisma.sale.findMany({
        where: {
          branch: { companyId: company.id },
          branchId: targetBranchId,
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
        select: {
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),

      // 6. Purchases History (Daily)
      prisma.purchase.findMany({
        where: {
          branch: { companyId: company.id },
          branchId: targetBranchId,
          createdAt: { gte: startDate },
        },
        select: {
          total: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'asc' },
      }),

      // 7. Top Sale Items (for Category & Product distribution)
      prisma.saleItem.groupBy({
        by: ['productId'],
        where: {
          sale: {
            branch: { companyId: company.id },
            branchId: targetBranchId,
            status: 'COMPLETED',
            createdAt: { gte: startDate },
          },
        },
        _sum: {
          quantity: true,
          subtotal: true,
        },
        orderBy: {
          _sum: {
            subtotal: 'desc',
          },
        },
        take: 50,
      }),

      // 8. Recent Movements
      prisma.inventoryMovement.findMany({
        where: {
          branch: { companyId: company.id },
          branchId: targetBranchId,
        },
        include: {
          product: {
            select: { name: true, code: true },
          },
          performedBy: {
            select: { firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // 9. Hydrate top sales items with categories and product names
    const productIds = topSaleItems.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        categories: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Group Top selling products by category and build product ranking
    const categoryTotals: Record<string, { name: string; value: number }> = {};
    const topProducts = topSaleItems.map((item) => {
      const prod = productMap.get(item.productId);
      const subtotal = Number(item._sum.subtotal || 0);
      const quantity = Number(item._sum.quantity || 0);

      if (prod) {
        prod.categories.forEach((cat) => {
          if (!categoryTotals[cat.id]) {
            categoryTotals[cat.id] = { name: cat.name, value: 0 };
          }
          categoryTotals[cat.id].value += subtotal;
        });
      }

      return {
        id: item.productId,
        name: prod?.name || 'Producto Desconocido',
        quantity,
        total: subtotal,
        categories: prod?.categories.map((c) => c.name) || [],
      };
    });

    const categoriesDistribution = Object.values(categoryTotals).sort(
      (a, b) => b.value - a.value,
    );

    // Group Sales and Purchases by Day
    const dailyMap: Record<
      string,
      { date: string; sales: number; purchases: number }
    > = {};

    // Initialize all dates in range
    for (let i = 0; i < days; i++) {
      const d = subDays(today, days - 1 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      dailyMap[dateStr] = {
        date: dateStr,
        sales: 0,
        purchases: 0,
      };
    }

    salesHistory.forEach((sale) => {
      const dateStr = format(new Date(sale.createdAt), 'yyyy-MM-dd');
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].sales += Number(sale.total);
      }
    });

    purchasesHistory.forEach((purch) => {
      const dateStr = format(new Date(purch.createdAt), 'yyyy-MM-dd');
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].purchases += Number(purch.total);
      }
    });

    const comparisonHistory = Object.values(dailyMap);

    return {
      kpis: {
        salesToday: Number(salesToday._sum.total || 0),
        salesYesterday: Number(salesYesterday._sum.total || 0),
        receivablesBalance: Number(receivables._sum.balance || 0),
        payablesBalance: Number(payables._sum.balance || 0),
      },
      charts: {
        comparisonHistory,
        categoriesDistribution,
        topProducts,
      },
      recentMovements: recentMovements.map((mv) => ({
        id: mv.id,
        productName: mv.product.name,
        productCode: mv.product.code,
        type: mv.type,
        quantity: Number(mv.quantity),
        referenceNumber: mv.referenceNumber,
        notes: mv.notes,
        createdAt: mv.createdAt,
        performedBy: mv.performedBy
          ? `${mv.performedBy.firstName} ${mv.performedBy.lastName}`
          : 'Sistema',
      })),
    };
  }
}
