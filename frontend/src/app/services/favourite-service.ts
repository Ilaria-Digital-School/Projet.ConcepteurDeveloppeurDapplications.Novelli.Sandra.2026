import { Injectable, signal } from '@angular/core';


@Injectable({
    providedIn: 'root',
})

export class FavouriteService {

    favouriteRecipes = signal<any[]>([]);

    // addToFavourites(recipeObj: any) {

    //     this.favouriteRecipes.update(recipes => {
    //         const newFavouriteList = [
    //             ...recipes,
    //             recipeObj,
    //         ];

    //         alert('Added to favourites successfully');
    //         console.log(newFavouriteList);
    //         return newFavouriteList;
    //     });
    // }

    // removeFromFavourites(id: string) {
    //     this.favouriteRecipes.update(recipes =>
    //         recipes.filter(recipe => recipe.id !== id)
    //     );
    // }

    // BETA TESTING

    addToFavourites(recipeObj: any) {
        this.favouriteRecipes.update(recipes => [...recipes, recipeObj]);
    }

    removeFromFavourites(id: string) {
        this.favouriteRecipes.update(recipes =>
            recipes.filter(recipe => recipe.id !== id)
        );
    }

    isFavourite(id: string): boolean {
        return this.favouriteRecipes().some(recipe => recipe.id === id);
    }

    toggleFavourite(recipeObj: any) {
        if (this.isFavourite(recipeObj.id)) {
            this.removeFromFavourites(recipeObj.id);
        } else {
            this.addToFavourites(recipeObj);
        }
    }
    }









