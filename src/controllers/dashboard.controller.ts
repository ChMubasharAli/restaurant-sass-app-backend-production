import type { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service.js";

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getDashboardStats = async (req: Request, res: Response) => {
    const stats = await this.dashboardService.getDashboardStats();
    res.json({
      status: "success",
      data: stats,
    });
  };

  getSalesReport = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const report = await this.dashboardService.getSalesReport(
      startDate as string,
      endDate as string,
    );
    res.json({
      status: "success",
      data: report,
    });
  };

  getOrderAnalytics = async (req: Request, res: Response) => {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = await this.dashboardService.getOrderAnalytics(days);
    res.json({
      status: "success",
      data: analytics,
    });
  };
}
