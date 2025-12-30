import { Component, ElementRef, ViewChild, effect, input, OnDestroy, AfterViewInit, signal } from '@angular/core';
import { Lesson } from '../services/curriculum.service';

// Declare SVG.js global
declare const SVG: any;

@Component({
  selector: 'app-visualizer',
  standalone: true,
  template: `
    <div class="relative w-full h-full bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
      <div #canvasContainer class="w-full h-full"></div>
      
      <!-- Controls Overlay -->
      <div class="absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur p-4 rounded-lg border border-slate-600 flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <h3 class="text-white font-semibold">{{ lesson().title }}</h3>
          <div class="flex gap-2">
            <button (click)="resetAnimation()" class="px-3 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded text-sm transition-colors">Reset</button>
            <button (click)="playAnimation()" class="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-medium transition-colors">
              {{ isPlaying() ? 'Restart' : 'Play Simulation' }}
            </button>
          </div>
        </div>
        
        <!-- Interactive Controls based on Type -->
         @if (lesson().type === 'flow') {
            <div class="flex items-center gap-4 text-sm text-slate-300">
               <span>Input Value (Age): </span>
               <input type="range" min="0" max="100" [value]="inputValue()" (input)="updateInput($event)" class="accent-indigo-500 w-32">
               <span class="font-mono text-indigo-400 text-lg">{{ inputValue() }}</span>
            </div>
         }
         
         @if (lesson().type === 'loop') {
            <div class="flex items-center gap-4 text-sm text-slate-300">
               <span>Iterations: </span>
               <span class="font-mono text-indigo-400">{{ loopCount().toLocaleString() }}</span>
            </div>
         }

         @if (lesson().type === 'array') {
            <div class="flex gap-2">
               <button (click)="arrayPush()" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded">Push()</button>
               <button (click)="arrayPop()" class="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded">Pop()</button>
            </div>
         }
      </div>
    </div>
  `
})
export class VisualizerComponent implements AfterViewInit, OnDestroy {
  lesson = input.required<Lesson>();
  @ViewChild('canvasContainer') container!: ElementRef;
  
  private draw: any;
  private isDestroyed = false;
  
  inputValue = signal(15);
  loopCount = signal(0);
  isPlaying = signal(false);
  
  // Array State
  arrayData = signal<number[]>([10, 20, 30]);

