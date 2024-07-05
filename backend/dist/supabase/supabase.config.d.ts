import { ConfigService } from '@nestjs/config';
export declare const createSupabaseClient: (configService: ConfigService) => import("@supabase/supabase-js").SupabaseClient<any, "public", any>;
