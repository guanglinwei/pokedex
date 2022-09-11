import { Injectable, OnDestroy } from "@angular/core";
import { BreakpointsSettings } from "src/models/breakpointsettings";
import { Observable, Subject, takeUntil } from 'rxjs';
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";

@Injectable({
    providedIn: 'root',
})

export class SettingsService implements OnDestroy {
    constructor(
        private breakpointObserver: BreakpointObserver
    ) { }

    private destroyed = new Subject<void>();

    private pokemonListBreakpoint = 680; // When to display 2 or 3 pokemon per row
    private pokemonDetailBreakpoint = 680; // When to align the pokemon evolutions and detail table vertically
    private darkTheme = false;
    private breakpointSettingsMap: Map<string, BreakpointsSettings> = new Map([
        ['(max-width: 719.98px)', {
            pokemonPerRow: 2,
            collapsePokemonDetails: true
        }],
        ['(min-width: 720px)', {
            pokemonPerRow: 3,
            collapsePokemonDetails: false
        }]
      ]);

    private breakpoints: string[] = [...this.breakpointSettingsMap.keys()];

    getBreakpoints(): string[] {
        return this.breakpoints;
    }

    getBreakpointSettings(breakpoint: string) {
        return this.breakpointSettingsMap.get(breakpoint);
    }

    getBreakpointObservable(): Observable<BreakpointState> {
        return this.breakpointObserver.observe(this.breakpoints)
            .pipe(takeUntil(this.destroyed));
    }

    ngOnDestroy() {
        this.destroyed.next();
        this.destroyed.complete();
    }
}