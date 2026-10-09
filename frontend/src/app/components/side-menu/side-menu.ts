import { Component } from '@angular/core';

@Component({
  selector: 'app-side-menu',
  imports: [],
  templateUrl: './side-menu.html',
  styleUrl: './side-menu.css',
})
export class SideMenu {

  toggleButton!: string;
  listIsVisible = true;

  toggleSideMenu() {
    this.listIsVisible === true ? this.listIsVisible = false : this.listIsVisible = true;
  }

  menu: any[] = [
    {id: 1, name: 'SHOW ALL'},  
    {id: 2, name: 'Italian'},  
    {id: 3, name: 'French'},  
    {id: 4, name: 'Meat'},  
    {id: 5, name: 'Spicy'},  
    {id: 6, name: 'Sweet & sour'},  
    {id: 7, name: 'Sashimi and sushi'},  
    {id: 8, name: 'Homemade hamburgers'},  
    {id: 9, name: 'Cake'},  
    {id: 10, name: 'Creamy dessert'},  
  ]



  pickYourGenre() {

  }

}
