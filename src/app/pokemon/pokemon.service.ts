import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { PokemonData } from "src/models/pokemondata";

import { enableProdMode, Injectable } from "@angular/core";
import { enableDebugTools } from "@angular/platform-browser";

//https://pokeapi.co/
@Injectable({
    providedIn: 'root',
})

export class PokemonService {
    allPokemon: any[] = [];
    pokemonOnCurrentPage: any[] = [];
    pokemonSearchResults: any[] = [];
    // currentPokemonMinIndex: number = 0;
    // currentPokemonMaxIndex: number = 20;
    pokemonPerPage: number = 21;
    currentPage: number = 0;

    mostRecentVersionId: number = 1;
    language: string = 'en';

    currentQuery: string | undefined;

    constructor(
        private http: HttpClient
    ) {
        // Get most recent version for most recent flavor text and stats
        this.http.get("https://pokeapi.co/api/v2/version?limit=1").subscribe((data: any) => {
            this.mostRecentVersionId = data.count;
        });
    }

    retrieveData(url: string | undefined = undefined, returnToFirstPageIfEmptyUrl: boolean = true): Observable<any> {
        let defaultUrl = returnToFirstPageIfEmptyUrl ? 'https://pokeapi.co/api/v2/pokemon?limit=21' : '';
        return this.http.get(url || defaultUrl);
    }

    // retrieveDataArray(urls: string[], ): {

    // }

    getAllPokemon(callback: () => any = () => {}): void {
        let req = this.http.get('https://pokeapi.co/api/v2/pokemon?limit=100000');
        req.subscribe((data: any) => {
            this.allPokemon = data.results;
            callback();
        });
    }

    getPokemonOfName(name: string): Observable<any> {
        // return this.allPokemon.find((pokemon: any) => {
        //     console.log(pokemon);
        //     return pokemon.name.toLowerCase() === name.toLowerCase();
        // });
        return this.http.get('https://pokeapi.co/api/v2/pokemon/' + name);
    }

    searchNameContaining(query: string): void {
        const maxSearchResults = 99999;//this.pokemonPerPage;
        this.goToPage(1);
        let count = 0;
        this.pokemonSearchResults = this.allPokemon.filter((pokemon: any) => {
            let name: string = pokemon.name;
            let result =  name.includes(query.toLowerCase());
            if(result) count++;
            return result && count <= maxSearchResults;
        });
        this.pokemonOnCurrentPage = this.getSearchResultsOnPage(1);
    }

    getSearchResultsOnPage(page: number): any[] {
        return this.pokemonSearchResults.slice((page - 1) * this.pokemonPerPage, Math.min(page * this.pokemonPerPage, this.allPokemon.length));
    }

    goToPage(page: number): void {
        this.currentPage = page;
        this.pokemonOnCurrentPage = this.allPokemon.slice((page - 1) * this.pokemonPerPage, Math.min(page * this.pokemonPerPage, this.allPokemon.length));
    }

    nextPage(): void {
        // search results
        if(this.currentQuery && this.currentQuery.length > 0 && this.currentPage + 1 < Math.floor((this.pokemonSearchResults.length + this.pokemonPerPage - 1) / this.pokemonPerPage)) {
            this.currentPage += 1;
            this.pokemonOnCurrentPage = this.getSearchResultsOnPage(this.currentPage);
        }
        // default page
        else if (!(this.currentQuery && this.currentQuery.length > 0) && this.currentPage + 1 < Math.floor((this.allPokemon.length + this.pokemonPerPage - 1) / this.pokemonPerPage)) {
            this.goToPage(this.currentPage + 1);
        }
    }

    prevPage(): void {
        if(this.currentQuery && this.currentQuery.length > 0 && this.currentPage > 1) {
            this.currentPage -= 1;
            this.pokemonOnCurrentPage = this.getSearchResultsOnPage(this.currentPage);
        }
        else if (!(this.currentQuery && this.currentQuery.length > 0) && this.currentPage > 1) {
            this.goToPage(this.currentPage - 1);
        }
    }

    lastPage(): void {
        this.goToPage(Math.floor((this.allPokemon.length + this.pokemonPerPage - 1) / this.pokemonPerPage));
    }

    formatAbilityName(name: string): string {
        return name.replace('-', ' ');
    }

    formatDescription(desc: string): string {
        // https://github.com/veekun/pokedex/issues/218
        return desc.replace('\f', '\n')
                   .replace('\u00ad\n', '')
                   .replace('\u00ad', '')
                   .replace(' -\n', ' - ')
                   .replace('-\n', '-')
                   .replace('\n', ' ');
    }

    findMostRecentEntryOfLanguage(array: any[], lang: string = this.language): any {
        return array[array.map(v => v.language.name === lang).lastIndexOf(true)];
    }

    // getPokemonInfo(pokemonUrl: any): Observable<any> {
    //     return this.http.get(pokemonUrl);
    // }
}