import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {Recipe} from '../models/recipe-model';

@Injectable({
    providedIn: 'root',
})

export class RecipeService {

    recipeURL: string = 'http://localhost:5000/recipes';

    private httpClient = inject(HttpClient);

    getAllRecipes() {
        return this.httpClient.get<Recipe[]>(this.recipeURL);
        // return this.httpClient.get(this.recipeURL);
        // return this.httpClient.get<any[]>(this.recipeURL);
    }

    // Response - productObj || null
    getRecipeById(id: string) {
        return this.httpClient.get<Recipe>(`${this.recipeURL}/${id}`);
        // return this.httpClient.get(`${this.recipeURL}/${id}`);
    }

    addRecipe(recipeObj: any) {
        return this.httpClient.post(this.recipeURL, recipeObj);
    }

    // Slash + recipeObj.id should only be used if you're using a fake json-server.
    updateRecipe(recipeObj: any) {
        return this.httpClient.put(`${this.recipeURL}/${recipeObj.id}`, recipeObj);
    }

    deleteRecipeById(id: string) {
        return this.httpClient.delete(`${this.recipeURL}/${id}`);
    }

}
