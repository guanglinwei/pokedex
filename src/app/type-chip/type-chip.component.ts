import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-type-chip',
  templateUrl: './type-chip.component.html',
  styleUrls: ['./type-chip.component.scss']
})
export class TypeChipComponent implements OnInit {
  @Input() types: any[] = [];
  typeNames: string[] = [];

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.typeNames = this.types?.map((type: any) => type.type.name);
  }

}
