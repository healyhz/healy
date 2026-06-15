export const corsOrigins = [process.env.LANDING_URL!, process.env.APP_URL!];

export const dbCredentials = {
  host: process.env.DB_HOST!,
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
};
