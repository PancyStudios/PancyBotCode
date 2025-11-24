declare global {
    interface Console {
        success(message: any, prefix?: string): void;
        critical(message: any, prefix?: string): void;
        system(message: any, prefix?: string): void;
    }
}

export {}