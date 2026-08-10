import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RecipeService } from '../../services/recipe-service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-recipe',
  imports: [ReactiveFormsModule],
  templateUrl: './add-recipe.html',
  styleUrl: './add-recipe.css',
})
export class AddRecipe {

  addRecipeForm!: FormGroup;
  private formBuilder = inject(FormBuilder);
  private recipeService = inject(RecipeService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  recipeID!: string;
  recipe: any = {};
  isOnEditMode = false;

  ngOnInit(): void {

    this.recipeID = this.activatedRoute.snapshot.paramMap.get('id') || '';

    this.addRecipeForm = this.formBuilder.group({
      recipeName: ['', [Validators.required, Validators.minLength(3)]],
      imgSrc: ['', [Validators.required]],
      author: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', [Validators.required]],
      ingredients: ['', [Validators.required]],
      instructions: ['', [Validators.required]],
    })

    if (this.recipeID) {
      this.isOnEditMode = true;

      this.recipeService.getRecipeById(this.recipeID).subscribe({
        next: (res: any) => {
          this.recipe = res;
        },
        error: (err) => {
          console.log(err);
        }
      })
    }

  }


  addOrEditRecipe() {

    if (this.isOnEditMode) {

    const formValue = this.addRecipeForm.value;

    const recipeFinal = {
      recipeName: formValue.recipeName,
      imgSrc: formValue.imgSrc,
      author: formValue.author,
      type: formValue.type,
      ingredients: formValue.ingredients,
      instructions: formValue.instructions,
    }

    this.recipeService.addRecipe(recipeFinal).subscribe({
      next: (res: any) => {
        alert('Recipe added successfullly');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.log(err);
        alert('Failed to add recipe');
      }
    })
  }
  }
}
