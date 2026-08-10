import { Injectable } from '@nestjs/common';
import { prisma } from '@repo/db';
import {
  endOfDay,
  format,
  startOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  parse,
  eachDayOfInterval,
} from 'date-fns';
import type { CompanyContext } from 'src/common/company';

@Injectable()
export class DashboardService {
  async getSummary(
    company: CompanyContext,
    branchId?: string,
    days: number = 7,
    month?: string,
  ) {
    const targetBranchId = branchId === 'todas' ? undefined : branchId;

    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);
    const yesterdayStart = startOfDay(subDays(today, 1));
    const yesterdayEnd = endOfDay(subDays(today, 1));

    let startDate: Date | undefined;
    let endDate: Date;
    let isMonthFilter = false;
    const isAllTime = !month && days === 0;

    if (month) {
      try {
        const parsedDate = parse(month, 'yyyy-MM', new Date());
        startDate = startOfMonth(parsedDate);
        endDate = endOfMonth(parsedDate);
        isMonthFilter = true;
      } catch (_e) {
        startDate = startOfDay(subDays(today, 7));
        endDate = todayEnd;
      }
    } else if (isAllTime) {
      startDate = undefined; // No date filter — fetch everything
      endDate = todayEnd;
    } else {
      startDate = startOfDay(subDays(today, days - 1));
      endDate = todayEnd;
    }

    // Parallel queries to prevent database blocking
    const [
      salesToday,
      salesYesterday,
      receivablesAgg,
      payablesAgg,
      salesHistory,
      purchasesHistory,
      topSaleItems,
      recentMovements,
      cashSalesSum,
      cashReceivablesSum,
      cashPayablesSum,
      receivablePayments,
      payablePayments,
      receivablesList,
      payablesList,
    ] = await Promise.all([
      // 1. Sales Today
      prisma.sale.aggregate({
        where: {
          branch: { companyId: company.companyId },
          branchId: targetBranchId,
          status: 'COMPLETED',
          createdAt: { gte: todayStart, lte: todayEnd },
        },
        _sum: { total: true },
      }),

      // 2. Sales Yesterday
      prisma.sale.aggregate({
        where: {
          branch: { companyId: company.companyId },
          branchId: targetBranchId,
          status: 'COMPLETED',
          createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
        },
        _sum: { total: true },
      }),

      // 3. Accounts Receivable Outstanding Aggregate (fallback)
      prisma.accountReceivable.aggregate({
        where: {
          customer: { companyId: company.companyId },
          status: { in: ['OPEN', 'PARTIAL'] },
          sale: targetBranchId ? { branchId: targetBranchId } : undefined,
        },
        _sum: { balance: true },
      }),

      // 4. Accounts Payable Outstanding Aggregate (fallback)
      prisma.accountPayable.aggregate({
        where: {
          supplier: { companyId: company.companyId },
          status: { in: ['OPEN', 'PARTIAL'] },
          purchase: targetBranchId ? { branchId: targetBranchId } : undefined,
        },
        _sum: { balance: true },
      }),

      // 5. Sales History (Daily)
      prisma.sale.findMany({
        where: {
          branch: { companyId: company.companyId },
          branchId: targetBranchId,
          status: 'COMPLETED',
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            lte: endDate,
          },
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
          branch: { companyId: company.companyId },
          branchId: targetBranchId,
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            lte: endDate,
          },
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
            branch: { companyId: company.companyId },
            branchId: targetBranchId,
            status: 'COMPLETED',
            createdAt: {
              ...(startDate ? { gte: startDate } : {}),
              lte: endDate,
            },
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
          branch: { companyId: company.companyId },
          branchId: targetBranchId,
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            lte: endDate,
          },
        },
        include: {
          product: {
            select: { name: true, code: true },
          },
          performedBy: {
            select: {
              user: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // 9. Cash Sales Sum
      prisma.payment.aggregate({
        where: {
          method: 'CASH',
          sale: {
            status: 'COMPLETED',
            branch: { companyId: company.companyId },
            branchId: targetBranchId,
            createdAt: { lte: endDate },
          },
        },
        _sum: { amount: true },
      }),

      // 10. Cash Receivables Payments Sum
      prisma.receivablePayment.aggregate({
        where: {
          method: 'CASH',
          createdAt: { lte: endDate },
          accountReceivable: {
            sale: {
              branch: { companyId: company.companyId },
              branchId: targetBranchId,
            },
          },
        },
        _sum: { amount: true },
      }),

      // 11. Cash Payables Payments Sum
      prisma.payablePayment.aggregate({
        where: {
          method: 'CASH',
          createdAt: { lte: endDate },
          accountPayable: {
            purchase: {
              branch: { companyId: company.companyId },
              branchId: targetBranchId,
            },
          },
        },
        _sum: { amount: true },
      }),

      // 12. Receivable Payments for Average Collection Days
      prisma.receivablePayment.findMany({
        where: {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            lte: endDate,
          },
          accountReceivable: {
            sale: {
              branch: { companyId: company.companyId },
              branchId: targetBranchId,
            },
          },
        },
        select: {
          createdAt: true,
          accountReceivable: {
            select: {
              sale: {
                select: {
                  createdAt: true,
                },
              },
            },
          },
        },
      }),

      // 13. Payable Payments for Average Payment Days
      prisma.payablePayment.findMany({
        where: {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            lte: endDate,
          },
          accountPayable: {
            purchase: {
              branch: { companyId: company.companyId },
              branchId: targetBranchId,
            },
          },
        },
        select: {
          createdAt: true,
          accountPayable: {
            select: {
              purchase: {
                select: {
                  createdAt: true,
                },
              },
            },
          },
        },
      }),

      // 14. Detailed Receivables list for historical balance calculation
      isMonthFilter
        ? prisma.accountReceivable.findMany({
            where: {
              customer: { companyId: company.companyId },
              sale: targetBranchId ? { branchId: targetBranchId } : undefined,
              createdAt: { lte: endDate },
            },
            include: {
              payments: {
                where: { createdAt: { lte: endDate } },
              },
            },
          })
        : Promise.resolve(null),

      // 15. Detailed Payables list for historical balance calculation
      isMonthFilter
        ? prisma.accountPayable.findMany({
            where: {
              supplier: { companyId: company.companyId },
              purchase: targetBranchId
                ? { branchId: targetBranchId }
                : undefined,
              createdAt: { lte: endDate },
            },
            include: {
              payments: {
                where: { createdAt: { lte: endDate } },
              },
            },
          })
        : Promise.resolve(null),
    ]);

