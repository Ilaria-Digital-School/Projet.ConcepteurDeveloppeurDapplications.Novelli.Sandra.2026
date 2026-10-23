import { Component, inject, signal } from '@angular/core';
import { RecipeService } from '../../services/recipe-service';
import { Subject } from 'rxjs';
import { FilterService } from '../../services/filter-service';

@Component({
  selector: 'app-side-menu',
  imports: [],
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.css',
})
export class SideMenu {

  toggleButton!: string;
  listIsVisible = true;

  private recipeService = inject(RecipeService);

  private filterService = inject(FilterService);
  selectedCategory = this.filterService.selectedCategory;


  menu: any[] = [
    { id: 1, name: 'Italian' },
    { id: 2, name: 'French' },
    { id: 3, name: 'Meat' },
    { id: 4, name: 'Spicy' },
    { id: 5, name: 'Sweet & sour' },
    { id: 6, name: 'Sashimi and sushi' },
    { id: 7, name: 'Homemade hamburgers' },
    { id: 8, name: 'Cake' },
    { id: 9, name: 'Creamy dessert' },
  ]

  toggleSideMenu() {
    this.listIsVisible === true ? this.listIsVisible = false : this.listIsVisible = true;
  }


  pickYourGenre(name: string | null) {
    this.filterService.selectedCategory.set(name);
  }


}
