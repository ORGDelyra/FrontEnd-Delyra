import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-b from-[#04060f] to-[#0b1020] flex items-center justify-center p-4">
      <div class="text-center max-w-2xl">
        <!-- Emojis animados -->
        <div class="mb-8 text-6xl animate-bounce">
          🚨⚠️
        </div>
        
        <!-- Título principal -->
        <h1 class="text-5xl md:text-6xl font-bold mb-4">
          <span class="bg-gradient-to-r from-[#b1122d] via-[#f8bfa8] to-[#b1122d] bg-clip-text text-transparent">
            Estamos en Mantenimiento
          </span>
        </h1>

        <!-- Subtítulo -->
        <p class="text-2xl md:text-3xl text-[#9aa2c7] mb-8 font-semibold">
          ⚠️ Vuelva pronto ⚠️
        </p>

        <!-- Mensaje descriptivo -->
        <div class="mb-12">
          <p class="text-lg text-[#9aa2c7] mb-4 leading-relaxed">
            Estamos realizando mejoras en nuestro sistema para brindarte una mejor experiencia.
          </p>
          <p class="text-[#9aa2c7] opacity-75">
            Por favor, intenta más tarde.
          </p>
        </div>

        <!-- Emojis de trabajadores animados -->
        <div class="flex justify-center gap-4 mb-12 text-5xl">
          <div class="animate-pulse">👨🏻‍🔧</div>
          <div class="animate-bounce delay-100">👷🏻‍♂️</div>
          <div class="animate-pulse delay-200">👨🏻‍🔧</div>
        </div>

        <!-- Información de contacto opcional -->
        <div class="bg-[#0f162d] border border-[#1f2847] rounded-xl p-6 mt-8">
          <p class="text-[#9aa2c7] text-sm">
            Si tienes preguntas, contáctanos en:
          </p>
          <p class="text-[#f8bfa8] font-semibold mt-2">
            Delyra - Tu servicio de entregas
          </p>
        </div>

        <!-- Decoración -->
        <div class="mt-12 flex justify-center gap-2">
          <div class="w-2 h-2 rounded-full bg-[#b1122d] animate-pulse"></div>
          <div class="w-2 h-2 rounded-full bg-[#f8bfa8] animate-pulse delay-100"></div>
          <div class="w-2 h-2 rounded-full bg-[#b1122d] animate-pulse delay-200"></div>
        </div>
      </div>
    </div>

    <style>
      @keyframes bounce {
        0%, 100% {
          transform: translateY(0);
        }
        50% {
          transform: translateY(-20px);
        }
      }

      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .animate-bounce {
        animation: bounce 1s infinite;
      }

      .animate-pulse {
        animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
      }

      .delay-100 {
        animation-delay: 100ms;
      }

      .delay-200 {
        animation-delay: 200ms;
      }
    </style>
  `,
  styles: []
})
export class MantenimientoComponent {}
