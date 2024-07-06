import {Injectable} from '@nestjs/common';


@Injectable()
export class DashboardService {
  verifyAccess(): boolean {
    return true
  }
}
