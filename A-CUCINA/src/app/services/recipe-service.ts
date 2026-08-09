import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

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

}
