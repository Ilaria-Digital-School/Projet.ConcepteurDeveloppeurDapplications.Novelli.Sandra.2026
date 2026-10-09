import { Component, inject } from '@angular/core';
import { SideMenu } from '../side-menu/side-menu';
import { Banner } from '../banner/banner';
import { Recipes } from '../recipes/recipes';



@Component({
  selector: 'app-home',
  imports: [Banner, SideMenu, Recipes],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
