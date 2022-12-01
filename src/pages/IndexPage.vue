<template>
  <q-page class="flex flex-center page">
    <div id = "map"></div>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default defineComponent({
  name: 'IndexPage',
  props: {
    project: Object
  },
  data () {
    return {
      centerCoordinates: [0, 0],
      map: null,
      tileLayer: null
    }
  },
  mounted () {
    this.initMap()
  },
  updated () {
    this.updateMap()
  },
  methods: {
    initMap () {
      this.map = L.map('map').setView(this.centerCoordinates, 3)
      this.tileLayer = L.tileLayer(`http://127.0.0.1:5000/get_tile/${this.project.projectName}/${this.project.pageName}/{z}/{x}x{y}.png`,
        {
          attribution: '',
          minZoom: 0,
          maxZoom: this.project.maxZoom,
          continuousWorld: true,
          noWrap: true
        })
      this.tileLayer.addTo(this.map)
    },
    updateMap () {
      this.tileLayer = L.tileLayer(`http://127.0.0.1:5000/get_tile/${this.project.projectName}/${this.project.pageName}/{z}/{x}x{y}.png`,
        {
          attribution: '',
          minZoom: 0,
          maxZoom: this.project.maxZoom,
          continuousWorld: true,
          noWrap: true
        })
      this.tileLayer.addTo(this.map)
    }
  }
})
</script>

<style>
body {
  overflow: hidden;
}

#map {
  cursor: default;
  width: 100vw;
  height: 100vh;
}
</style>
