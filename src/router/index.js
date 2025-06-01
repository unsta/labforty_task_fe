import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../components/Dashboard.vue'
import BookingList from '../components/BookingList.vue'
import BookingForm from '../components/BookingForm.vue'
import BookingDetail from '../components/BookingDetails.vue'
import Login from '../components/Login.vue'
import { auth } from '../stores/auth'

const routes = [
    { path: '/login', name: 'login', component: Login },
    { path: '/', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
    { path: '/bookings', name: 'booking-list', component: BookingList, meta: { requiresAuth: true } },
    { path: '/bookings/create', name: 'booking-create', component: BookingForm, meta: { requiresAuth: true } },
    { path: '/bookings/:id', name: 'booking-detail', component: BookingDetail, meta: { requiresAuth: true } },
    { path: '/bookings/:id/edit', name: 'booking-edit', component: BookingForm, meta: { requiresAuth: true }, props: true },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
        next({ name: 'login' })
    } else {
        next()
    }
})

export default router
