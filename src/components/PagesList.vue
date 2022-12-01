<template>
  <div class="q-card--bordered">
    <q-list class="q-mb-lg">
      <AddPage v-for="(i, index) in pagesList"
                :key="i.id"
                :index="index"
                @pageNumChange="(index, value) => pagesList[index]['pageNum'] = value"
                @pageNameChange="(index, value) => pagesList[index]['pageName'] = value"
                @removePageEvent="() => pagesList.splice(index, 1)"
                class="q-mb-lg"
               :disable="this.disable"
      >
      </AddPage>
    </q-list>
    <q-btn
      class="btn"
      @click="$emit('addPageEvent')"
      :disable="this.disable"
    >
      Добавить страницу
    </q-btn>
  </div>
</template>

<script>
import AddPage from 'components/AddPage.vue'
export default {
  name: 'PagesList',
  components: {
    AddPage
  },
  props: {
    pagesList: Array,
    disable: Boolean
  }
}
</script>

<style scoped>
.btn {
  display: block;
  margin: 0 auto 26px;
}
</style>
