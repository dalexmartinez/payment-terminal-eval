<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import InputMask from 'primevue/inputmask'
import Button from 'primevue/button'
import Message from 'primevue/message'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Skeleton from 'primevue/skeleton'
import TerminalHeader from '../components/TerminalHeader.vue'
import api from '../services/api'
import { encryptField } from '../services/crypto'
import { useVentasStore } from '../stores/ventas'

const ventasStore = useVentasStore()

// ----- Venta -----
const nombre = ref('')
const importe = ref<number | null>(null)
const numeroTarjeta = ref('')
const fechaExpiracion = ref('')
const cvv = ref('')

const ventaLoading = ref(false)
const ventaError = ref('')
const ventaResultado = ref<null | {
  numeroAprobacion: string
  numeroReferencia: string
  tarjetaEnmascarada: string
}>(null)

function isExpiracionValida(value: string): boolean {
  const match = value.match(/^(\d{2})\/(\d{2})$/)
  if (!match) return false
  const month = Number(match[1])
  const year = 2000 + Number(match[2])
  if (month < 1 || month > 12) return false
  const expiry = new Date(year, month, 0, 23, 59, 59)
  return expiry.getTime() >= Date.now()
}

async function handleVenta() {
  ventaError.value = ''
  ventaResultado.value = null

  if (!nombre.value || !importe.value || !numeroTarjeta.value || !fechaExpiracion.value || !cvv.value) {
    ventaError.value = 'Completa todos los campos de la venta'
    return
  }
  if (numeroTarjeta.value.replace(/\D/g, '').length < 15) {
    ventaError.value = 'Número de tarjeta incompleto'
    return
  }
  if (!isExpiracionValida(fechaExpiracion.value)) {
    ventaError.value = 'Fecha de expiración inválida o vencida'
    return
  }
  if (cvv.value.length < 3) {
    ventaError.value = 'CVV inválido'
    return
  }

  ventaLoading.value = true
  try {
    const { data } = await api.post('/venta', {
      nombre: nombre.value,
      importe: importe.value,
      numeroTarjeta: encryptField(numeroTarjeta.value.replace(/\s/g, '')),
      fechaExpiracion: encryptField(fechaExpiracion.value),
      cvv: encryptField(cvv.value),
    })
    ventaResultado.value = data
    ventasStore.registrarVenta({
      numeroAprobacion: data.numeroAprobacion,
      numeroReferencia: data.numeroReferencia,
      tarjetaEnmascarada: data.tarjetaEnmascarada,
      importe: data.importe,
      nombre: data.nombre,
      fecha: data.fecha,
      estatus: 'Aprobada',
    })
    nombre.value = ''
    importe.value = null
    numeroTarjeta.value = ''
    fechaExpiracion.value = ''
    cvv.value = ''
  } catch (err: any) {
    ventaError.value = err.response?.data?.message ?? 'No se pudo procesar la venta'
  } finally {
    ventaLoading.value = false
  }
}

// ----- Consultas -----
interface Transaccion {
  numeroAprobacion: string
  numeroReferencia: string
  tarjetaEnmascarada: string
  importe: number
  nombre: string
  fecha: string
  estatus: string
}

const transacciones = ref<Transaccion[]>([])
const consultasLoading = ref(false)
const consultasLoaded = ref(false)
const ventasYaMezcladas = ref(0)

async function cargarConsultas() {
  const hayVentasNuevas = ventasStore.ventasLocales.length > ventasYaMezcladas.value
  if (consultasLoaded.value && !hayVentasNuevas) return

  consultasLoading.value = true
  try {
    const { data } = await api.get('/consultas')
    // Las ventas hechas en esta sesión (Pinia, en memoria) se anteponen al
    // mock que regresa el backend, ya que /api/consultas no tiene memoria
    // de las ventas recién hechas (cada función serverless es independiente).
    transacciones.value = [...ventasStore.ventasLocales, ...data.transacciones]
    ventasYaMezcladas.value = ventasStore.ventasLocales.length
    consultasLoaded.value = true
  } finally {
    consultasLoading.value = false
  }
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
}
function formatImporte(value: number) {
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}
</script>

