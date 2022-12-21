<template>
  <q-layout view="hHr LpR lFr">

    <q-header elevated class="bg-primary text-black" height-hint="98">
      <q-toolbar>
        <q-toolbar-title>
          <q-btn bordered dense flat round size="25px" @click="toggleLeftDrawer">
            <q-avatar>
              <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
            </q-avatar>
          </q-btn>
          Просмотр плана
        </q-toolbar-title>

        <q-btn dense flat round icon="menu" @click="toggleRightDrawer" />
      </q-toolbar>

      <q-tabs align="left" v-model="chosenProject">
        <q-route-tab
          v-for="project in this.projects"
          :label="project.name"
          :name="project.id"
          :key="project.id"
          @click="changeProjectPage(project.id)"
          :to="{
            name: 'projectPage',
            params: {
              projectId: project.id,
            }
          }"
        />
        <q-route-tab to="/addProject" label="+" />
      </q-tabs>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" elevated>
      <router-view
        name="leftSideBar"
        v-if="(this.clickedMarker)"
        :marker="this.clickedMarker"
        @editMarkerEvent="editMarkerEvent"
        @deleteMarkerEvent="deleteMarkerEvent"
      />
      <h3 v-else>Выберите маркер</h3>
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" side="right" elevated>
      <router-view
        v-if="this.pages.length > 0 && this.status.project"
        @changePage="changeCurPage"
        @deleteProjectEvent="deleteProjectEvent"
        @editProjectEvent="editProjectEvent"
        @deletePageEvent="deletePageEvent"
        @editPageEvent="editPageEvent"
        name="rightSideBar"
        :status="this.status"
        :pages="this.pages.filter(page => page.project_id === this.status.project.id)"
      />
    </q-drawer>

    <q-page-container>
      <router-view
        :status="status"
        @markerClicked="this.markerClicked"
        name="map"
        v-if="chosenProject"
      />
      <h2 v-else>Выберите проект</h2>
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from 'vue'
import requests from 'src/requests'
import L from 'leaflet'

export default {
  name: 'MainLayout',
  data () {
    return {
      projects: [],
      chosenProject: ref(null),
      pages: [],
      clickedMarker: null,
      status: {
        project: {
          id: null,
          name: ''
        },
        page: {
          id: null,
          max_zoom: null,
          name: '',
          path: '',
          project_id: null
        },
        marker: {}
      },
      map: null
    }
  },
  setup () {
    const leftDrawerOpen = ref(false)
    const rightDrawerOpen = ref(false)
    return {
      leftDrawerOpen,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      },

      rightDrawerOpen,
      toggleRightDrawer () {
        rightDrawerOpen.value = !rightDrawerOpen.value
      }
    }
  },
  async mounted () {
    await this.loadProjects()
    await this.loadPages(this.projects)
    if (this.chosenProject) {
      this.changeProjectPage(this.chosenProject)
    }
  },
  methods: {
    routePush () {
      console.log('pushed')
      this.$router.push({
        name: 'projectPage',
        params: {
          projectId: this.status.project.id,
          pageId: this.status.page.id
        }
      })
    },
    markerClicked (marker) {
      if (marker) {
        this.clickedMarker = marker
      }
      if (!this.leftDrawerOpen) {
        this.toggleLeftDrawer()
      }
    },
    changeProjectPage (id) {
      this.status.project = this.projects.find(project => project.id === id)
      const pageId = this.pages.find(page => page.project_id === this.status.project.id).id
      this.changeCurPage(pageId)
      if (!this.rightDrawerOpen) {
        this.toggleRightDrawer()
      }
    },
    changeCurPage (pageId) {
      this.status.page = this.pages.find(page => page.id === pageId)
      this.routePush()
    },
    async loadProjects () {
      this.projects = await requests.project.loadAll()
    },
    async loadPages (projects) {
      this.pages = await requests.page.loadAll(projects)
    },
    async editProjectEvent (projectName) {
      await requests.project.edit(this.status.project.id, projectName)
      this.status.project.name = projectName
      this.routePush()
    },
    async deleteProjectEvent () {
      await requests.project.delete(this.status.project.id)
      const index = this.projects.findIndex(project => project.id === this.status.project.id)
      this.projects = this.projects.filter(project => project.id !== this.status.project.id)
      this.status.project = this.projects.length > index ? this.projects[index] : this.projects[this.projects.length - 1]
      this.clickedMarker = null
      this.routePush()
    },
    async editPageEvent (pageName) {
      const id = this.status.page.id
      await requests.page.edit(id, pageName)
      this.pages.find(page => page.id === id).name = pageName
      this.changeCurPage(id)
    },
    async deletePageEvent () {
      await requests.page.delete(this.status.page.id)
      await this.loadPages()
      this.toggleRightDrawer()
    },
    async editMarkerEvent (newMarker) {
      await requests.marker.edit(newMarker)
      console.log(newMarker)
      this.clickedMarker.header = newMarker.newHeader
      this.clickedMarker.text = newMarker.newDesc
      this.routePush()
    },
    async deleteMarkerEvent (markerId) {
      await requests.marker.delete(markerId)
      this.clickedMarker = null
      this.toggleLeftDrawer()
      this.routePush()
    }
  }
}
</script>
