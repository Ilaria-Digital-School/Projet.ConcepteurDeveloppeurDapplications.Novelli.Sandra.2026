import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Router } from 'express';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {}
