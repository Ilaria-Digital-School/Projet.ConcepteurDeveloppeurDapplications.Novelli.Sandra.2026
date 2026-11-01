import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
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

  recipeId!: string;
  recipes: any[] = [];
  recipe: any = {};
  isOnEditMode = false;

  categoryOptions = [
    { value: 'italian', label: 'Italian' },
    { value: 'french', label: 'French' },
    { value: 'meat', label: 'Meat' },
    { value: 'spicy', label: 'Spicy' },
    { value: 'sweet & sour', label: 'Sweet & sour' },
    { value: 'sashimi & sushi', label: 'Sashimi & sushi' },
    { value: 'homemade hamburgers', label: 'Homemade hamburgers' },
    { value: 'creamy dessert', label: 'Creamy dessert' },
    { value: 'cake', label: 'Cake' },
    { value: 'other', label: 'Other' },
  ];

  createIngredient(): FormGroup {
    return this.formBuilder.group({
      ingredientName: [''],
      quantity: ['', [Validators.required, Validators.min(0.01)]],
      unit: ['']
    });
  }


  ngOnInit(): void {

    this.recipeId = this.activatedRoute.snapshot.paramMap.get('id') || '';

    this.addRecipeForm = this.formBuilder.group({
      recipeName: ['', [Validators.required, Validators.minLength(3)]],
      imgSrc: ['', [Validators.required]],
      author: ['', [Validators.required]],
      categories: this.formBuilder.array(
        [this.formBuilder.control('', [Validators.required])],
        { validators: Validators.required }
      ),
      prepTime: ['', [Validators.required]],
      cookTime: ['', [Validators.required]],
      servings: ['', [Validators.required]],
      ingredients: this.formBuilder.array([this.createIngredient()]),
      steps: this.formBuilder.array(
        [this.formBuilder.control('', [Validators.required])],
        { validators: Validators.required }
      ),
    });

    if (this.recipeId) {
      this.isOnEditMode = true;

      this.recipeService.getRecipeById(this.recipeId).subscribe({
        next: (res: any) => {
          this.recipe = res;
          this.fillFormWithRecipeData(res);
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  }

  // Getter methods for FormArrays (used in template)
  get categories() {
    return this.addRecipeForm.get('categories') as FormArray<FormControl<string | null>>;
  }

  get ingredients(): FormArray<FormGroup> {
    return this.addRecipeForm.get('ingredients') as FormArray<FormGroup>;
  }

  get steps() {
    return this.addRecipeForm.get('steps') as FormArray<FormControl<string | null>>;
  }

  // Add rows
  addRow(array: FormArray): void {
    array.push(this.formBuilder.control('', [Validators.required]));
  }

  // Special treatment for ingredients
  addIngredient(): void {
    this.ingredients.push(this.createIngredient());
  }

  // Remove rows
  removeRow(array: FormArray, index: number): void {
    if (array.length > 1) {
      array.removeAt(index);
    }
  }

  // Fill form when editing
  fillFormWithRecipeData(recipe: any): void {
    this.addRecipeForm.patchValue({
      recipeName: recipe.recipeName,
      imgSrc: recipe.imgSrc,
      author: recipe.author,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
    });

    // Clear and rebuild FormArrays with recipe data
    this.categories.clear();
    (recipe.categories || ['']).forEach((category: string) => {
      this.categories.push(this.formBuilder.control(category, [Validators.required]));
    });

    this.ingredients.clear();
    (recipe.ingredients || ['']).forEach((ingredient: any) => {
      this.ingredients.push(
        this.formBuilder.group({
          quantity: [ingredient.quantity,[Validators.required, Validators.min(0.01)]],
          unit: [ingredient.unit, Validators.required],
          ingredientName: [ingredient.ingredientName, Validators.required]
        })
      );
    });

    if (this.ingredients.length === 0) {
      this.ingredients.push(this.createIngredient());
    }

    this.steps.clear();
    (recipe.steps || ['']).forEach((step: string) => {
      this.steps.push(this.formBuilder.control(step, [Validators.required]));
    });
  }

  // Main submit handler
  addOrEditRecipe(): void {
    if (this.addRecipeForm.invalid) {
      alert('Please fill all required fields correctly');
      return;
    }

    const formValue = this.addRecipeForm.value;

    const recipeFinal: any = {
      recipeName: formValue.recipeName,
      imgSrc: formValue.imgSrc,
      author: formValue.author,
      categories: formValue.categories.filter((category: string) => category !== ''),
      prepTime: formValue.prepTime,
      cookTime: formValue.cookTime,
      servings: formValue.servings,
      ingredients: formValue.ingredients.filter((ingredient: string) => ingredient !== ''),
      steps: formValue.steps.filter((step: string) => step !== ''),
    };

    if (this.isOnEditMode) {
      recipeFinal.id = this.recipeId;
      this.recipeService.updateRecipe(recipeFinal).subscribe({
        next: (res: any) => {
          console.log(res);
          alert('Recipe updated successfully');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error(err);
          alert('Failed to update recipe');
        }
      });
    } else {
      this.recipeService.addRecipe(recipeFinal).subscribe({
        next: (res: any) => {
          console.log(res);
          alert('Recipe added successfully');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error(err);
          alert('Failed to add recipe');
        }
      });
    }
  }

}