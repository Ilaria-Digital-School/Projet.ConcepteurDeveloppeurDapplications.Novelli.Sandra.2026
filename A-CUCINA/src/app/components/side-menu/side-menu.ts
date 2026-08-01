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
    // alert('Anyting you try to do using Angular is hard.');
    // if (this.listIsVisible === true) {
    //   this.listIsVisible = false;
    // }
    // else {this.listIsVisible = true;
    // }
    this.listIsVisible === true ? this.listIsVisible = false : this.listIsVisible = true;
  }

}
