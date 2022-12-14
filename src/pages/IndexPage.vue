<template>
  <q-page class="flex flex-center page">
    <div id = "map"></div>
    <q-btn
      class="add_marker"
      label="+"
      rounded
      :style="{
      'display': show ? 'flex' : 'none',
      'top': show ? `${this.blockPosition.y - 10}px` : 0,
      'left': show ? `${this.blockPosition.x + 5}px` : 0,
      'opacity': show ? 1 : 0,
      }"
      @click="addMarker"
    />

    <q-dialog v-model="this.prompt" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Слой</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="chosenLayer"
            :options="layerList.map(layer => ({label: layer.name, value: layer.id}))"
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Заголовок</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="title" autofocus/>
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Описание</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="description"
            filled
            autogrow
          />
        </q-card-section>

        <q-card-section>
          <div class="text-h6">Цвет</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
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

export default defineComponent({
  name: 'IndexPage',
  emits: ['mapUpdated', 'markerClicked'],
  props: {
    curPage: Object,
    project: Object,
    mapUpdate: Boolean
  },
  setup () {
    return {
      prompt: ref('false'),
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
      overlayCreated: false,
      blockPosition: null,
      timerCount: 1,
      show: false,
      markerPosition: null,
      markerList: []
    }
  },
  async mounted () {
    await this.initMap()
    await this.loadLayers()
    await this.loadMarkers()
    this.createOverlay()
    this.setOnclick()
  },
  async updated () {
    await this.updateMap()
    await this.loadLayers()
    await this.loadMarkers()
    this.createOverlay()
    this.$emit('mapUpdated')
    this.setOnclick()
  },
  methods: {
    async initMap () {
      this.map = L.map('map').setView(this.centerCoordinates, 3)
      this.tileLayer = await L.tileLayer(`http://127.0.0.1:5000/get_tile/${this.project.projectName}/${this.project.pageName}/{z}/{x}x{y}.png`,
        {
          attribution: '',
          minZoom: 0,
          maxZoom: this.project.maxZoom,
          continuousWorld: true,
          noWrap: true
        })
      this.tileLayer.addTo(this.map)
    },
    async updateMap () {
      this.map.off()
      this.map.remove()
      this.map = L.map('map').setView(this.centerCoordinates, 3)
      this.tileLayer = await L.tileLayer(`http://127.0.0.1:5000/get_tile/${this.project.projectName}/${this.project.pageName}/{z}/{x}x{y}.png`,
        {
          attribution: '',
          minZoom: 0,
          maxZoom: this.project.maxZoom,
          continuousWorld: true,
          noWrap: true
        })
      this.tileLayer.addTo(this.map)
    },
    createOverlay () {
      if (this.layerList.length > 0 && !this.overlayCreated) {
        const control = L.control.layers().addTo(this.map)
        this.layerList.forEach(layer => {
          if (this.curPage.id === layer.page_id) {
            const layerGroup = []
            for (const marker of this.markerList.filter(item => item.layerId === layer.id)) {
              const popups = marker.list.map(item => this.createOnePopup(item))
              layerGroup.push(...popups)
            }
            console.log(layerGroup)
            control.addOverlay(new L.layerGroup(layerGroup), layer.name)
          }
        })
        this.overlayCreated = true
      }
    },
    async loadLayers () {
      this.overlayCreated = false
      if (this.curPage.id) {
        try {
          const response = await axios.get(`http://localhost:5000/layers/${this.curPage.id}`)
          this.layerList = response.data
        } catch (e) {
          alert(e)
        }
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
      try {
        await axios.post('http://localhost:5000/add_marker', {
          layerId: this.chosenLayer,
          header: this.title,
          text: this.description,
          x: this.markerPosition.lat,
          y: this.markerPosition.lng,
          color: this.color
        })
        this.$forceUpdate()
      } catch (e) {
        alert(e)
      }
      // this.title = ''
      // this.description = ''
      // this.color = ''
      // this.chosenLayer = null
    },
    async loadMarkers () {
      try {
        const markers = []
        for (const layer of this.layerList) {
          const response = await axios.get(`http://localhost:5000/markers/${layer.id}`)
          markers.push({
            layerId: layer.id,
            list: response.data
          })
        }
        this.markerList = markers
      } catch (e) {
        alert(e)
      }
    },
    createOnePopup (popup) {
      // this.map.clearLayers()
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
      marker.on('click', () => this.$emit('markerClicked', popup))

      return marker
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
