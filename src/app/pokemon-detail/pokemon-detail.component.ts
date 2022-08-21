import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, forkJoin, from, map, merge, mergeMap, Observable, of, tap } from 'rxjs';
import { EvolutionChainNode } from 'src/models/evolutionchainnode';
import { PokemonService } from '../pokemon/pokemon.service';

@Component({
  selector: 'app-pokemon-detail',
  templateUrl: './pokemon-detail.component.html',
  styleUrls: ['./pokemon-detail.component.scss']
})
export class PokemonDetailComponent implements OnInit {

  pokemon: any = undefined;
  typeGradientClass: string = "";
  genera: string = "";
  flavorText: string = "";
  abilities: any[] = [];

  // evolutionChain?: EvolutionChainNode;
  evolutionChain? : EvolutionChainNode[];
  evolutionGridRows: number = 0;
  evolutionGridCols: number = 0;

  varieties: any[] = [];
  forms: any[] = [];

  screenWidth: number = window.innerWidth;

  constructor(
    private pokemonService: PokemonService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  getNumbersUpToMaxDepth(currentDepth: number): number[] {
    return Array(this.evolutionGridCols - currentDepth).fill(0);
  }

  ngOnInit(): void {
    
    // TODO: formes in species.varieties
    // flavor_text_entries
    // genera
    // find language.name=en, version.name=
    // MAKE ICON A TABLE WITH THE INFO ON RIGHT unless on mobile https://www.pokemon.com/us/pokedex/charizard
    // const pokemonName = this.route.snapshot.paramMap.get('name') || '';

    this.route.paramMap.subscribe((p) => {
      this.pokemonService.getPokemonOfName(p.get('name') || '').subscribe((data: any) => {
        // reset all info
        this.abilities = [];
        this.flavorText = "";
        this.genera = "";
        this.typeGradientClass = "";
        this.evolutionChain = undefined;
        this.evolutionGridCols = 0;
        this.evolutionGridRows = 0;
        this.varieties = [];
        this.forms = [];
        this.pokemon = data;
        console.log(this.pokemon);

        let types = data.types.slice(0, 2).map((type: any) => type.type.name);
        if(types.length === 1) types.push(types[0]); // if single-typed, push the same type again. ex: normal-normal
        this.typeGradientClass = "type-gradient-" + types.join('-');

        // Forms
        //TODO: better names can be found in pokemon.forms.url -> result.form_names
        from(data.forms).pipe(
          concatMap((form: any) => {
            return this.pokemonService.retrieveData(form.url);
          }))
          .subscribe((form: any) => {
            this.forms.push({
              name: form.name,
              sprite: form.sprites.front_default
            });
          });

        // Get species data
        this.pokemonService.retrieveData(data.species.url, false).subscribe((species: any) => {
          console.log("species", species);
          let flavorText: string = this.pokemonService.findMostRecentEntryOfLanguage(species.flavor_text_entries)?.flavor_text 
                || "No description was found for this Pokemon.";
          
          this.flavorText = this.pokemonService.formatDescription(flavorText);
          
          this.genera = species.genera.find((v: any) => v.language.name === this.pokemonService.language).genus;

          this.varieties = species.varieties;

          // evolution order
          this.pokemonService.retrieveData(species.evolution_chain.url, false).subscribe((evo: any) => {

            /* chain: {
              species: { name, url },
              evolves_to: [
                species: { name, url }
                evolves_to: [...]
              ]
            }*/
            const chain = evo.chain;
            this.getRecursive(chain).subscribe((res: any) => {
              console.log("FINAL", res);
              // this.evolutionChain = res;

              // Evolution display info
              if(res) {
                // Count level with most pokemon to get grid-list dimensions
                this.evolutionChain = [];
                res = res as EvolutionChainNode;
                let maxDepth = 0;
                const getRowSpanRecursive = (node: EvolutionChainNode, depth: number): number => {
                  maxDepth = Math.max(maxDepth, depth);
                  node.depth = depth;
                  this.evolutionChain?.push(node);

                  if(node.evolutions === undefined || node.evolutions.length === 0) {
                    node.rowspan = 1;
                    return 1;
                  }
                  const r = node.evolutions.map((v: EvolutionChainNode) => { return getRowSpanRecursive(v, depth + 1); }).reduce((v, a) => v + a);
                  node.rowspan = r;
                  return r;
                }

                this.evolutionGridRows = getRowSpanRecursive(res, 1);
                this.evolutionGridCols = maxDepth;
                // let level: EvolutionChainNode[] = [res];
                // let nextLevel: EvolutionChainNode[] = [];
                // let greatestNodesPerLevel = 0;

                // while(level.length > 0) {
                //   let nodeCount = 0;
                //   for(let node of level) {
                //     for(let child of node.evolutions || []) {
                //       nextLevel.push(child);
                //       nodeCount++;
                //     }
                //   }
                //   greatestNodesPerLevel = Math.max(nodeCount, greatestNodesPerLevel);
                //   level = nextLevel;
                //   nextLevel = [];
                // }


              }
            });
          });
        });

        // Abilities
        if(data.abilities) {
          from(data.abilities).pipe(
            concatMap((v: any) => {
              return this.pokemonService.retrieveData(v.ability.url, false).pipe(map((a: any) => {
                a.__hidden = v.is_hidden;
                return a;
              }));
            }))
          .subscribe((data: any) => {
            const abilityEntry = {
              name: this.pokemonService.findMostRecentEntryOfLanguage(data.names).name,
              hidden: data.__hidden,
              description: this.pokemonService.formatDescription(
                this.pokemonService.findMostRecentEntryOfLanguage(data.flavor_text_entries).flavor_text ||
                data.effect_entries.find((v: any) => v.language.name === this.pokemonService.language)?.short_effect)          
            };

            this.abilities.push(abilityEntry);
          })
        };
        
      });
    });
      
  }

  // TODO: dont have non-default forms on the pokedex. instead display them under the base form. 
  // get the ids of the different forms instead of species

  getRecursive(root: any): Observable<EvolutionChainNode> {//Observable<EvolutionChainNode> {
    // root = service.retrieveData(...)
    return of(root).pipe(
      map((data: any) => {
        return {
          parent: {
            name: data.species.name,
            evolutionDetails: data.evolution_details,
            sprite: undefined
          },
          sprite: this.pokemonService.retrieveData(data.species.url).pipe(map((data: any) => "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + data.id + ".png")),
          children: data.evolves_to
        };
      }),
      mergeMap((node: any) => {
        return forkJoin([
          of(node.parent),
          node.sprite,
          ...node.children.map((child: any) => this.getRecursive(child))
        ]);
      }),
      tap(([parent, ...args]: any) => {
        parent.sprite = args[0];
        parent.evolutions = args.slice(1);
      }),
      map(([parent]) => parent as EvolutionChainNode)
    );
  }

  getSpriteUrlFromPokemonUrl(url: string): string {
    const a = /\/(\d+)\//gm.exec(url);
    const id = a ? a[1] || '0' : '0';
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/" + id +".png";
  }

  onResize(event: Event) {
    let e = event.target as Window;
    this.screenWidth = e.innerWidth;
    // this.pokemonPerRow = (e.innerWidth <= this.smallScreenWidthBreakpoint) ? 2 : 3;
  }

  test(a: any) {return a;}

}
