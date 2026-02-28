<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { MapPin, Search, X, Loader2, Navigation, Check } from 'lucide-vue-next'

// ─── Types ────────────────────────────────────────────────────────────────
export interface LocationResult {
  label: string
  adresse: string
  ville: string
  pays: string
  lat: number
  lng: number
}

const props = withDefaults(defineProps<{
  modelValue?: LocationResult | null
  label?: string
  placeholder?: string
  required?: boolean
  error?: string
  hint?: string
}>(), {
  placeholder: 'Rechercher un lieu...',
  label: 'Localisation',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: LocationResult | null): void
}>()

// ─── Refs ─────────────────────────────────────────────────────────────────
const open          = ref(false)
const searchQuery   = ref('')
const searching     = ref(false)
const results       = ref<any[]>([])
const mapContainer  = ref<HTMLElement | null>(null)
const markerPos     = ref<[number, number] | null>(
  props.modelValue ? [props.modelValue.lat, props.modelValue.lng] : null
)
const tempLocation  = ref<LocationResult | null>(props.modelValue ?? null)
const searchTimeout = ref<ReturnType<typeof setTimeout> | null>(null)

// Leaflet instance (chargé dynamiquement)
let L: any = null
let map: any = null
let marker: any = null

// ─── Nominatim search ─────────────────────────────────────────────────────
async function searchPlaces(query: string) {
  if (!query.trim() || query.length < 3) { results.value = []; return }
  searching.value = true
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&accept-language=fr`
    const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } })
    results.value = await res.json()
  } catch { results.value = [] }
  finally { searching.value = false }
}

function onSearchInput() {
  if (searchTimeout.value) clearTimeout(searchTimeout.value)
  searchTimeout.value = setTimeout(() => searchPlaces(searchQuery.value), 400)
}

function buildLocation(item: any): LocationResult {
  const a = item.address ?? {}
  return {
    label:   item.display_name.split(',').slice(0, 3).join(', '),
    adresse: [a.road, a.house_number].filter(Boolean).join(' '),
    ville:   a.city ?? a.town ?? a.village ?? a.county ?? '',
    pays:    a.country ?? '',
    lat:     parseFloat(item.lat),
    lng:     parseFloat(item.lon),
  }
}

function selectResult(item: any) {
  const loc = buildLocation(item)
  tempLocation.value = loc
  markerPos.value = [loc.lat, loc.lng]
  results.value = []
  searchQuery.value = ''
  if (map) {
    map.setView([loc.lat, loc.lng], 15)
    placeMarker(loc.lat, loc.lng, loc.label)
  }
}

// ─── Géolocalisation ──────────────────────────────────────────────────────
function geolocate() {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude: lat, longitude: lng } = pos.coords
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`
    try {
      const res  = await fetch(url)
      const data = await res.json()
      const loc  = buildLocation({ ...data, lat, lon: lng })
      tempLocation.value = loc
      markerPos.value    = [lat, lng]
      if (map) {
        map.setView([lat, lng], 15)
        placeMarker(lat, lng, loc.label)
      }
    } catch {}
  })
}

// ─── Leaflet helpers ──────────────────────────────────────────────────────
function placeMarker(lat: number, lng: number, label: string) {
  if (!L || !map) return
  if (marker) marker.remove()
  marker = L.marker([lat, lng], {
    icon: L.divIcon({
      html: `<div class="custom-marker"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#1a5c2a"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg></div>`,
      className: '',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    })
  }).addTo(map)
  marker.bindPopup(`<b>${label}</b>`).openPopup()
}

