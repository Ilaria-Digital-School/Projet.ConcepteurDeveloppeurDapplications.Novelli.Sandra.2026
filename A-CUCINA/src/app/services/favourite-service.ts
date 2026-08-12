import { Injectable, signal } from '@angular/core';


@Injectable({
    providedIn: 'root',
})

export class FavouriteService {

    favouriteRecipes = signal<any[]>([]);


    addToFavourites(recipeObj: any) {

        this.favouriteRecipes.update(recipes => {
            const newFavouriteList = [
                ...recipes,
                recipeObj,
            ];

            console.log('Just clicked');
            console.log(newFavouriteList);
            return newFavouriteList;
        });
    }

    removeFromFavourites(id: string) {
        this.favouriteRecipes.update(recipes =>
            recipes.filter(recipe => recipe.id !== id)
        );
    }


}




