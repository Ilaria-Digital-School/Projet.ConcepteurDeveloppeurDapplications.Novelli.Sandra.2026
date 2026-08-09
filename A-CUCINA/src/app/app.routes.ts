import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { LogIn } from './components/log-in/log-in';
import { SignUp } from './components/sign-up/sign-up';
import { Contact } from './components/contact/contact';
import { Favourites } from './components/favourites/favourites';
import { AddRecipe } from './components/add-recipe/add-recipe';


export const routes: Routes = [
    {path: '', component: Home},
    {path: 'favourites', component: Favourites},
    {path: 'add-recipe', component: AddRecipe},
    {path: 'contact', component: Contact},
    {path: 'log-in', component: LogIn},
    {path: 'sign-up', component: SignUp}, 

];
