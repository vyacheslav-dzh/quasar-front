<template>
  <div class="q-px-md q-py-lg">
    <div class="text-h4 q-mb-md">{{ currentMarker.header }}</div>
    <q-separator inset class="q-mb-md"/>
    <div class="row q-mb-md">
      {{ currentMarker.text }}
    </div>
    <q-separator inset class="q-mb-md"/>
    <div style="width: 100%; max-width: 400px">
      <div v-if="(this.comments.length > 0)">
        <q-chat-message
          v-for="comment in comments"
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
    <q-btn label="Удалить" @click="this.delete=true"/>

    <q-dialog
      v-model="edit"
      persistent
    >
      <q-card style="min-width: 350px; padding-top: 20px">
        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="header"
            autofocus
            @keyup.enter="edit = false"
            label="Название"
          />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            dense
            v-model="desc"
            autofocus
            @keyup.enter="edit = false"
            label="Описание"
          />
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
            @click="$emit('deleteMarkerEvent', currentMarker.id)"
            v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref } from 'vue'
import requests from 'src/requests'

export default {
  name: 'LeftSideBar',
  emits: ['editMarkerEvent', 'deleteMarkerEvent'],
  props: {
    marker: Object
  },
  data () {
    return {
      comments: [],
      currentMarker: {},
      header: '',
      desc: ''
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
  beforeRouteUpdate () {
    this.loadComments()
    this.currentMarker = {
      id: this.marker.id,
      header: this.marker.header,
      text: this.marker.text
    }
    console.log(this.comments)
  },
  methods: {
    async loadComments () {
      this.comments = await requests.marker.loadComments(this.marker.id)
    },
    async sendComment () {
      const comment = {
        markerId: this.marker.id,
        userId: 0,
        text: this.text,
        name: 'me',
        date: new Date().toLocaleString("ru")
      }
      await requests.marker.sendComment(comment)
      this.comments.push(comment)
      this.text = ''
    },
    editMarkerEvent () {
      this.currentMarker.header = this.header
      this.currentMarker.text = this.desc
      this.$emit('editMarkerEvent', {
        oldMarker: this.marker,
        newHeader: this.currentMarker.header,
        newDesc: this.currentMarker.text
      })
    },
    editOpen () {
      this.header = this.currentMarker.header
      this.desc = this.currentMarker.text
      this.edit = true
    }
  }
}
</script>

<style scoped>

</style>
