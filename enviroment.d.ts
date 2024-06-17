declare global {
    namespace NodeJS {
        interface ProcessEnv {
            botToken: string;
            mongodbUrl: string;
            topggPassword: string;
            errorWebhook: string;
            logsWebhook: string;
            guildsWebhook: string;
            enviroment: "dev" | "prod" | "debug";
            PORT: number;
            PasswordApi: string;
            username: string;
            password: string;
            imageDbUrl: string;
            linkserver: string;
            linkpassword: string;
            linkErrorTracker: string;
            spotifyClientId: string;
            spotifyClientSecret: string;
        }
    }
}

export {};
