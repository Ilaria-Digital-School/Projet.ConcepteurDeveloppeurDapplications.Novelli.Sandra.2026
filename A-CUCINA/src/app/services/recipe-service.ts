import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AddRecipe } from '../components/add-recipe/add-recipe';

@Injectable({
    providedIn: 'root',
})

export class RecipeService {

    recipeURL: string = 'http://localhost:3000/recipes';

    private httpClient = inject(HttpClient);

    getAllRecipes() {
        return this.httpClient.get(this.recipeURL);
        // return this.httpClient.get<any[]>(this.recipeURL);
    }

    // Response - productObj || null
    getRecipeById(id: string) {
        return this.httpClient.get(`${this.recipeURL}/${id}`);
    }

    addRecipe(recipeObj: any) {
        return this.httpClient.post(this.recipeURL, recipeObj);
    }

    // Slash + recipeObj.id should only be used if you're using a fake json-server.
    updateRecipe(recipeObj: any) {
        return this.httpClient.put(`${this.recipeURL}/${recipeObj.id}$`, recipeObj);
    }

    deleteRecipeById(id: string) {
        return this.httpClient.delete(`${this.recipeURL}/${id}`);
    }

}
