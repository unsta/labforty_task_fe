<template>
  <aside v-if="auth.isAuthenticated" class="w-64 bg-white shadow-lg p-6 border-r border-gray-200">
    <!-- Logo -->
    <h2 class="text-2xl font-bold text-blue-600 mb-8 tracking-tight">Booking System</h2>

    <!-- User Info -->
    <div class="mb-8 border-b pb-4">
      <p class="text-sm font-semibold text-gray-800">{{ user.name }}</p>
      <p class="text-xs text-gray-500 capitalize italic">{{ user.role.join(', ') }}</p>
    </div>

    <!-- Navigation -->
    <nav class="space-y-1 text-sm">
      <router-link
          to="/"
          class="block px-4 py-2 rounded-md font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
          active-class="bg-blue-100 text-blue-700 font-semibold"
      >
        Dashboard
      </router-link>

      <router-link
          to="/bookings"
          class="block px-4 py-2 rounded-md font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
          active-class="bg-blue-100 text-blue-700 font-semibold"
      >
        Bookings
      </router-link>

      <router-link
          v-if="isUser"
          to="/bookings/create"
          class="block px-4 py-2 rounded-md font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
          active-class="bg-blue-100 text-blue-700 font-semibold"
      >
        Add Booking
      </router-link>

      <button
          @click="logoutUser"
          class="w-full text-left px-4 py-2 rounded-md font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition"
      >
        Logout
      </button>
    </nav>
  </aside>
</template>


<script setup>
import { auth, setAuth } from '../stores/auth'
import { logout } from '../api'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import {computed, onMounted, ref, watch} from 'vue'

const router = useRouter()
const user = ref({ name: '', role: [] })
const isAdmin = computed(() => user.value.role.includes('admin'))
const isUser = computed(() => user.value.role.includes('user'))

// Watch auth.isAuthenticated and update user info accordingly
watch(() => auth.isAuthenticated, (isAuth) => {
  if (isAuth) {
    const stored = JSON.parse(localStorage.getItem('user') || '{}')
    user.value.name = stored.name || ''
    user.value.role = Array.isArray(stored.role) ? stored.role : [stored.role || '']
  } else {
    user.value = { name: '', role: [] }
  }
}, { immediate: true })

const logoutUser = async () => {
  try {
    await logout()
    setAuth(false)
    Swal.fire('Logged out', 'You have been logged out successfully.', 'success')
    router.push('/login')
  } catch (e) {
    Swal.fire('Error', 'Logout failed.', 'error')
  }
}
</script>
