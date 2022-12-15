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

  <q-btn label="Редактировать" class="q-mr-md" @click="editOpen"/>

  <q-dialog v-model="this.edit" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Название проекта</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-input dense v-model="this.newProjectName" autofocus @keyup.enter="this.edit = false" />
      </q-card-section>

      <q-card-actions align="right" class="text-primary">
        <q-btn text-color="dark" flat label="Отмена" v-close-popup />
        <q-btn
          text-color="dark"
          label="Сохранить"
          @click="() => {
            $emit('editProjectEvent', this.newProjectName)
            this.newProjectName = ''
          }"
          v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-btn label="Удалить" @click="this.delete = true"/>
  <q-dialog v-model="this.delete" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">Вы точно хотите удалить этот проект?</div>
      </q-card-section>
      <q-card-actions align="right" class="text-primary">
        <q-btn text-color="dark" flat label="Отмена" v-close-popup />
        <q-btn
          text-color="dark"
          label="Да"
          @click="$emit('deleteProjectEvent')"
          v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

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
      <q-btn class="col" @click="prompt = true">Добавить слой</q-btn>
      <q-dialog v-model="this.prompt" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Название слоя</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="layerName" autofocus @keyup.enter="this.prompt = false" />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn text-color="dark" flat label="Отмена" v-close-popup />
            <q-btn text-color="dark" label="Добавить слой" @click="createLayer" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-item>

  </q-list>
</template>

<script>
import axios from 'axios'
import { ref } from 'vue'

export default {
  name: 'RightSideBar',
  emits: ['changePage', 'layersChange', 'deleteProjectEvent', 'editProjectEvent'],
  setup () {
    return {
      layerName: ref(''),
      prompt: ref(false),
      delete: ref(null),
      edit: ref(null)
    }
  },
  data () {
    return {
      activePage: '',
      pageList: [],
      newProjectName: ref('')
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
  },
  methods: {
    async createLayer () {
      this.$q.loadingBar.start()
      try {
        await axios.post('http://localhost:5000/add_layer',
          {
            pageId: this.curPage.id,
            layerName: this.layerName
          })
        this.layerName = ''
        this.$emit('layersChange')
      } catch (e) {
        alert(e)
      }
      this.$q.loadingBar.stop()
    },
    editOpen () {
      this.newProjectName = this.curPage.projectName
      this.edit = true
    }
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
