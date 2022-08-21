export interface EvolutionChainNode {
    name: string,
    sprite: string,
    evolutionDetails: any,
    evolutions?: EvolutionChainNode[],
    rowspan?: number // for display with mat-grid-list, see pokemon-detail.component
    depth?: number //   ^
}