<template>
  <q-item
    :disable="this.disable"
  >
    <q-item-section>
      <q-input label="Страница чертежа (плана)" v-model="pageNum" @update:model-value="pageNumChange"></q-input>
      <q-input label="Название страницы" v-model="pageName" @update:model-value="pageNameChange"></q-input>
    </q-item-section>
    <q-item-section style="max-width: 36px">
      <q-btn round size="12px" @click="$emit('removePageEvent')">&#10006;</q-btn>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'AddPage',
  props: {
    index: Number,
    disable: Boolean
  },
  data () {
    return {
      pageNum: '',
      pageName: ''
    }
  },
  methods: {
    pageNumChange (value) {
      this.$emit('pageNumChange', this.index, value)
    },
    pageNameChange (value) {
      this.$emit('pageNameChange', this.index, value)
    }
  }
}
</script>

<style scoped>
</style>
