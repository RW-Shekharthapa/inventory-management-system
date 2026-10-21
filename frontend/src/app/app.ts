import { Component, inject, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Item {
  id?: number;
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly title = signal('frontend');
  protected readonly items = signal<Item[]>([]);
  protected readonly error = signal('');
  protected draft: Item = { name: '', sku: '', quantity: 0, price: 0 };

  ngOnInit() { this.load(); }

  protected load() {
    this.http.get<Item[]>('/api/items').subscribe({
      next: items => { this.items.set(items); this.error.set(''); },
      error: () => this.error.set('Cannot reach the backend on :8080')
    });
  }

  protected add() {
    this.http.post<Item>('/api/items', this.draft).subscribe(() => {
      this.draft = { name: '', sku: '', quantity: 0, price: 0 };
      this.load();
    });
  }

  protected remove(id: number) {
    this.http.delete(`/api/items/${id}`).subscribe(() => this.load());
  }
}
