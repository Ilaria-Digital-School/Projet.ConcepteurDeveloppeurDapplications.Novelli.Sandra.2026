import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-table',
  imports: [FormsModule],
  templateUrl: './users-table.html',
  styleUrl: './users-table.css',
})
export class UsersTable {

  // Whether you're using local storage or JSON DB, you need to initialize this.
  users: any[] = [];

  // For special editing directly in the table.
  editId: number | null = null;

  private router = inject(Router);
  private userService = inject(UserService);

  ngOnInit() {
    // this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (res: any) => {
        this.users = res;
      },
      error: (err) => {
        console.log(err);
        alert('Erreur lors du chargementde la liste utilisateurs');
      }
    });
  }
  
  viewUserDetails(id: string) {
    this.router.navigate(['/user-details', id]);
  }

  goToEditUser(id: string) {
    this.router.navigate(['/edit-user', id]);
  }

  // Forget this one and implement goToEditUser() back in th HTML
  // if you don't like it.
  save(userObj: any) {
    this.userService.updateUser(userObj).subscribe({
      next: (res: any) => {
        alert('Informations utilisateur modifiées');
          this.editId = null;
      },
      error : (err) => {
          console.log(err);
      }
    })
  }


  deleteUserById(id: string) {

    // JSON DB.
    this.userService.deleteUserById(id).subscribe({
      next: (res: any) => {
        this.loadUsers();
        alert('Utilisateur supprimé');
      },
      error: (err) => {
        console.log(err);
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    })
  }

  applyUserStyle(admin: boolean) {
    if (admin) {
      return { color: 'blue', 'font-weight': 'bold' }
    }

    return { color: 'blueviolet' }
  }
}

