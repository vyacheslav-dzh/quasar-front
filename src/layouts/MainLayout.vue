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
          :to="{name: 'projectPage', params: {projectName: project['name']}}"
        />
        <q-route-tab to="/addProject" label="+" />
      </q-tabs>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" elevated>
      <router-view name="leftSideBar"/>
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" side="right" elevated>
      <router-view
        v-if="this.pages.length > 0 && this.activeProject"
        @changePage="changeCurPage"
        name="rightSideBar"
        :curPage="this.curPage"
        :pages="this.pages.filter(page => page.project_id === this.activeProject.id)"
      />
    </q-drawer>

    <q-page-container>
      <router-view :project="curPage" name="map" v-if="chosenProject"/>
      <h2 v-else>Выберите проект</h2>
    </q-page-container>

  </q-layout>
</template>

<script>
import { ref } from 'vue'
import axios from 'axios'

export default {
  name: 'MainLayout',
  data () {
    return {
      activeProject: null,
      projects: [],
      chosenProject: ref(null),
      pages: [],
      curPage: {
        projectName: '',
        pageName: '',
        path: '',
        maxZoom: 0
      }
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
  updated () {
  },
  methods: {
    changeCurPage (pageId) {
      const page = this.pages.find(page => page.id === pageId)
      this.curPage = {
        projectName: this.projects.find(project => project.id === page.project_id).name,
        pageName: page.name,
        path: page.path,
        maxZoom: page.max_zoom
      }
    },
    async loadProjects () {
      try {
        const response = await axios.get('http://localhost:5000/projects')
        this.projects = response.data
      } catch (e) {
        alert(e)
      }
    },
    async loadPages (projects) {
      this.pages = []
      const pageList = []
      for (const project of projects) {
        try {
          const response = await axios.get(`http://localhost:5000/pages/${project.id}`)
          pageList.push(response.data)
        } catch (e) {
          alert(e)
        }
      }
      pageList.forEach(pageListItem => pageListItem.forEach(page => this.pages.push(page)))
    },
    getProjectId () {
      const id = this.projects.find((element) => element.name === this.activeProject.name).id
      if (!id) {
        return this.projects
      }
      return id
    },
    changeProjectPage (id) {
      this.activeProject = this.projects.find(project => project.id === id)
      const pageId = this.pages.find(page => page.project_id === this.activeProject.id).id
      this.changeCurPage(pageId)
      if (!this.rightDrawerOpen) {
        this.toggleRightDrawer()
      }
    },
    goToProject (projectId) {
      const page = this.pages.find(page => page.project_id === projectId)
      this.curPage = {
        projectName: this.projects.find(project => project.id === projectId).name,
        pageName: page.name,
        path: page.path,
        maxZoom: page.max_zoom
      }
    }
  }
}
</script>
