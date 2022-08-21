import { Component, Input, OnInit } from '@angular/core';
import { EvolutionChainNode } from 'src/models/evolutionchainnode';

@Component({
    selector: 'app-evolution-tree-level',
    templateUrl: './evolution-tree-level.component.html'
})
export class EvolutionTreeLevelComponent implements OnInit {
    @Input() node?: EvolutionChainNode;
    @Input() isOutermostNode: boolean = true;
    constructor() { };

    ngOnInit(): void {
        
    }
}