<template>
  <div class="view-shell">
    <TerminalHeader title="Vista Operador · Ventas y Consultas" />

    <main class="content">
      <Tabs value="venta" @update:value="(v) => v === 'consultas' && cargarConsultas()">
        <TabList>
          <Tab value="venta">Venta</Tab>
          <Tab value="consultas">Consultas</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="venta">
            <div class="panel-grid">
              <form class="pt-panel form-card" @submit.prevent="handleVenta">
                <p class="pt-eyebrow">Nueva venta</p>

                <label class="field-label">Nombre del titular</label>
                <InputText v-model="nombre" placeholder="Nombre completo" :disabled="ventaLoading" />

                <label class="field-label">Importe</label>
                <InputNumber
                  v-model="importe"
                  mode="currency"
                  currency="MXN"
                  locale="es-MX"
                  :disabled="ventaLoading"
                  placeholder="$0.00"
                />

                <label class="field-label">Número de tarjeta</label>
                <InputMask
                  v-model="numeroTarjeta"
                  mask="9999 9999 9999 9999"
                  placeholder="•••• •••• •••• ••••"
                  class="pt-mono"
                  :disabled="ventaLoading"
                />

                <div class="field-row">
                  <div>
                    <label class="field-label">Expiración (MM/AA)</label>
                    <InputMask
                      v-model="fechaExpiracion"
                      mask="99/99"
                      placeholder="MM/AA"
                      class="pt-mono"
                      :disabled="ventaLoading"
                    />
                  </div>
                  <div>
                    <label class="field-label">CVV</label>
                    <InputMask
                      v-model="cvv"
                      mask="999"
                      placeholder="•••"
                      class="pt-mono"
                      :disabled="ventaLoading"
                    />
                  </div>
                </div>

                <Message v-if="ventaError" severity="error" :closable="false">{{ ventaError }}</Message>

                <Button type="submit" label="Procesar venta" :loading="ventaLoading" class="submit-btn" />

                <p class="encryption-note">
                  <i class="pi pi-lock" /> Tarjeta, expiración y CVV se cifran con AES antes de salir del navegador.
                </p>
              </form>

              <div class="pt-panel result-card">
                <p class="pt-eyebrow">Comprobante</p>
                <template v-if="ventaResultado">
                  <dl class="receipt">
                    <dt>Aprobación</dt>
                    <dd class="pt-mono accent">{{ ventaResultado.numeroAprobacion }}</dd>
                    <dt>Referencia</dt>
                    <dd class="pt-mono">{{ ventaResultado.numeroReferencia }}</dd>
                    <dt>Tarjeta</dt>
                    <dd class="pt-mono">{{ ventaResultado.tarjetaEnmascarada }}</dd>
                  </dl>
                </template>
                <p v-else class="empty-hint">El comprobante aparecerá aquí después de procesar una venta.</p>
              </div>
            </div>
          </TabPanel>

          <TabPanel value="consultas">
            <div class="pt-panel table-card">
              <p class="pt-eyebrow" style="padding: 20px 20px 0">Transacciones aprobadas</p>
              <template v-if="consultasLoading">
                <div style="padding: 20px">
                  <Skeleton v-for="i in 5" :key="i" height="2.5rem" style="margin-bottom: 8px" />
                </div>
              </template>
              <div v-else class="table-scroll">
                <DataTable
                  :value="transacciones"
                  paginator
                  :rows="8"
                  stripedRows
                  class="pt-table"
                >
                  <Column field="nombre" header="Nombre" />
                  <Column field="importe" header="Importe">
                    <template #body="{ data }">{{ formatImporte(data.importe) }}</template>
                  </Column>
                  <Column field="numeroAprobacion" header="Aprobación" class="pt-mono" />
                  <Column field="numeroReferencia" header="Referencia" class="pt-mono" />
                  <Column field="tarjetaEnmascarada" header="Tarjeta" class="pt-mono" />
                  <Column field="fecha" header="Fecha">
                    <template #body="{ data }">{{ formatFecha(data.fecha) }}</template>
                  </Column>
                  <Column field="estatus" header="Estatus" />
                </DataTable>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </main>
  </div>
</template>

<style scoped>
.view-shell {
  min-height: 100vh;
}

.content {
  max-width: 980px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}

.panel-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  margin-top: 16px;
}

@media (max-width: 760px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}

.form-card, .result-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.8rem;
  color: var(--pt-text-dim);
  margin-top: 10px;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.submit-btn {
  margin-top: 18px;
  width: 100%;
}

.encryption-note {
  font-size: 0.75rem;
  color: var(--pt-text-dim);
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.receipt {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 16px;
  row-gap: 10px;
  margin: 16px 0 0;
}

.receipt dt {
  color: var(--pt-text-dim);
  font-size: 0.8rem;
}

.receipt dd {
  margin: 0;
  font-size: 0.95rem;
}

.receipt dd.accent {
  color: var(--pt-accent);
  font-weight: 600;
}

.empty-hint {
  color: var(--pt-text-dim);
  font-size: 0.85rem;
  margin-top: 16px;
}

.table-card {
  margin-top: 16px;
  overflow: hidden;
}

.table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.table-scroll :deep(.p-datatable-table) {
  min-width: 720px;
}
</style>
