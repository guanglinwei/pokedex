import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { PokemonService } from '../services/pokemon.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent implements OnInit {
  title = 'pokedex';
  pokemonList: any[] = [];
  pokemonListObject: any = {};
  currentPokemonPerRow: number = 3;

  queryOnRedirect: string | null = null;

  constructor(
    private pokemonService: PokemonService,
    private settings: SettingsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    // Change the pokemon per row depending on window width
    this.settings.getBreakpointObservable().subscribe((v: any) => {
      for(const size in v.breakpoints) {
        if(v.breakpoints[size]) {
          this.currentPokemonPerRow = this.settings.getBreakpointSettings(size)?.pokemonPerRow || 3;
        }
      }
    });
  }

  ngOnInit(): void {
    // Get every pokemon and go to the first page
    this.pokemonService.getAllPokemon(() => {
      this.pokemonService.currentQuery = undefined;
      this.pokemonService.goToPage(1);
      this.pokemonList = this.pokemonService.pokemonOnCurrentPage;

      // Re-fill the search bar if there was a query beforehand
      this.queryOnRedirect = this.route.snapshot.queryParamMap.get('search');
      if(this.queryOnRedirect) {
        this.searchQuery(this.queryOnRedirect);
      }
    });

    // this.currentPokemonPerRow = (window.innerWidth <= this.smallScreenWidthBreakpoint) ? 2 : 3;
  }

  next(): void {
    this.pokemonService.nextPage();
    this.pokemonList = this.pokemonService.pokemonOnCurrentPage;
  }

  previous(): void {
    this.pokemonService.prevPage();
    this.pokemonList = this.pokemonService.pokemonOnCurrentPage;
  }

  searchQuery(query: string) {
    this.pokemonService.searchNameContaining(query);
    this.pokemonList = this.pokemonService.pokemonOnCurrentPage;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: query },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });

    this.pokemonService.currentQuery = query;
  }

  search(event: Event) {
    this.searchQuery((event.target as HTMLInputElement).value);
  }

  getCurrentPage(): number {
    return this.pokemonService.currentPage;
  }

  getTotalPages(): number {
    return this.pokemonService.hasSearchQuery() ? this.pokemonService.totalPagesForSearch : this.pokemonService.totalPages;
  }
}
