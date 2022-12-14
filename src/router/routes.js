
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: ':projectName',
        name: 'projectPage',
        components:
          {
            map: () => import('pages/IndexPage.vue'),
            rightSideBar: () => import('../views/RightSideBar.vue'),
            leftSideBar: () => import('../views/LeftSideBar.vue')
          }
      }
    ]
  },

  {
    path: '/addProject',
    component: () => import('pages/AddProjectPage.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
