import { Component, OnInit } from '@angular/core';
import { PokemonService } from './services/pokemon.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
// images: https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png
export class AppComponent implements OnInit {
  constructor() {}
  
  ngOnInit(): void {
  }
}