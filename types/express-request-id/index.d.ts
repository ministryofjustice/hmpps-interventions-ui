declare module 'express-request-id' {
    import { RequestHandler } from 'express';
    
    export interface Options {
        headerName?: string;
        setHeader?: boolean;
        generator?: (request: any) => string;
    }
    
    export function requestId(options?: Options): RequestHandler;
    
    export default requestId;
}