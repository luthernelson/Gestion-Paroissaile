import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { permission: null }
      },
      // ── Membres ──
      /* {
        path: 'membres',
        name: 'Membres',
        component: () => import('@/views/membres/MembresView.vue'),
        meta: { permission: 'membres.view' }
      },
      {
        path: 'membres/nouveau',
        name: 'MembreNouveau',
        component: () => import('@/views/membres/MembreNouveauView.vue'),
        meta: { permission: 'membres.create' }
      },
      {
        path: 'membres/catechese',
        name: 'Catechese',
        component: () => import('@/views/membres/CatetheseView.vue'),
        meta: { permission: 'membres.catechese' }
      },
      {
        path: 'membres/baptemes',
        name: 'Baptemes',
        component: () => import('@/views/membres/BaptemesView.vue'),
        meta: { permission: 'membres.baptemes' }
      }, */
      // ── Cultes ──
      {
        path: 'cultes/calendrier',
        name: 'CultesCalendrier',
        component: () => import('@/views/cultes/CalendrierView.vue'),
        //meta: { permission: 'cultes.view' }
      },
       /*{
        path: 'cultes/nouveau',
        name: 'CulteNouveau',
        component: () => import('@/views/cultes/CulteNouveauView.vue'),
        meta: { permission: 'cultes.create' }
      },
      {
        path: 'cultes/presences',
        name: 'Presences',
        component: () => import('@/views/cultes/PresencesView.vue'),
        meta: { permission: 'cultes.presences' }
      }, */
      // ── Collectes ──
      /* {
        path: 'collectes',
        name: 'Collectes',
        component: () => import('@/views/collectes/CollectesView.vue'),
        meta: { permission: 'collectes.view' }
      },
      {
        path: 'collectes/nouvelle',
        name: 'CollecteNouvelle',
        component: () => import('@/views/collectes/CollecteNouvelleView.vue'),
        meta: { permission: 'collectes.create' }
      },
      {
        path: 'collectes/dimes',
        name: 'Dimes',
        component: () => import('@/views/collectes/DimesView.vue'),
        meta: { permission: 'collectes.dimes' }
      },
      {
        path: 'collectes/offrandes',
        name: 'Offrandes',
        component: () => import('@/views/collectes/OffrandesView.vue'),
        meta: { permission: 'collectes.offrandes' }
      }, */
      // ── Groupes ──
     /*  {
        path: 'groupes',
        name: 'Groupes',
        component: () => import('@/views/groupes/GroupesView.vue'),
        meta: { permission: 'groupes.view' }
      },
      {
        path: 'groupes/nouveau',
        name: 'GroupeNouveau',
        component: () => import('@/views/groupes/GroupeNouveauView.vue'),
        meta: { permission: 'groupes.create' }
      },
      {
        path: 'groupes/cellules',
        name: 'Cellules',
        component: () => import('@/views/groupes/CellulesView.vue'),
        meta: { permission: 'groupes.cellules' }
      },
      {
        path: 'groupes/ministeres',
        name: 'Ministeres',
        component: () => import('@/views/groupes/MinisteresView.vue'),
        meta: { permission: 'groupes.ministeres' }
      }, */
      // ── Rapports ──
     /*  {
        path: 'rapports/mensuel',
        name: 'RapportMensuel',
        component: () => import('@/views/rapports/RapportMensuelView.vue'),
        meta: { permission: 'rapports.view' }
      },
      {
        path: 'rapports/annuel',
        name: 'RapportAnnuel',
        component: () => import('@/views/rapports/RapportAnnuelView.vue'),
        meta: { permission: 'rapports.view' }
      }, */
    {
        path: 'rapports/home',
        name: 'RapportHome',
        component: () => import('@/views/reports/ReportsHome.vue'),
        meta: { permission: null }
      },
      {
        path: 'rapports/membres',
        name: 'RapportMembres',
        component: () => import('@/views/reports/MembersReport.vue'),
        meta: { permission: null }
      },
      {
        path: 'rapports/activites',
        name: 'RapportActivites',
        component: () => import('@/views/reports/ActivitiesReport.vue'),
        meta: { permission: null }
      },
      {
        path: 'rapports/collectes',
        name: 'RapportCollectes',
        component: () => import('@/views/reports/CollectesReport.vue'),
        meta: { permission: null }
      },
      /*  {
        path: 'rapports/finances',
        name: 'RapportFinances',
        component: () => import('@/views/rapports/RapportFinancesView.vue'),
        meta: { permission: 'rapports.finances' }
      },
      {
        path: 'rapports/export',
        name: 'RapportExport',
        component: () => import('@/views/rapports/RapportExportView.vue'),
        meta: { permission: 'rapports.export' }
      }, */
      // ── Configuration ──
      {
        path: 'config/general',
        name: 'ConfigGeneral',
        component: () => import('@/views/config/ConfigParoissesView.vue'),
        meta: { permission: null }
      },
      {
        path: 'config/users',
        name: 'ConfigUtilisateurs',
        component: () => import('@/views/users/UserView.vue'),
        meta: { permission:null }
      },
      {
        path: 'config/users/new',
        name: 'ConfigNewUtilisateurs',
        component: () => import('@/views/users/UserCreateView.vue'),
        meta: { permission:null }
      },
      {
        path: 'config/users/:id/edit',
        name: 'ConfigEditUsers',
        component: () => import('@/views/users/UserCreateView.vue'),
        meta: { permission:null }
      },
      {
        path: 'config/users/:id',
        name: 'ConfigviewUtilisateurs',
        component: () => import('@/views/users/userDetailsView.vue'),
        meta: { permission:null }
      },
      {
        path: 'config/site',
        name: 'SiteConfigIndex',
        component: () => import('@/views/config/site/SiteConfigIndex.vue'),
        meta: { permission: null }
      },
       {
        path: 'config/site/apparence',
        name: 'SiteConfigApparence',
        component: () => import('@/views/config/site/SiteConfigApparence.vue'),
      },
      {
        path: 'config/site/accueil',
        name: 'SiteConfigAccueil',
        component: () => import('@/views/config/site/SiteConfigAcceuil.vue'),
      },
      {
        path: 'config/site/evenements',
        name: 'SiteConfigEvenements',
        component: () => import('@/views/config/site/SiteConfigEvenement.vue'),
      },
      {
        path: 'config/site/annonces',
        name: 'SiteConfigAnnonces',
        component: () => import('@/views/config/site/SiteConfigAnnonces.vue'),
      },
      {
        path: 'config/site/medias',
        name: 'SiteConfigMedias',
        component: () => import('@/views/config/site/SiteConfigMedias.vue'),
      }, 
      {
        path: 'config/site/reseaux',
        name: 'SiteConfigReseaux',
        component: () => import('@/views/config/site/SiteConfigReseaux.vue'),
      },
      {
        path: 'config/site/statut',
        name: 'SiteConfigStatut',
        component: () => import('@/views/config/site/SiteConfigStatut.vue'),
      },
      {
        path: 'config/permissions',
        name: 'ConfigPermissions',
        component: () => import('@/views/users/RolesPermission.vue'),
        meta: { permission: null }
      }, 
      // ── Accès refusé ──
      {
        path: '403',
        name: 'Forbidden',
        component: () => import('@/views/errors/ForbiddenView.vue'),
      },
    ]
  },
  // ── 404 catch-all ──
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/errors/NotFoundView.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// ── Guard de permissions ──
router.beforeEach((to) => {
  const stored = localStorage.getItem('user_token')
  const isAuthenticated = !!stored

  // Rediriger vers /login si non authentifié et route protégée
  if (!isAuthenticated && to.meta.guest !== true && to.name !== 'Login') {
    return { name: 'Login' }
  }

  // Rediriger vers /dashboard si déjà connecté et tentative d'accès à /login
  if (isAuthenticated && to.meta.guest === true) {
    return { name: 'Dashboard' }
  }

  // Vérification des permissions
  const permission = to.meta.permission as string | null | undefined
  if (!permission) return true

  const storedPerms = localStorage.getItem('user_permissions')
  const userPermissions: string[] = storedPerms ? JSON.parse(storedPerms) : []

  if (!userPermissions.includes(permission)) {
    return { name: 'Forbidden' }
  }

  return true
})

export default router




