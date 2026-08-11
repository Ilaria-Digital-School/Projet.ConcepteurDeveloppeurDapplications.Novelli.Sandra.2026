import { Component } from '@angular/core';
import { UsersTable } from "../users-table/users-table";


@Component({
  selector: 'app-admin',
  imports: [UsersTable],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {

}
