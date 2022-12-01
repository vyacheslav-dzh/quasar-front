<template>
  <div class="q-px-md q-py-lg">
    <div class="text-h4 q-mb-md">{{ this.curPage.projectName }}</div>
    <q-separator inset class="q-mb-md"/>
    <div class="row">
      <div class="text-subtitle1 col">Дата начала</div>
      <div class="text-subtitle1 col">Активный этап</div>
    </div>
    <div class="row">
      <div class="text-overline col">01.01.1984</div>
      <div class="text-overline col">демонтаж</div>
    </div>
  </div>

  <q-separator class="q-mb-md"/>

  <q-list>
    <q-item v-for="(page, index) in this.pages"
            :key="index"
            clickable
            class="item q-mb-md"
            v-ripple
            :active="activePage === page.name"
            @click="activePage = page.name; $emit('changePage', page.id)"
            active-class="active-layer"
    >
      <q-item-section>
        <q-item-label>
          {{ page.name }}
        </q-item-label>
        <q-item-label caption>
          --- Описание слоя ---
        </q-item-label>
      </q-item-section>
    </q-item>
    <q-separator class="q-mb-md"/>

    <q-item>
      <q-btn class="col">Редактировать</q-btn>
    </q-item>

  </q-list>
</template>

<script>
export default {
  name: 'RightSideBar',
  emits: ['changePage'],
  data () {
    return {
      activePage: '',
      pageList: []
    }
  },
  props: {
    curPage: Object,
    pages: Array
  },
  mounted () {
    this.pageList = this.pages
    console.log(this.curPage)
    this.activePage = this.pageList[0].name
  },
  updated () {
    this.activePage = this.curPage.pageName
  }
}
</script>

<style lang="scss" scoped>
.item {
  transition: min-height .3s;
  transition-delay: 0s;
  .section {
    transition: min-height .3s;
    padding: 0 10px;
  }
}

.active-layer {
  // background-color: #000;
  min-height: 70px;
  transition-delay: 0s;
  background: $accent;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.25);
}
</style>
