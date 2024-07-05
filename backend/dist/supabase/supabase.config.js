"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSupabaseClient = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const createSupabaseClient = (configService) => {
    const supabaseUrl = configService.get('SUPABASE_URL');
    const supabaseKey = configService.get('SUPABASE_KEY');
    if (!supabaseUrl)
        throw new Error('SUPABASE_URL is not set in environment variables');
    if (!supabaseKey)
        throw new Error('SUPABASE_KEY is not set in environment variables');
    return (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
};
exports.createSupabaseClient = createSupabaseClient;
//# sourceMappingURL=supabase.config.js.map