    // Hydrate top sales items with categories and product names
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

    if (isMonthFilter) {
      const daysInMonth = eachDayOfInterval({
        start: startDate!,
        end: endDate,
      });
      daysInMonth.forEach((d) => {
        const dateStr = format(d, 'yyyy-MM-dd');
        dailyMap[dateStr] = {
          date: dateStr,
          sales: 0,
          purchases: 0,
        };
      });
    } else if (days <= 365) {
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
    }

    salesHistory.forEach((sale) => {
      const dateStr = format(new Date(sale.createdAt), 'yyyy-MM-dd');
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          date: dateStr,
          sales: 0,
          purchases: 0,
        };
      }
      dailyMap[dateStr].sales += Number(sale.total);
    });

    purchasesHistory.forEach((purch) => {
      const dateStr = format(new Date(purch.createdAt), 'yyyy-MM-dd');
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = {
          date: dateStr,
          sales: 0,
          purchases: 0,
        };
      }
      dailyMap[dateStr].purchases += Number(purch.total);
    });

    const comparisonHistory = Object.values(dailyMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    // Calculate Cash on Hand
    const cashOnHand =
      Number(cashSalesSum._sum.amount || 0) +
      Number(cashReceivablesSum._sum.amount || 0) -
      Number(cashPayablesSum._sum.amount || 0);

    // Calculate Accounts Receivable Outstanding Balance
    let receivablesBalance = 0;
    if (isMonthFilter && receivablesList) {
      receivablesList.forEach((r) => {
        const paidAmount = r.payments.reduce(
          (sum, p) => sum + Number(p.amount),
          0,
        );
        const balanceAsOfDate = Number(r.originalAmount) - paidAmount;
        if (balanceAsOfDate > 0) {
          receivablesBalance += balanceAsOfDate;
        }
      });
    } else {
      receivablesBalance = Number(receivablesAgg._sum.balance || 0);
    }

    // Calculate Accounts Payable Outstanding Balance
    let payablesBalance = 0;
    if (isMonthFilter && payablesList) {
      payablesList.forEach((p) => {
        const paidAmount = p.payments.reduce(
          (sum, pay) => sum + Number(pay.amount),
          0,
        );
        const balanceAsOfDate = Number(p.originalAmount) - paidAmount;
        if (balanceAsOfDate > 0) {
          payablesBalance += balanceAsOfDate;
        }
      });
    } else {
      payablesBalance = Number(payablesAgg._sum.balance || 0);
    }

    // Calculate Average Collection Days
    let totalCollectionDays = 0;
    receivablePayments.forEach((p) => {
      const diffMs =
        p.createdAt.getTime() - p.accountReceivable.sale.createdAt.getTime();
      totalCollectionDays += diffMs / (1000 * 60 * 60 * 24);
    });
    const avgCollectionDays =
      receivablePayments.length > 0
        ? totalCollectionDays / receivablePayments.length
        : 0;

    // Calculate Average Payment Days
    let totalPaymentDays = 0;
    payablePayments.forEach((p) => {
      const diffMs =
        p.createdAt.getTime() - p.accountPayable.purchase.createdAt.getTime();
      totalPaymentDays += diffMs / (1000 * 60 * 60 * 24);
    });
    const avgPaymentDays =
      payablePayments.length > 0
        ? totalPaymentDays / payablePayments.length
        : 0;

    return {
      kpis: {
        salesToday: Number(salesToday._sum.total || 0),
        salesYesterday: Number(salesYesterday._sum.total || 0),
        receivablesBalance,
        payablesBalance,
        cashOnHand,
        avgCollectionDays: Math.round(avgCollectionDays * 10) / 10,
        avgPaymentDays: Math.round(avgPaymentDays * 10) / 10,
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
        performedBy: mv.performedBy?.user
          ? `${mv.performedBy.user.firstName} ${mv.performedBy.user.lastName}`
          : 'Sistema',
      })),
    };
  }
}
