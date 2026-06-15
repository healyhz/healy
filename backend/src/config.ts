if (!process.env.LANDING_URL) throw new Error();
if (!process.env.APP_URL) throw new Error();

export const corsOrigins = [process.env.LANDING_URL, process.env.APP_URL];
