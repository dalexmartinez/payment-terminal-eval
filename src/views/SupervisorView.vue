<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import InputMask from 'primevue/inputmask'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Message from 'primevue/message'
import TerminalHeader from '../components/TerminalHeader.vue'
import api from '../services/api'

const numeroReferencia = ref('')
const numeroTarjeta = ref('')
const tipo = ref<'Cancelacion' | 'Devolucion' | null>(null)

const tipoOpciones = [
  { label: 'Cancelación', value: 'Cancelacion' },
  { label: 'Devolución', value: 'Devolucion' },
]

const loading = ref(false)
const errorMsg = ref('')
const resultado = ref<null | {
  numeroAprobacion: string
  numeroReferencia: string
  tarjetaEnmascarada: string
  estatusAplicado: string
}>(null)

async function handleSubmit() {
  errorMsg.value = ''
  resultado.value = null

  if (!numeroReferencia.value || !numeroTarjeta.value || !tipo.value) {
    errorMsg.value = 'Completa referencia, tarjeta y tipo de transacción'
    return
  }
  if (numeroReferencia.value.length < 8) {
    errorMsg.value = 'Número de referencia incompleto'
    return
  }
  if (numeroTarjeta.value.replace(/\D/g, '').length < 15) {
    errorMsg.value = 'Número de tarjeta incompleto'
    return
  }

  loading.value = true
  try {
    const { data } = await api.patch('/cancelaciones', {
      numeroReferencia: numeroReferencia.value,
      numeroTarjeta: numeroTarjeta.value.replace(/\s/g, ''),
      tipo: tipo.value,
    })
    resultado.value = data
    numeroReferencia.value = ''
    numeroTarjeta.value = ''
    tipo.value = null
  } catch (err: any) {
    errorMsg.value = err.response?.data?.message ?? 'No se pudo procesar la solicitud'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="view-shell">
    <TerminalHeader title="Vista Supervisor · Cancelaciones y Devoluciones" />

    <main class="content">
      <div class="panel-grid">
        <form class="pt-panel form-card" @submit.prevent="handleSubmit">
          <p class="pt-eyebrow">Nueva solicitud</p>

          <label class="field-label">Tipo de transacción</label>
          <Select
            v-model="tipo"
            :options="tipoOpciones"
            optionLabel="label"
            optionValue="value"
            placeholder="Selecciona una opción"
            :disabled="loading"
          />

          <label class="field-label">Número de referencia financiera</label>
          <InputText
            v-model="numeroReferencia"
            placeholder="00000000"
            class="pt-mono"
            :disabled="loading"
          />

          <label class="field-label">Número de tarjeta</label>
          <InputMask
            v-model="numeroTarjeta"
            mask="9999 9999 9999 9999"
            placeholder="•••• •••• •••• ••••"
            class="pt-mono"
            :disabled="loading"
          />

          <Message v-if="errorMsg" severity="error" :closable="false">{{ errorMsg }}</Message>

          <Button type="submit" label="Aplicar transacción" :loading="loading" class="submit-btn" />
        </form>

        <div class="pt-panel result-card">
          <p class="pt-eyebrow">Comprobante</p>
          <template v-if="resultado">
            <dl class="receipt">
              <dt>Aprobación</dt>
              <dd class="pt-mono accent">{{ resultado.numeroAprobacion }}</dd>
              <dt>Referencia</dt>
              <dd class="pt-mono">{{ resultado.numeroReferencia }}</dd>
              <dt>Tarjeta</dt>
              <dd class="pt-mono">{{ resultado.tarjetaEnmascarada }}</dd>
              <dt>Estatus</dt>
              <dd>{{ resultado.estatusAplicado }}</dd>
            </dl>
          </template>
          <p v-else class="empty-hint">El comprobante aparecerá aquí después de aplicar una transacción.</p>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.view-shell {
  min-height: 100vh;
}

.content {
  max-width: 880px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}

.panel-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 20px;
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

.submit-btn {
  margin-top: 18px;
  width: 100%;
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
</style>