async function initMap() {
  if (!mapContainer.value) return

  // Charger Leaflet dynamiquement
  if (!L) {
    await loadLeaflet()
  }

  const center: [number, number] = markerPos.value ?? [3.848, 11.502] // Yaoundé par défaut
  map = L.map(mapContainer.value, { zoomControl: true }).setView(center, markerPos.value ? 15 : 13)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map)

  if (markerPos.value && tempLocation.value) {
    placeMarker(markerPos.value[0], markerPos.value[1], tempLocation.value.label)
  }

  // Clic sur la carte → reverse geocode
  map.on('click', async (e: any) => {
    const { lat, lng } = e.latlng
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=fr`
      const res  = await fetch(url)
      const data = await res.json()
      const loc  = buildLocation({ ...data, lat, lon: lng })
      tempLocation.value = loc
      markerPos.value    = [lat, lng]
      placeMarker(lat, lng, loc.label)
    } catch {}
  })
}

function loadLeaflet(): Promise<void> {
  return new Promise((resolve, reject) => {
    // CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link')
      link.id   = 'leaflet-css'
      link.rel  = 'stylesheet'
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'
      document.head.appendChild(link)
    }
    // JS
    if ((window as any).L) { L = (window as any).L; resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
    script.onload = () => { L = (window as any).L; resolve() }
    script.onerror = reject
    document.head.appendChild(script)
  })
}

// ─── Open / close modal ───────────────────────────────────────────────────
async function openModal() {
  open.value = true
  await nextTick()
  setTimeout(initMap, 100)
}

function closeModal() {
  open.value = false
  results.value = []
  searchQuery.value = ''
  if (map) { map.remove(); map = null; marker = null }
}

function confirm() {
  emit('update:modelValue', tempLocation.value)
  closeModal()
}

function clear() {
  emit('update:modelValue', null)
  tempLocation.value = null
  markerPos.value = null
}

onUnmounted(() => { if (map) map.remove() })
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <!-- Label -->
    <label v-if="label" class="text-sm font-semibold text-gray-700 dark:text-slate-300">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <!-- Trigger -->
    <div
      class="relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all duration-150 group"
      :class="[
        modelValue
          ? 'border-green-300 bg-green-50/60 hover:border-green-400'
          : error
            ? 'border-red-400 bg-red-50'
            : 'border-gray-200 bg-gray-50 hover:border-green-400 hover:bg-white',
      ]"
      @click="openModal"
    >
      <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
           :class="modelValue ? 'bg-green-600' : 'bg-gray-200 group-hover:bg-green-100'">
        <MapPin class="w-4 h-4 transition-colors"
                :class="modelValue ? 'text-white' : 'text-gray-500 group-hover:text-green-700'" />
      </div>

      <div class="flex-1 min-w-0">
        <p v-if="modelValue" class="text-sm font-semibold text-gray-900 truncate">{{ modelValue.label }}</p>
        <p v-else class="text-sm text-gray-400">{{ placeholder }}</p>
        <p v-if="modelValue" class="text-xs text-gray-400 mt-0.5">
          {{ modelValue.lat.toFixed(5) }}, {{ modelValue.lng.toFixed(5) }}
        </p>
      </div>

      <div class="flex items-center gap-1.5 flex-shrink-0">
        <button
          v-if="modelValue"
          type="button"
          class="p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          @click.stop="clear"
        >
          <X class="w-3.5 h-3.5" />
        </button>
        <span class="text-xs font-medium px-2 py-1 rounded-lg"
              :class="modelValue ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
          {{ modelValue ? 'Modifier' : 'Choisir' }}
        </span>
      </div>
    </div>

    <!-- Erreur / hint -->
    <p v-if="error" class="text-xs text-red-500 flex items-center gap-1">{{ error }}</p>
    <p v-else-if="hint" class="text-xs text-gray-400">{{ hint }}</p>

    <!-- ══════════════════ MODAL ══════════════════ -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="open" class="fixed inset-0 z-[1000] flex items-center justify-center p-4"
             style="background: rgba(0,0,0,0.55); backdrop-filter: blur(4px)">

          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
          >
            <div v-if="open"
                 class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
                 style="max-height: 90vh">

              <!-- Header modal -->
              <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div class="flex items-center gap-3">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center"
                       style="background: linear-gradient(135deg, #1a5c2a, #2d8a48)">
                    <MapPin class="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p class="font-bold text-gray-900 text-sm">Sélectionner l'emplacement</p>
                    <p class="text-xs text-gray-400">Recherchez ou cliquez sur la carte</p>
                  </div>
                </div>
                <button type="button"
                        class="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
                        @click="closeModal">
                  <X class="w-4 h-4" />
                </button>
              </div>

              <!-- Barre de recherche -->
              <div class="px-5 py-3 border-b border-gray-50 space-y-2">
                <div class="relative flex items-center gap-2">
                  <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      v-model="searchQuery"
                      type="text"
                      placeholder="Rechercher une adresse, une ville..."
                      class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white transition-all placeholder-gray-300"
                      @input="onSearchInput"
                    />
                    <Loader2 v-if="searching" class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-600 animate-spin" />
                  </div>
                  <!-- Géolocaliser -->
                  <button
                    type="button"
                    title="Utiliser ma position"
                    class="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-all"
                    @click="geolocate"
                  >
                    <Navigation class="w-4 h-4" />
                  </button>
                </div>

                <!-- Résultats de recherche -->
                <div v-if="results.length" class="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                  <div
                    v-for="item in results" :key="item.place_id"
                    class="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-green-50 transition-colors border-b border-gray-50 last:border-0"
                    @click="selectResult(item)"
                  >
                    <MapPin class="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div class="min-w-0">
                      <p class="text-sm text-gray-800 font-medium truncate">
                        {{ item.display_name.split(',').slice(0, 2).join(', ') }}
                      </p>
                      <p class="text-xs text-gray-400 truncate">{{ item.display_name }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Carte Leaflet -->
              <div ref="mapContainer" class="flex-1 w-full" style="height: 380px; min-height: 300px" />

              <!-- Location sélectionnée -->
              <div class="px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                <div v-if="tempLocation" class="flex items-center gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-900 truncate">{{ tempLocation.label }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">
                      <span class="font-mono">{{ tempLocation.lat.toFixed(6) }}, {{ tempLocation.lng.toFixed(6) }}</span>
                      <span v-if="tempLocation.pays" class="ml-2">· {{ tempLocation.pays }}</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-px active:translate-y-0"
                    style="background: linear-gradient(135deg, #1a5c2a, #2d8a48); box-shadow: 0 4px 12px rgba(45,138,72,0.35)"
                    @click="confirm"
                  >
                    <Check class="w-4 h-4" />
                    Confirmer
                  </button>
                </div>
                <p v-else class="text-sm text-gray-400 text-center py-1">
                  Cliquez sur la carte ou recherchez un lieu pour le sélectionner
                </p>
              </div>

            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
:deep(.custom-marker) {
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.35));
}
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
</style>