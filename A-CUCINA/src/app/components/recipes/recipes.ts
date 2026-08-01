import { Component } from '@angular/core';

@Component({
  selector: 'app-recipes',
  imports: [],
  templateUrl: './recipes.html',
  styleUrl: './recipes.css',
})
export class Recipes {

  // recipes: any[] = [];


  recipes: any[] = [
    { id: 1, name: 'Arrabiata pasta', imgSrc: '../assets/images/arrabiata_pasta.jpg', author: 'Sara Kelley', type: 'Italian' },
    { id: 2, name: 'Roastbeef & potatoes', imgSrc: '../assets/images/roastbeef_potatoes.jpg', author: 'John 0\'Connor', type: 'Meat' },
    { id: 3, name: 'Tuna sushi', imgSrc: 'assets/images/tuna_sushi.jpg', author: 'Debbie Birmingham', type: 'Sashimi and sushi' },
    { id: 4, name: 'Spring rolls', imgSrc: 'assets/images/spring_rolls.jpg', author: 'Damien Nguyen', type: 'Sweet & sour' },
    { id: 5, name: 'Four season pizza', imgSrc: 'assets/images/four_season_pizza.jpg', author: 'Giani Livrieri', type: 'Italian' },
    { id: 6, name: 'Tiramisù', imgSrc: 'assets/images/tiramisu.jpg', author: 'Anja Weisser', type: 'Cake' },
    { id: 7, name: 'Blue cheese hamburger', imgSrc: 'assets/images/blue_cheese_hamburger.jpg', author: 'Wendy Heyward', type: 'Homemade hamburgers' },
    { id: 8, name: 'Cheesecake', imgSrc: 'assets/images/cheesecake.jpg', author: 'Sandra Novelli-Riquer', type: 'Cake' },
    { id: 9, name: 'Bruschetta', imgSrc: 'assets/images/bruschetta.jpg', author: 'Sandra Novelli-Riquer', type: 'Italian' },
    { id: 10, name: 'Caprese salad', imgSrc: 'assets/images/caprese_salad.jpg', author: 'Gaetano Cremonese', type: 'Italian' },
    { id: 11, name: 'Mini hamburgers', imgSrc: 'assets/images/mini_hamburgers.jpg', author: 'Julien Ndiaye', type: 'Homemade hamburgers' },
    { id: 12, name: 'Chocolate cake', imgSrc: 'assets/images/chocolate_cake.jpg', author: 'Anja Weisser', type: 'Cake' },

  ];


}
