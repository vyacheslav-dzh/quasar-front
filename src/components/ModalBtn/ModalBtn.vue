<template>
  <div class="">
    <q-btn
      :label="mainBtn.label"
      class="q-mr-md"
      @click.prevent="mainBtnClick"
      :style="mainBtn.style"
      :rounded="rounded"
    />

    <q-dialog v-model="this.open" persistent>
      <q-card style="min-width: 350px">
        <div
          v-for="(field, index) in fields"
          :key="index"
        >
          <q-card-section>
            <div class="text-h6"> {{field.title}} </div>
          </q-card-section>
          <FieldComponent
            v-if="field.type === 'select'"
            :fieldType="field.type"
            :autogrow="field.autogrow"
            :selectItems="field.selectItems"
          />
          <FieldComponent
            v-else
            :fieldType="field.type"
            :autogrow="field.autogrow"
          />
        </div>

        <q-card-actions align="right" class="text-primary">
          <q-btn text-color="dark" flat label="Отмена" v-close-popup />
          <q-btn
            text-color="dark"
            :label="submitBtn.label"
            @click="submitBtn.click"
            v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import FieldComponent from 'components/ModalBtn/FieldComponent.vue'

export default {
  name: 'ModalBtn',
  components: { FieldComponent },
  setup () {
    return {
      open: ref(false)
    }
  },
  props: {
    click: Function,
    fields: Array,
    submitBtn: Object,
    mainBtn: Object,
    rounded: Boolean
  },
  mounted () {
  },
  methods: {
    mainBtnClick () {
      this.open = true
      this.mainBtn.click()
    }
  }
}
</script>

<style scoped>

</style>
