import axios from 'axios'
import L from 'leaflet'
const baseUrl = 'http://localhost:5000'

const requests = {
  project: {
    async loadAll () {
      try {
        const response = await axios.get(`${baseUrl}/projects`)
        return response.data
      } catch (e) {
        alert(e)
      }
    },
    async edit (activeProjectId, newProjectName) {
      try {
        const project = {
          projectID: activeProjectId,
          projectName: newProjectName
        }
        await axios.post(`${baseUrl}/update_project`, project)
      } catch (e) {
        alert(e)
      }
    },
    async delete (projectId) {
      try {
        await axios.get(`${baseUrl}/delete_project/${projectId}`)
      } catch (e) {
        alert(e)
      }
    }
  },
  page: {
    async loadAll (projects) {
      const pageList = []
      try {
        for (const project of projects) {
          const response = await axios.get(`${baseUrl}/pages/${project.id}`)
          pageList.push(response.data)
        }
        const pages = []
        pageList.forEach(pageListItem => pageListItem.forEach(page => pages.push(page)))
        return pages
      } catch (e) {
        alert(e)
      }
    },
    async edit (pageId, newPageName) {
      try {
        const page = {
          pageID: pageId,
          pageName: newPageName
        }
        await axios.post(`${baseUrl}/update_page`, page)
      } catch (e) {
        alert(e)
      }
    },
    async delete (pageId) {
      try {
        await axios.get(`${baseUrl}/delete_page/${pageId}`)
      } catch (e) {
        alert(e)
      }
    },
    async createLayer (data) {
      try {
        await axios.post(`${baseUrl}/add_layer`, data)
      } catch (e) {
        alert(e)
      }
    }
  },
  marker: {
    async edit (newMarker) {
      try {
        const marker = {
          markerID: newMarker.oldMarker.id,
          markerHeader: newMarker.newHeader,
          markerText: newMarker.newDesc
        }
        await axios.post(`${baseUrl}/update_marker`, marker)
      } catch (e) {
        alert(e)
      }
    },
    async loadComments (markerId) {
      try {
        const response = await axios.get(`${baseUrl}/comments/${markerId}`)
        return response.data
      } catch (e) {
        alert(e)
      }
    },
    async sendComment (comment) {
      try {
        await axios.post(`${baseUrl}/add_comment`, comment)
      } catch (e) {
        alert(e)
      }
    },
    async delete (markerId) {
      try {
        await axios.get(`${baseUrl}/delete_marker/${markerId}`)
      } catch (e) {
        alert(e)
      }
    }
  },
  map: {
    async loadLayers (pageId) {
      try {
        const response = await axios.get(`${baseUrl}/layers/${pageId}`)
        return response.data
      } catch (e) {
        alert(e)
      }
    },
    async createMarker (data) {
      try {
        await axios.post(`${baseUrl}/add_marker`, data)
      } catch (e) {
        alert(e)
      }
    },
    async loadMarkers (layerList) {
      try {
        const markers = []
        for (const layer of layerList) {
          const response = await axios.get(`${baseUrl}/markers/${layer.id}`)
          markers.push({
            layerId: layer.id,
            list: response.data
          })
        }
        return markers
      } catch (e) {
        alert(e)
      }
    },
    async loadLayer (projectId, pageId, options) {
      return await L.tileLayer(`${baseUrl}/get_tile/${projectId}/${pageId}/{z}/{x}x{y}.png`, options)
    }
  }
}

export default requests
