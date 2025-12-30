import { Injectable, signal, computed } from '@angular/core';

export interface Lesson {
  id: string;
  title: string;
  moduleId: string;
  type: 'flow' | 'loop' | 'array' | 'function' | 'softskills' | 'flow-elements';
  description: string;
  initialCode?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

@Injectable({
  providedIn: 'root'
})
export class CurriculumService {
  readonly modules: Module[] = [
    {
      id: 'm2',
      title: 'Módulo 2: Control de Flujo',
      lessons: [
        { id: 'l2-0', moduleId: 'm2', title: 'Elementos del Diagrama', type: 'flow-elements', description: 'Conoce las formas básicas: Inicio, Proceso y Decisión.' },
        { id: 'l2-1', moduleId: 'm2', title: 'Operadores & Comparación', type: 'flow', description: 'Entiende cómo las computadoras comparan valores.' },
        { id: 'l2-2', moduleId: 'm2', title: 'La Decisión (If/Else)', type: 'flow', description: 'Toma caminos diferentes según una condición.' },
        { id: 'l2-3', moduleId: 'm2', title: 'Ejercicio: Mayor de Edad', type: 'flow', description: 'Visualiza la lógica para verificar la edad.' }
      ]
    },
    {
      id: 'm3',
      title: 'Módulo 3: Bucles / Ciclos',
      lessons: [
        { id: 'l3-1', moduleId: 'm3', title: 'Bucle While', type: 'loop', description: 'El "guardia": Repite una acción solo si la condición es cierta.' },
        { id: 'l3-2', moduleId: 'm3', title: 'Bucle For', type: 'loop', description: 'El "director de orquesta": Repite un número exacto de veces.' },
        { id: 'l3-3', moduleId: 'm3', title: 'Bucle Infinito', type: 'loop', description: 'La "rueda de hámster": Aprende a evitar que tu código corra sin parar.' }
      ]
    },
    {
      id: 'm4',
      title: 'Módulo 4: Estructuras de Datos',
      lessons: [
        { id: 'l4-1', moduleId: 'm4', title: 'Arrays & Índices', type: 'array', description: 'Una colección ordenada de elementos.' },
        { id: 'l4-2', moduleId: 'm4', title: 'Operaciones (Push/Pop)', type: 'array', description: 'Modificando la lista dinámicamente.' }
      ]
    },
    {
      id: 'm5',
      title: 'Módulo 5: Funciones',
      lessons: [
        { id: 'l5-1', moduleId: 'm5', title: 'La Máquina de Funciones', type: 'function', description: 'Entrada, Proceso y Salida (Return).' }
      ]
    },
    {
      id: 'm6',
      title: 'Módulo 6: Soft Skills',
      lessons: [
        { id: 'l6-1', moduleId: 'm6', title: 'Debugging & Googling', type: 'softskills', description: 'Cómo solucionar problemas como un pro.' }
      ]
    }
  ];

  // State
  private activeLessonIdSignal = signal<string>('l2-0'); // Default to new lesson

  readonly activeLessonId = this.activeLessonIdSignal.asReadonly();
  
  readonly activeLesson = computed(() => {
    const id = this.activeLessonIdSignal();
    for (const mod of this.modules) {
      const lesson = mod.lessons.find(l => l.id === id);
      if (lesson) return lesson;
    }
    return this.modules[0].lessons[0];
  });

  selectLesson(lessonId: string) {
    this.activeLessonIdSignal.set(lessonId);
  }
}