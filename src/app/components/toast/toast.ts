import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="visible" class="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1f2847] text-[#f3f5ff] px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-in fade-in duration-300">
      <span class="text-xl">{{ icon }}</span>
      <div>
        <div class="font-bold">{{ title }}</div>
        <div>{{ message }}</div>
      </div>
    </div>
  `,
  styles: [``]
})
export class ToastComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() icon: string = '🔔';
  visible: boolean = false;

  show(title: string, message: string, icon: string = '🔔') {
    this.title = title;
    this.message = message;
    this.icon = icon;
    this.visible = true;
    setTimeout(() => this.visible = false, 3500);
  }
}
