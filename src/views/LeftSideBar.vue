<template>
  <div class="q-px-md q-py-lg">
    <div class="text-h4 q-mb-md">{{ this.marker.header }}</div>
    <q-separator inset class="q-mb-md"/>
    <div class="row q-mb-md">
      {{this.marker.text}}
    </div>
    <q-separator inset class="q-mb-md"/>
    <div style="width: 100%; max-width: 400px">
      <div v-if="(this.comments.length > 0)">
        <q-chat-message
          v-for="comment in this.comments"
          :key="comment.id"
          :text="[comment.text]"
          :stamp="comment.date"
          name="Я"
          sent
        />
      </div>
      <h4 v-else>Здесь пока пусто</h4>
    </div>
    <q-separator inset class="q-mb-md"/>
    <q-input
      v-model="text"
      filled
      autogrow
      placeholder="Введите комментарий"
      clearable
      class="q-mb-md row"
    >
      <template v-slot:after>
        <q-btn round dense flat icon="send" @click="sendComment"/>
      </template>
    </q-input>
    <q-separator inset class="q-mb-md"/>
    <q-btn label="Редактировать" class="q-mr-md" @click="editOpen"/>

    <q-dialog v-model="this.edit" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Название маркера</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="newMarkerHeader" autofocus @keyup.enter="this.edit = false" />
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Описание маркера</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="newMarkerDesc" autofocus @keyup.enter="this.edit = false" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn text-color="dark" flat label="Отмена" v-close-popup />
          <q-btn
            text-color="dark"
            label="Сохранить"
            @click="editMarkerEvent"
            v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-btn label="Удалить" @click="this.delete = true"/>
    <q-dialog v-model="this.delete" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Вы точно хотите удалить этот маркер?</div>
        </q-card-section>
        <q-card-actions align="right" class="text-primary">
          <q-btn text-color="dark" flat label="Отмена" v-close-popup />
          <q-btn
            text-color="dark"
            label="Да"
            @click="$emit('deleteMarkerEvent', this.marker.id)"
            v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'

export default {
  name: 'LeftSideBar',
  emits: ['editMarkerEvent', 'deleteMarkerEvent'],
  props: {
    marker: Object
  },
  data () {
    return {
      comments: []
    }
  },
  setup () {
    return {
      text: ref(''),
      edit: ref(null),
      delete: ref(null),
      newMarkerHeader: ref(''),
      newMarkerDesc: ref('')
    }
  },
  async mounted () {
    await this.loadComments()
  },
  async updated () {
    await this.loadComments()
  },
  methods: {
    async loadComments () {
      try {
        const response = await axios.get(`http://localhost:5000/comments/${this.marker.id}`)
        this.comments = response.data
      } catch (e) {
        alert(e)
      }
    },
    async sendComment () {
      try {
        const comment = {
          markerId: this.marker.id,
          userId: 0,
          text: this.text,
          name: 'me',
          date: new Date().toLocaleString("ru")
        }
        await axios.post('http://localhost:5000/add_comment', comment)
      } catch (e) {
        alert(e)
      }
      this.text = ''
    },
    editMarkerEvent () {
      this.$emit('editMarkerEvent', {
        oldMarker: this.marker,
        newHeader: this.newMarkerHeader,
        newDesc: this.newMarkerDesc
      })
      this.newMarkerHeader = ''
      this.newMarkerDesc = ''
    },
    editOpen () {
      this.newMarkerHeader = this.marker.header
      this.newMarkerDesc = this.marker.text
      this.edit = true
    }
  }
}
</script>

<style scoped>

</style>
