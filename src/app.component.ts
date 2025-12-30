import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurriculumService } from './services/curriculum.service';
import { VisualizerComponent } from './components/visualizer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, VisualizerComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  curriculum = inject(CurriculumService);
  
  // Expose signal values for template
  modules = this.curriculum.modules;
  activeLesson = this.curriculum.activeLesson;
  
  selectLesson(id: string) {
    this.curriculum.selectLesson(id);
  }
}