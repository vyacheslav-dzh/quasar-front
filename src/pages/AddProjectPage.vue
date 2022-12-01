<template>
    <div class="q-mt-lg">
      <q-btn label="Назад" @click="() => this.$router.go(-1)" class="q-ml-md"/>
      <q-form
        class="form q-gutter-md"
        @submit="onSubmit"
        @reset="onReset"
        method="post"
        greedy
      >
        <h3>Добавление проекта</h3>
        <q-input
          v-model="this.projectName"
          label="Название проекта"
          :disable="this.$q.loadingBar.isActive"
        />
        <q-item
          class="q-mb-lg"
          :disable="this.$q.loadingBar.isActive"
        >
          <q-item-section>
            <q-file
              label="Нажми на меня"
              v-model="this.file"
              filled
              bottom-slots
              counter
              accept=".pdf"
            >
              <template v-slot:before>
                <q-icon name="folder_open"/>
              </template>

              <template v-slot:hint>
                Загрузите pdf с чертежами
              </template>

              <template v-slot:append>
                <q-icon name="close" @click.stop.prevent="file = null" class="cursor-pointer" />
              </template>
            </q-file>
          </q-item-section>
        </q-item>
        <PagesList :pagesList="this.pagesList"
                   @addPageEvent="pageAppend"
                   class="q-mb-lg"
                   :disable="this.$q.loadingBar.isActive">
        </PagesList>
        <q-btn label="Создать" type="submit" :disable="this.$q.loadingBar.isActive"/>
        <q-btn label="Очистить" type="reset" color="primary" flat :disable="this.$q.loadingBar.isActive"/>
      </q-form>
    </div>
</template>

<script>
import PagesList from 'components/PagesList.vue'
import axios from 'axios'
import { ref } from 'vue'
import { useQuasar } from 'quasar'

export default {
  name: 'AddProjectPage',
  components: { PagesList },
  data () {
    return {
      maxId: 0,
      pagesList: [],
      file: ref(null),
      projectName: ''
    }
  },
  setup () {
    const $q = useQuasar()
    $q.loadingBar.setDefaults({
      color: 'purple',
      size: '15px',
      position: 'bottom'
    })
  },
  methods: {
    pageAppend () {
      this.pagesList.push({
        id: this.maxId++,
        pageNum: '',
        pageName: ''
      })
    },
    async onSubmit (event) {
      // this.loading = true
      this.$q.loadingBar.start()
      const formData = new FormData()
      formData.append('file', this.file)
      try {
        await axios.post('http://localhost:5000/upload_pdf',
          {
            file: this.file
          },
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
        await axios.post(
          'http://localhost:5000/add_project',
          {
            filename: this.file.name,
            projectName: this.projectName,
            pagesList: this.pagesList
          })
      } catch (e) {
        this.$q.loadingBar.stop()
        alert(e)
      }
      // this.loading = false
      this.$q.loadingBar.stop()
    },
    onReset () {
      this.pagesList = []
      this.maxId = 0
      this.file = ref(null)
    },
    handleFileUpload (event) {
      this.file = event.target.files[0]
    }
  }
}
</script>

<style scoped>
html {
  overflow-y: auto;
}
.form {
  margin: 0 auto;
  max-width: 50%;
  border: 1px solid #E5E5E5;
  padding: 25px;
}
</style>