  constructor() {
    effect(() => {
      // Re-draw whenever the lesson changes
      const l = this.lesson();
      // Use zero timeout to defer to next tick, ensuring DOM is ready if view switched
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.resetAnimation();
        }
      }, 0); 
    });
  }

  ngAfterViewInit() {
    // Initial draw
    if (!this.draw) {
        this.drawScene(this.lesson());
    }
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    if (this.draw) {
        this.draw.remove();
        this.draw = null;
    }
  }

  updateInput(e: any) {
    this.inputValue.set(parseInt(e.target.value));
    if (!this.isPlaying()) {
        this.drawScene(this.lesson());
    }
  }

  resetAnimation() {
    this.isPlaying.set(false);
    this.loopCount.set(0);
    if (this.draw) {
        this.draw.clear();
        this.drawScene(this.lesson());
    }
  }

  playAnimation() {
    // If already playing, this acts as a "restart"
    if (this.isPlaying()) {
        this.resetAnimation();
    }
    
    // Set playing state and run the sequence
    this.isPlaying.set(true);
    this.runAnimationSequence(this.lesson());
  }

  // --- CORE DRAWING LOGIC ---

  private initCanvas() {
    if (this.isDestroyed || !this.container) return null;
    
    if (typeof SVG === 'undefined') {
        console.error('SVG.js not loaded');
        return null;
    }

    if (!this.draw) {
        this.draw = SVG().addTo(this.container.nativeElement).size('100%', '100%');
    }
    return this.draw;
  }

  private drawScene(lesson: Lesson) {
    const draw = this.initCanvas();
    if (!draw) return;
    
    draw.clear();

    const pattern = draw.pattern(20, 20, (add: any) => {
      add.circle(2).fill('#1e293b');
    });
    draw.rect('100%', '100%').fill(pattern);

    switch (lesson.type) {
      case 'flow-elements': this.drawFlowElements(draw); break;
      case 'flow': this.drawFlowChart(draw, lesson); break;
      case 'loop': this.drawLoop(draw, lesson); break;
      case 'array': this.drawArray(draw); break;
      case 'function': this.drawFunction(draw); break;
      case 'softskills': this.drawSoftSkills(draw); break;
    }
  }

  private runAnimationSequence(lesson: Lesson) {
    if (!this.draw || this.isDestroyed) return;
    
    this.drawScene(lesson); 
    
    setTimeout(() => {
       if (this.isDestroyed || !this.draw || !this.isPlaying()) return;

       switch (lesson.type) {
        case 'flow-elements': this.animateFlowElements(); break;
        case 'flow': this.animateFlow(); break;
        case 'loop': this.animateLoop(); break;
        case 'function': this.animateFunction(); break;
        case 'softskills': this.animateSoftSkills(); break;
      }
    }, 100);
  }

  // --- SCENE: FLOW ELEMENTS (Intro) ---
  private drawFlowElements(draw: any) {}

  private animateFlowElements() {
    if (!this.draw) return;
    const draw = this.draw;
    
    const elementsToShow = [
        { type: 'oval', color: '#3b82f6', label: 'INICIO / FIN', desc: 'Marca el comienzo o final.' },
        { type: 'rect', color: '#6366f1', label: 'PROCESO', desc: 'Una acción o cálculo.' },
        { type: 'diamond', color: '#8b5cf6', label: 'DECISIÓN', desc: 'Pregunta (Sí/No).' },
        { type: 'arrow', color: '#10b981', label: '', desc: 'Indica la dirección del flujo.' }
    ];

    let currentIndex = 0;
    const animationDuration = 600;
    const displayTime = 1800;

    const showNextElement = () => {
        if (this.isDestroyed || !this.draw || currentIndex >= elementsToShow.length || !this.isPlaying()) {
            this.isPlaying.set(false);
            if(this.draw) this.drawScene(this.lesson());
            return;
        }

        const elementData = elementsToShow[currentIndex];
        const canvasWidth = this.container.nativeElement.clientWidth;
        const canvasHeight = this.container.nativeElement.clientHeight;
        const group = draw.group().opacity(0);
        let height = 60;
        const width = 120;

        if (elementData.type === 'oval') group.rect(width, height).radius(30).fill(elementData.color).stroke({ width: 2, color: '#fff' });
        else if (elementData.type === 'rect') group.rect(width, height).radius(4).fill(elementData.color).stroke({ width: 2, color: '#fff' });
        else if (elementData.type === 'diamond') {
            height = 80;
            group.polygon(`60,0 ${width},40 60,80 0,40`).fill(elementData.color).stroke({ width: 2, color: '#fff' });
        } else if (elementData.type === 'arrow') {
            height = 60; 
            group.line(0, height / 2, width, height / 2).stroke({ width: 4, color: elementData.color }).marker('end', 10, 10, (add: any) => add.fill(elementData.color));
        }

        if(elementData.label) {
          const labelText = group.text(elementData.label).font({ size: 14, anchor: 'middle', fill: '#fff', weight: 'bold', family: 'sans-serif' });
          labelText.center(width / 2, height / 2);
        }

        const descText = group.text(elementData.desc).font({ size: 12, anchor: 'middle', fill: '#94a3b8', family: 'sans-serif' });
        descText.center(width / 2, height + 25);
        group.center(canvasWidth / 2, canvasHeight / 2);

        group.animate(animationDuration).ease('>').opacity(1).after(() => {
            setTimeout(() => {
                if (this.isDestroyed || !this.draw) return;
                group.animate(animationDuration).ease('<').opacity(0).after(() => {
                    group.remove();
                    currentIndex++;
                    showNextElement();
                });
            }, displayTime);
        });
    };
    showNextElement();
  }

  // --- SCENE: FLOW (IF/ELSE) ---
  private drawFlowChart(draw: any, lesson: Lesson) {
    const age = this.inputValue();
    const isAdult = age >= 18;

    const startX = 50, startY = 150;
    draw.rect(100, 50).radius(10).fill('#3b82f6').move(startX, startY).stroke({ width: 2, color: '#60a5fa' });
    draw.text('Start\nAge = ' + age).font({ family: 'monospace', size: 12, anchor: 'middle', fill: '#fff' }).center(startX + 50, startY + 25);
    draw.polygon('250,150 300,125 350,150 300,175').fill('#8b5cf6').stroke({ width: 2, color: '#a78bfa' });
    draw.text('Age >= 18?').font({ family: 'monospace', size: 10, anchor: 'middle', fill: '#fff' }).center(300, 150);
    draw.line(150, 175, 250, 150).stroke({ width: 2, color: '#475569' }).marker('end', 10, 10);
    
    const trueY = 50;
    draw.path(`M300 125 L300 ${trueY} L450 ${trueY}`).fill('none').stroke({ width: 2, color: isAdult ? '#22c55e' : '#334155', dasharray: isAdult ? null : '5,5' }).marker('end', 10, 10);
    draw.text('TRUE').move(310, 80).font({ fill: '#22c55e', size: 10 });
    draw.rect(120, 60).radius(8).fill(isAdult ? '#15803d' : '#1e293b').move(450, trueY - 30).stroke({ color: '#22c55e', width: 2 });
    draw.text('Access\nGRANTED').font({ anchor: 'middle', fill: '#fff', size: 12 }).center(510, trueY);

    const falseY = 250;
    draw.path(`M300 175 L300 ${falseY} L450 ${falseY}`).fill('none').stroke({ width: 2, color: !isAdult ? '#ef4444' : '#334155', dasharray: !isAdult ? null : '5,5' }).marker('end', 10, 10);
    draw.text('FALSE').move(310, 200).font({ fill: '#ef4444', size: 10 });
    draw.rect(120, 60).radius(8).fill(!isAdult ? '#991b1b' : '#1e293b').move(450, falseY - 30).stroke({ color: '#ef4444', width: 2 });
    draw.text('Access\nDENIED').font({ anchor: 'middle', fill: '#fff', size: 12 }).center(510, falseY);
  }

  private animateFlow() {
    if (!this.draw) return;
    const isAdult = this.inputValue() >= 18;
    const ball = this.draw.circle(20).fill('#fbbf24').center(100, 175);
    ball.animate(1000).center(300, 150).after(() => {
        const targetY = isAdult ? 50 : 250;
        ball.animate(1000).center(300, targetY).after(() => {
            ball.animate(1000).center(510, targetY).after(() => {
                ball.animate(200).attr({ r: 30, opacity: 0 }).after(() => { ball.remove(); this.isPlaying.set(false); });
            });
        });
    });
  }

  // --- SCENE: LOOP ---
  private drawLoop(draw: any, lesson: Lesson) {
      switch(lesson.id) {
        case 'l3-2': this.drawForLoop(draw); break;
        case 'l3-3': this.drawInfiniteLoop(draw); break;
        case 'l3-1': default: this.drawWhileLoop(draw); break;
      }
  }

  private drawForLoop(draw: any) {
    const codeGroup = draw.group().move(50, 60);
    codeGroup.rect(300, 180).fill('#1e293b').stroke({ width: 2, color: '#6366f1' }).radius(8).attr('id', 'code-block-bg');
    const fontStyles = { family: 'JetBrains Mono', size: 16, fill: '#94a3b8' };
    codeGroup.text('for (let i = 0; i < 5; i++) {').font(fontStyles).move(20, 25);
    codeGroup.text((add: any) => {
        add.tspan('  let counter = ').fill('#94a3b8');
        add.tspan(this.loopCount().toString()).fill('#f472b6').font({ weight: 'bold' });
        add.tspan(';').fill('#94a3b8');
    }).font(fontStyles).move(20, 65).attr('id', 'loop-counter-text');
    codeGroup.text('  // ...do something').font(fontStyles).move(20, 100);
    codeGroup.text('}').font(fontStyles).move(20, 135);
    draw.circle(200).fill('none').stroke({ width: 4, color: '#475569' }).center(500, 150);
    draw.text('ITERATION').font({ size: 20, fill: '#475569', anchor: 'middle' }).center(500, 150);
  }
  
  private drawWhileLoop(draw: any) {
    const w = this.container.nativeElement.clientWidth || 640;
    const h = this.container.nativeElement.clientHeight || 400;

    // Layout
    const stationWidth = 160;
    const stationHeight = 80;
    const qualityCheckX = w * 0.5, qualityCheckY = h * 0.25;
    const processingX = w * 0.8, processingY = h * 0.5;
    const tallyX = w * 0.2, tallyY = h * 0.5;
    const conveyorStartY = h * 0.8;

    // Conveyor Belt Path
    draw.path(`M 0,${conveyorStartY} L ${w},${conveyorStartY}`).stroke({ width: 10, color: '#334155' });
    draw.path(`M ${tallyX},${tallyY+stationHeight/2} C ${tallyX},${conveyorStartY+20} ${processingX},${conveyorStartY+20} ${processingX},${tallyY+stationHeight/2}`).fill('none').stroke({ width: 3, color: '#475569', dasharray: '8 8'});
    
    // Quality Check Station
    const qcGroup = draw.group().attr('id', 'qc-station');
    qcGroup.rect(stationWidth, stationHeight).fill('#1e293b').stroke({ width: 2, color: '#3b82f6' }).radius(8).center(qualityCheckX, qualityCheckY);
    qcGroup.text('while (run < 5)').font({ family: 'JetBrains Mono', size: 14, anchor: 'middle', fill: '#94a3b8' }).center(qualityCheckX, qualityCheckY - 10);
    qcGroup.circle(15).fill('#475569').stroke('#94a3b8').center(qualityCheckX, qualityCheckY + 20).attr('id', 'qc-light');
    
    // Processing Station
    const procGroup = draw.group();
    procGroup.rect(stationWidth, stationHeight).fill('#1e293b').stroke({ width: 2, color: '#6366f1' }).radius(8).center(processingX, processingY);
    procGroup.text('// do something\nrun++').font({ family: 'JetBrains Mono', size: 12, fill: '#94a3b8', anchor: 'middle' }).center(processingX, processingY);
    
    // Tally Station
    const tallyGroup = draw.group();
    tallyGroup.rect(stationWidth, stationHeight).fill('#1e293b').stroke({ width: 2, color: '#eab308' }).radius(8).center(tallyX, tallyY).attr('id', 'tally-block');
    tallyGroup.text('Variable State').font({ fill: '#94a3b8', size: 12, anchor: 'middle'}).center(tallyX, tallyY-15);
    tallyGroup.text('run = ' + this.loopCount()).font({ fill: '#eab308', size: 20, weight: 'bold', family: 'JetBrains Mono', anchor: 'middle' }).center(tallyX, tallyY+10).attr('id', 'loop-counter-text');

    // Finished Bin
    const binY = conveyorStartY + 15;
    draw.rect(100, 40).fill('#44403c').stroke('#a8a29e').move(qualityCheckX - 50, binY);
    draw.text('Finished').font({anchor: 'middle', fill: '#a8a29e'}).center(qualityCheckX, binY + 20);
  }

  private drawInfiniteLoop(draw: any) {
    const w = this.container.nativeElement.clientWidth || 640;
    const h = this.container.nativeElement.clientHeight || 400;
    const centerX = w / 2;
    const centerY = h / 2;

    // Create a group for the swirling vortex lines
    const vortexGroup = draw.group().attr('id', 'vortex-group');
    for (let i = 0; i < 50; i++) {
        const startRadius = Math.random() * 50 + 20;
        const endRadius = Math.random() * (w / 2.5) + (w / 4);
        const angle = Math.random() * 360;
        const width = Math.random() * 2 + 1;
        const color = `hsl(290, 100%, ${Math.random() * 30 + 50}%)`; // Shades of magenta/purple
        
        vortexGroup.path(`M ${centerX + Math.cos(angle) * startRadius},${centerY + Math.sin(angle) * startRadius} Q ${centerX + Math.cos(angle + 2) * (endRadius * 0.5)},${centerY + Math.sin(angle + 2) * (endRadius * 0.5)} ${centerX + Math.cos(angle) * endRadius},${centerY + Math.sin(angle) * endRadius}`)
            .fill('none').stroke({ width, color, linecap: 'round' }).opacity(0);
    }
    
    // The central code block
    const group = draw.group().center(centerX, centerY);
    const codeGroup = group.group().attr('id', 'code-block-bg');
    codeGroup.rect(320, 130).fill('#111827').stroke({ width: 3, color: '#f43f5e' }).radius(8);
    
    const fontStyles = { family: 'JetBrains Mono', size: 16, fill: '#fda4af' };
    codeGroup.text('while (true) {').font(fontStyles).move(20, 20);
    codeGroup.text((add: any) => {
        add.tspan('  // System critical...').fill('#fda4af');
        add.tspan('\n  Iteración: ').fill('#fda4af');
        add.tspan(this.loopCount().toLocaleString()).fill('#fecaca').font({ weight: 'bold' }).attr('id', 'counter-span');
    }).font(fontStyles).move(20, 55).attr('id', 'loop-counter-text');
    codeGroup.text('}').font(fontStyles).move(20, 95);

    group.text('BUCLE INFINITO').font({size: 14, fill: '#f43f5e', anchor: 'middle', weight: 'bold', family: 'sans-serif', 'letter-spacing': '0.1em'}).center(0, 100).attr('id', 'warning-text');
  }

  private animateLoop() {
    if (!this.draw) return;
    const lessonId = this.lesson().id;
    switch(lessonId) {
      case 'l3-2': this.animateForLoop(); break;
      case 'l3-3': this.animateInfiniteLoop(); break;
      case 'l3-1': default: this.animateWhileLoop(); break;
    }
  }

  private animateForLoop() {
    const runner = this.draw.circle(30).fill('#818cf8').center(500, 50); 
    const codeBlock = this.draw.find('#code-block-bg');
    const counterText = this.draw.find('#loop-counter-text');
    const totalLoops = 5;
    let currentLoop = 0;

    const runLap = () => {
        if (!this.isPlaying() || currentLoop >= totalLoops) {
            if (runner) runner.fill('#22c55e');
            if (codeBlock) codeBlock.stroke({ color: '#22c55e' });
            this.isPlaying.set(false);
            return;
        }
        
        runner.animate(1000).during((pos: number) => {
            const angle = -Math.PI/2 + (pos * Math.PI * 2);
            runner.center(500 + 100 * Math.cos(angle), 150 + 100 * Math.sin(angle));
        }).after(() => {
            currentLoop++;
            this.loopCount.set(currentLoop);
            if(counterText) {
                counterText.clear().text((add: any) => {
                    add.tspan('  let counter = ').fill('#94a3b8');
                    add.tspan(this.loopCount().toString()).fill('#f472b6').font({ weight: 'bold' });
                    add.tspan(';').fill('#94a3b8');
                });
            }
            if (codeBlock) codeBlock.animate(100).stroke({ color: '#e2e8f0', width: 3 }).after(() => codeBlock.animate(400).stroke({ color: '#6366f1', width: 2 }));
            runLap();
        });
    };
    runLap();
  }

  private animateWhileLoop() {
    const w = this.container.nativeElement.clientWidth || 640;
    const h = this.container.nativeElement.clientHeight || 400;
    const totalLoops = 5;
    this.loopCount.set(0);

    const layout = {
        stationHeight: 80,
        qualityCheckX: w * 0.5, qualityCheckY: h * 0.25,
        processingX: w * 0.8, processingY: h * 0.5,
        tallyX: w * 0.2, tallyY: h * 0.5,
        conveyorStartY: h * 0.8
    };

    const qcLight = this.draw.find('#qc-light');
    const tallyBlock = this.draw.find('#tally-block');
    const counterText = this.draw.find('#loop-counter-text');
    
    const packet = this.draw.rect(40, 40).radius(5).fill('#fbbf24').stroke('#f59e0b').center(layout.tallyX, layout.conveyorStartY);
    
    const runCheck = async () => {
        if (!this.isPlaying()) { packet.remove(); return; }

        if (this.loopCount() < totalLoops) {
            await new Promise(resolve => packet.animate(1000).center(layout.qualityCheckX, layout.conveyorStartY).after(resolve));
            if (!this.isPlaying()) { packet.remove(); return; }
            await new Promise(resolve => packet.animate(400).center(layout.qualityCheckX, layout.qualityCheckY).after(resolve));
            
            if (qcLight) qcLight.animate(200).fill('#22c55e');

            await new Promise(res => setTimeout(res, 300));
            if (!this.isPlaying()) { packet.remove(); return; }
            if (qcLight) qcLight.animate(200).fill('#475569');
            await new Promise(resolve => packet.animate(800).center(layout.processingX, layout.processingY).after(resolve));
            
            // Process...
            await new Promise(res => setTimeout(res, 300));
            if (!this.isPlaying()) { packet.remove(); return; }
            await new Promise(resolve => packet.animate(800).center(layout.tallyX, layout.tallyY).after(resolve));

            // Tally...
            this.loopCount.update(c => c+1);
            if (tallyBlock) tallyBlock.animate(100).fill('#334155').after(() => tallyBlock.animate(200).fill('#1e293b'));
            if (counterText) counterText.clear().text('run = ' + this.loopCount());

            await new Promise(res => setTimeout(res, 300));
            if (!this.isPlaying()) { packet.remove(); return; }
            await new Promise(resolve => packet.animate(400).center(layout.tallyX, layout.conveyorStartY).after(resolve));
            runCheck();

        } else {
            await new Promise(resolve => packet.animate(1000).center(layout.qualityCheckX, layout.conveyorStartY).after(resolve));
            if (!this.isPlaying()) { packet.remove(); return; }
            await new Promise(resolve => packet.animate(400).center(layout.qualityCheckX, layout.qualityCheckY).after(resolve));

            if(qcLight) qcLight.animate(200).fill('#ef4444');
            const arm = this.draw.line(layout.qualityCheckX, layout.qualityCheckY, layout.qualityCheckX, layout.conveyorStartY).stroke({width: 8, color: '#64748b', linecap: 'round'});
            await new Promise(resolve => arm.animate(300).plot(layout.qualityCheckX, layout.qualityCheckY, layout.qualityCheckX, layout.conveyorStartY + 25).after(resolve));
            packet.front();
            await new Promise(resolve => packet.animate(200).move(layout.qualityCheckX + 20, layout.conveyorStartY + 15).rotate(45).after(resolve));
            arm.remove();
            this.isPlaying.set(false);
        }
    }
    runCheck();
  }

  private animateInfiniteLoop() {
    const codeBlock = this.draw.find('#code-block-bg');
    const counterSpan = this.draw.find('#counter-span');
    const warningText = this.draw.find('#warning-text');
    const vortexGroup = this.draw.find('#vortex-group');

    if (!vortexGroup) return;

    // Animate in the vortex lines
    vortexGroup.children().forEach((child: any, i: number) => {
        child.animate({ duration: 1000 + Math.random() * 1000, delay: i * 20, ease: '>' }).opacity(0.6);
    });

    let increment = 1;
    let rotation = 0;
    
    const runLoop = () => {
        if (!this.isPlaying()) return;

        // Vortex Rotation
        rotation -= 0.2;
        vortexGroup.transform({ rotate: rotation });

        // Code Block Glitch
        if (codeBlock) {
            const rx = (Math.random() - 0.5) * 5;
            const ry = (Math.random() - 0.5) * 5;
            const scale = 1 + (Math.random() - 0.5) * 0.02;
            codeBlock.transform({ translateX: rx, translateY: ry, scale: scale });
        }

        // Warning Text Pulse
        if (warningText) {
            const pulse = 1 + Math.sin(Date.now() / 200) * 0.05;
            warningText.transform({ scale: pulse });
        }
        
        // Rapid Accelerating Counter
        this.loopCount.update(c => c + Math.floor(increment));
        increment *= 1.02; // Exponential growth
        if (increment > 100000) increment = 100000; // Cap the increment

        if (counterSpan) {
            counterSpan.text(this.loopCount().toLocaleString());
        }

        requestAnimationFrame(runLoop);
    };

    runLoop();
  }

  private drawArray(draw: any) {
      const data = this.arrayData();
      const startX = 50, startY = 150, boxSize = 60, gap = 10;
      data.forEach((val, i) => {
          const x = startX + i * (boxSize + gap);
          draw.rect(boxSize, boxSize).fill('#0f172a').stroke({ width: 2, color: '#f472b6' }).radius(8).move(x, startY);
          draw.text(val.toString()).font({ size: 18, fill: '#fff', family: 'monospace' }).center(x + boxSize/2, startY + boxSize/2);
          draw.text(`[${i}]`).font({ size: 12, fill: '#94a3b8', family: 'monospace' }).center(x + boxSize/2, startY + boxSize + 20);
      });
  }

  arrayPush() {
    this.arrayData.update(arr => [...arr, Math.floor(Math.random() * 100)]);
    this.drawScene(this.lesson()); 
  }

  arrayPop() {
    this.arrayData.update(arr => arr.slice(0, -1));
    this.drawScene(this.lesson());
  }

  private drawFunction(draw: any) {
    draw.rect(200, 150).fill('#334155').stroke({ width: 3, color: '#fbbf24' }).radius(10).center(300, 150);
    draw.text('FUNCTION\nmachine(x)').font({ size: 16, fill: '#fbbf24', family: 'monospace', anchor: 'middle' }).center(300, 150);
    draw.polygon('250,75 350,75 325,100 275,100').fill('#475569').stroke('#fbbf24');
    draw.rect(40, 30).fill('#475569').move(280, 225);
    draw.text('Input (Args)').font({ size: 12, fill: '#94a3b8' }).move(150, 50);
    draw.text('Return Value').font({ size: 12, fill: '#94a3b8' }).move(150, 250);
  }

  private animateFunction() {
    if (!this.draw) return;
    const input = this.draw.circle(30).fill('#ef4444').center(300, 40);
    input.animate(1000).center(300, 150).after(() => {
        input.opacity(0);
        setTimeout(() => {
             if (this.isDestroyed || !this.draw) return;
            const output = this.draw.rect(30, 30).fill('#22c55e').center(300, 225);
            output.animate(1000).center(300, 320).after(() => this.isPlaying.set(false));
        }, 800);
    });
  }

  private drawSoftSkills(draw: any) {
    draw.text('The "Buggy" Code').font({ size: 24, fill: '#fff', anchor: 'middle' }).center(300, 50);
    const messyPath = "M 100 150 C 150 250, 150 50, 200 150 S 250 250, 300 150 S 350 50, 400 150 S 450 250, 500 150";
    draw.path(messyPath).fill('none').stroke({ width: 5, color: '#ef4444', linecap: 'round' }).attr('id', 'code-line');
  }

  private animateSoftSkills() {
    if (!this.draw) return;
    const line = this.draw.find('#code-line');
    if (line) line.animate(2000).plot("M 100 150 L 500 150").stroke({ color: '#22c55e' }).after(() => this.isPlaying.set(false));
  }
}
