<template>
  <q-page class="flex flex-center page">
    <div id = "map"></div>
    <q-btn
      label="+"
      class="add_marker"
      @click="addMarker"
      :style="{
          'display': show ? 'flex' : 'none',
          'top': show ? `${this.blockPosition.y - 10}px` : 0,
          'left': show ? `${this.blockPosition.x + 5}px` : 0,
          'opacity': show ? 1 : 0,
        }"
      rounded
    />

    <q-dialog v-model="this.prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="q-pt-none">
          <q-select
            label="Слой"
            v-model="chosenLayer"
            :options="layerList.map(layer => ({label: layer.name, value: layer.id}))"
            emit-value
            map-options
          />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input dense v-model="title" autofocus label="Заголовок"/>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            v-model="description"
            filled
            autogrow
            label="Описание"
          />
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            label="Цвет"
            filled
            v-model="color"
            :rules="['anyColor']"
          >
            <template v-slot:append>
              <q-icon name="colorize" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-color v-model="color" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn text-color="dark" flat label="Отмена" v-close-popup />
          <q-btn text-color="dark" label="Добавить маркер" @click="createMarker" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import requests from 'src/requests'

export default defineComponent({
  name: 'IndexPage',
  emits: ['mapUpdated', 'markerClicked'],
  props: {
    status: Object
  },
  setup () {
    return {
      prompt: ref(false),
      title: ref(''),
      description: ref(''),
      color: ref(''),
      chosenLayer: ref(null)
    }
  },
  data () {
    return {
      centerCoordinates: [55, -35],
      map: null,
      tileLayer: null,
      layerList: [],
      layerGroups: [],
      control: null,
      blockPosition: null,
      timerCount: 1,
      show: false,
      markerPosition: null,
      markerList: []
    }
  },
  async mounted () {
    await this.initMap()
  },
  beforeRouteUpdate (to) {
    if (to.name !== 'markerPage') {
      if (this.control) {
        this.control.remove()
        this.control = null
        this.layerGroups = []
      }
      this.initMap()
    }
  },
  methods: {
    async initMap () {
      await this.createMap()
      await this.loadLayers()
      await this.loadMarkers()
      this.createOverlay()
      this.setOnclick()
    },
    async createMap () {
      if (this.map) {
        this.map.off()
        this.map.remove()
      }
      this.map = L.map('map').setView(this.centerCoordinates, 3)
      const options = {
        attribution: '',
        minZoom: 0,
        maxZoom: this.status.page.max_zoom,
        continuousWorld: true,
        noWrap: true
      }
      const projectId = this.status.project.id
      const pageId = this.status.page.id
      this.tileLayer = await requests.map.loadLayer(projectId, pageId, options)
      this.tileLayer.addTo(this.map)
    },
    createOverlay () {
      if (this.layerList.length > 0 && !this.control) {
        this.control = L.control.layers().addTo(this.map)
        this.layerList.forEach(layer => {
          if (this.status.page.id === layer.page_id) {
            const layerGroup = []
            for (const marker of this.markerList.filter(item => item.layerId === layer.id)) {
              const popups = marker.list.map(item => this.createOnePopup(item))
              layerGroup.push(...popups)
            }
            const lg = new L.layerGroup(layerGroup)
            this.layerGroups.push({
              layerId: layer.id,
              layerGroup: lg
            })
            this.control.addOverlay(lg, layer.name)
          }
        })
      }
    },
    async updateOverlay (layerId) {
      await this.loadLayers()
      await this.loadMarkers()
      this.layerGroups.forEach(group => {
        if (group.layerId === layerId) {
          group.layerGroup.clearLayers()
        }
      })
      this.control.remove()
      this.control = null
      this.layerGroups = this.layerGroups.filter(group => group.layerId !== layerId)
      this.createOverlay()
    },
    createOnePopup (popup) {
      const markerHtmlStyles = `
        background-color: ${popup.color};
        width: 3rem;
        height: 3rem;
        display: block;
        left: -1.5rem;
        top: -1.5rem;
        position: relative;
        border-radius: 3rem 3rem 0;
        transform: rotate(45deg);
        border: 1px solid #FFFFFF`
      const customPopup = `
      <div>
        <h5>${popup.header}</h5>
        <p>${popup.text}</p>
      </div>
      `
      const icon = L.divIcon({
        className: "my-custom-pin",
        iconAnchor: [0, 24],
        labelAnchor: [-6, 0],
        popupAnchor: [0, -36],
        html: `<span style="${markerHtmlStyles}"/>`
      })
      const marker = L.marker([popup.x_axis, popup.y_axis], { icon: icon })
      marker.bindPopup(customPopup).openPopup()
      marker.markerID = popup.id
      marker.on('click', () => this.markerClick(popup))

      return marker
    },
    markerClick (popup) {
      this.$router.push({ name: 'markerPage', params: { projectId: this.status.project.id, pageId: this.status.page.id, markerId: popup.id } })
      this.$emit('markerClicked', popup)
    },
    async loadLayers () {
      if (this.status.page.id) {
        this.layerList = await requests.map.loadLayers(this.status.page.id)
      }
    },
    countDownTimer () {
      if (this.timerCount > 0) {
        setTimeout(() => {
          this.timerCount -= 1
          this.countDownTimer()
        }, 500)
      } else {
        this.blockPosition = {}
        this.timerCount = 2
        this.show = false
      }
    },
    setOnclick () {
      this.map.on('click', (e) => {
        this.show = true
        this.blockPosition = e.containerPoint
        this.markerPosition = e.latlng
        this.countDownTimer()
      })
    },
    addMarker () {
      this.prompt = true
      this.timerCount = 0
      this.timerCount = 1
    },
    async createMarker () {
      const data = {
        layerId: this.chosenLayer,
        header: this.title,
        text: this.description,
        x: this.markerPosition.lat,
        y: this.markerPosition.lng,
        color: this.color
      }
      await requests.map.createMarker(data)
      await this.updateOverlay(this.chosenLayer)
    },
    async loadMarkers () {
      this.markerList = await requests.map.loadMarkers(this.layerList)
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

.add_marker {
  position: absolute;
  z-index: 1000;
  background: #fff;
  font-size: 16px;
  transition: .4s opacity ease;
}
</style>
