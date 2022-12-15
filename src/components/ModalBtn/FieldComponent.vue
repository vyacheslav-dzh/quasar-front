<template>
  <q-card-section class="q-pt-none">
    <!-- Standard input -->
    <q-input
      v-if="(fieldType === 'input')"
      dense
      v-model="modelVar"
      autofocus
    />
    <!---->

    <!-- Color input -->
    <q-input
      v-else-if="(fieldType === 'colorize')"
      v-model="modelVar"
      :rules="['anyColor']"
      filled
    >
      <template v-slot:append>
        <q-icon name="colorize" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-color v-model="modelVar" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <!---->

    <!-- Select input -->
      <q-select
        v-else-if="(fieldType === 'select')"
        v-model="modelVar"
        :options="items"
        emit-value
        map-options
      />
    <!---->
  </q-card-section>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'FieldComponent',
  emits: ['modelValueUpdateEvent'],
  props: {
    fieldType: String,
    selectItems: Array,
    autogrow: Boolean
  },
  data () {
    return {
      items: []
    }
  },
  setup () {
    return {
      modelVar: ref('')
    }
  },
  mounted () {
    this.items = this.selectItems
    console.log(this.selectItems)
  },
  updated () {
    //console.log(this.selectItems)
  },
  methods: {
    modelValueUpdate () {
      this.$emit('modelValueUpdateEvent', this.modelVar)
    }
  }
}
</script>

<style scoped>

</style>
