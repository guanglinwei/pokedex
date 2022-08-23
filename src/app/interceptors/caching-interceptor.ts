import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of, tap } from "rxjs";

@Injectable()

export class CachingInterceptor implements HttpInterceptor {
    // constructor(private cache: Map<HttpRequest, HttpResponse>) { }
    private cache: Map<string, HttpResponse<any>> = new Map();

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if(req.method !== "GET") return next.handle(req);

        const cacheResponse = this.cache.get(req.urlWithParams);
        
        return cacheResponse ? of(cacheResponse) : next.handle(req).pipe(
            tap(event => {
                if(event instanceof HttpResponse) {
                    this.cache.set(req.urlWithParams, event);
                }
            })
        );
    }
}