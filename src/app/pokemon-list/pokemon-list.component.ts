import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PokemonService } from '../pokemon/pokemon.service';

@Component({
  selector: 'app-pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent implements OnInit {
  
  title = 'pokedex';
  pokemonList: any[] = [];
  pokemonListObject: any = {};
  pokemonPerRow: number = 3;
  private smallScreenWidthBreakpoint: number = 680;

  queryOnRedirect: string | null = null;

  constructor(
    private pokemonService: PokemonService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.pokemonService.getAllPokemon(() => {
      this.pokemonService.goToPage(1);
      this.pokemonList = this.pokemonService.pokemonOnCurrentPage;

      this.queryOnRedirect = this.route.snapshot.queryParamMap.get('search');
      if(this.queryOnRedirect) {
        this.searchQuery(this.queryOnRedirect);
      }
    });

    this.pokemonPerRow = (window.innerWidth <= this.smallScreenWidthBreakpoint) ? 2 : 3;
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
    if(query) {
      this.pokemonService.searchNameContaining(query);
      this.pokemonList = this.pokemonService.pokemonOnCurrentPage;
    }
    else {
      this.pokemonService.goToPage(1);
      this.pokemonList = this.pokemonService.pokemonOnCurrentPage;
    }

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

  //TODO: apply this to the details screen 
  onResize(event: Event) {
    let e = event.target as Window;
    this.pokemonPerRow = (e.innerWidth <= this.smallScreenWidthBreakpoint) ? 2 : 3;
  }

}
