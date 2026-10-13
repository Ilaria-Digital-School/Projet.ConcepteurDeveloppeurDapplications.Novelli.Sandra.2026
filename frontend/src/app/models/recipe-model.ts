export interface Recipe {

  id: number;
  name: string;
  author: string;
  imgSrc: string;
  prepTime: number;
  cookTime?: number;
  servings: number;
  createdOn: string;
  ingredients?: any[];
  preparation?: any[]; 

}
