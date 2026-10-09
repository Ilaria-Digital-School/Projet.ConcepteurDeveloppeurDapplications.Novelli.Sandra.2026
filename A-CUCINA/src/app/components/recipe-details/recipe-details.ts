import { Component, inject, signal } from '@angular/core';
import { RecipeService } from '../../services/recipe-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-recipe-details',
  imports: [],
  templateUrl: './recipe-details.html',
  styleUrl: './recipe-details.css',
})
export class RecipeDetails {

  

  recipe = signal<any>({});
  recipeID!: string;

  private activatedRoute = inject(ActivatedRoute);
  private recipeService = inject(RecipeService);

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      const id = params.get('id') || '';

      this.recipeService.getRecipeById(id).subscribe({
        next: (res: any) => {
          this.recipe.set(res)
        },
        error: (err) => {
          console.log(err);
          alert('Error loading recipe');
        }
      });
    });
  }


  // // THE OLD WAY, WITHOUT SIGNALS.

  // recipe: any = {};

  // ngOnInit() {
  //   this.recipeID = this.activatedRoute.snapshot.paramMap.get('id') || '';

  //   this.recipeService.getRecipeById(this.recipeID).subscribe({
  //     next: (res: any) => {
  //       this.recipe = res;
  //     },
  //     error: (err) => {
  //       console.log(err);
  //       alert('Error loading recipe');
  //     }
  //   });
  // }



}


