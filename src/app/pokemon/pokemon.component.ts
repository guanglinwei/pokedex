import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PokemonService } from './pokemon.service';

@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.scss']
})
export class PokemonComponent implements OnInit {
  @Input() pokemonData!: any; // just name and id from recieved pokemon-list
  // pokemonImageUrl?: string;
  pokemonDetails: any; // specific data about pokemon

  constructor(
    private pokemonService: PokemonService
  ) { }

  ngOnInit(): void {
    this.pokemonService.retrieveData(this.pokemonData.url).subscribe((data) => {
      this.pokemonDetails = data;
    })
  }

}
