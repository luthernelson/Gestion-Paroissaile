<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle, Trash2, RefreshCw, Info, CheckCircle2, X } from 'lucide-vue-next'

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success'

const props = withDefaults(defineProps<{
  modelValue: boolean
  variant?: ConfirmVariant
  title: string
  message?: string
  confirmLabel?: string
  confirmLoading?: boolean
  cancelLabel?: string
  hideCancel?: boolean
}>(), {
  variant:        'danger',
  confirmLabel:   'Confirmer',
  cancelLabel:    'Annuler',
  confirmLoading: false,
  hideCancel:     false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirm': []
  'cancel':  []
}>()

const CONFIG: Record<ConfirmVariant, {
  icon:       any
  iconBg:     string
  iconColor:  string
  btnClass:   string
}> = {
  danger: {
    icon:      Trash2,
    iconBg:    'bg-red-100 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    btnClass:  'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
  },
  warning: {
    icon:      AlertTriangle,
    iconBg:    'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    btnClass:  'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400 text-white',
  },
  info: {
    icon:      Info,
    iconBg:    'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    btnClass:  'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
  },
  success: {
    icon:      CheckCircle2,
    iconBg:    'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    btnClass:  'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
  },
}

const cfg = computed(() => CONFIG[props.variant])

function close() {
  emit('update:modelValue', false)
  emit('cancel')
}

function confirm() {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[9998] flex items-center justify-center p-4"
        style="background: rgba(0,0,0,0.45);"
        @mousedown.self="close"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="modelValue"
            class="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="'confirm-title'"
          >
            <!-- Bouton fermer -->
            <button
              class="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              @click="close"
              aria-label="Fermer"
            >
              <X class="w-4 h-4" />
            </button>

            <!-- Corps -->
            <div class="p-6">
              <div class="flex items-start gap-4">
                <!-- Icône -->
                <div
                  class="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                  :class="cfg.iconBg"
                >
                  <component :is="cfg.icon" class="w-5 h-5" :class="cfg.iconColor" />
                </div>

                <!-- Texte -->
                <div class="flex-1 min-w-0 pt-0.5">
                  <h3
                    id="confirm-title"
                    class="text-base font-bold text-gray-900 dark:text-white leading-snug"
                  >
                    {{ title }}
                  </h3>
                  <p
                    v-if="message"
                    class="mt-1.5 text-sm text-gray-500 dark:text-slate-400 leading-relaxed"
                  >
                    {{ message }}
                  </p>
                  <!-- Slot pour contenu personnalisé -->
                  <slot />
                </div>
              </div>
            </div>

            <!-- Footer actions -->
            <div class="px-6 pb-5 flex items-center justify-end gap-3">
              <button
                v-if="!hideCancel"
                type="button"
                class="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                @click="close"
              >
                {{ cancelLabel }}
              </button>

              <button
                type="button"
                class="px-4 py-2 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                :class="cfg.btnClass"
                :disabled="confirmLoading"
                @click="confirm"
              >
                <!-- Spinner loading -->
                <svg
                  v-if="confirmLoading"
                  class="w-4 h-4 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                {{ confirmLoading ? 'En cours...' : confirmLabel }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>