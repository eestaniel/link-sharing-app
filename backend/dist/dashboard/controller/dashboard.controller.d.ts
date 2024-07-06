import { DashboardService } from '../service/dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(req: any): {
        message: string;
        user: any;
    };
    verifyAccess(req: any): boolean;
}
