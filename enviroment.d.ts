declare global {
    namespace NodeJS {
        interface ProcessEnv {
            botToken: string;
            mongodbUrl: string;
            mongodbPass: string;
            mongodbUser: string;
            topggPassword: string;
            errorWebhook: string;
            logsWebhook: string;
            guildsWebhook: string;
            bugsWebhook: string;
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
            hasteServer: string;
            craiyonToken: string;
            logsWebServerWebhook: string;
            authScreenshots: string;
        }
    }
    interface Console {
        success(message: any, prefix?: string): void;
        critical(message: any, prefix?: string): void;
        system(message: any, prefix?: string): void;
    }
}

export {};
