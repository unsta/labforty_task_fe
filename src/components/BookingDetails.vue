<template>
  <div class="p-6 max-w-xl mx-auto">
    <h2 class="text-3xl font-semibold mb-6 text-center">Booking Details</h2>

    <div v-if="booking" class="bg-white shadow-md rounded-md p-6 border border-gray-200 space-y-4">
      <div>
        <p class="text-gray-700 font-medium">Date:</p>
        <p class="text-lg">{{ booking.booking_date }}</p>
      </div>

      <div>
        <p class="text-gray-700 font-medium">Time:</p>
        <p class="text-lg">{{ booking.time_slot.time }}</p>
      </div>

      <div>
        <p class="text-gray-700 font-medium">Name:</p>
        <p class="text-lg whitespace-pre-line">{{ booking.user.name || '—' }}</p>
      </div>

      <div>
        <p class="text-gray-700 font-medium">EGN:</p>
        <p class="text-lg font-mono">{{ booking.user.personal_data.egn }}</p>
      </div>

      <div>
        <p class="text-gray-700 font-medium">Email:</p>
        <p class="text-lg whitespace-pre-line">{{ booking.user.email || '—'}}</p>
      </div>

      <div>
        <p class="text-gray-700 font-medium">Description:</p>
        <p class="text-lg whitespace-pre-line">{{ booking.description || '—' }}</p>
      </div>

      <div>
        <p class="text-gray-700 font-medium">Notification Types:</p>
        <p class="text-lg">
          <span v-if="booking.notification_types.length">
            {{ booking.notification_types.map(nt => nt.label).join(', ') }}
          </span>
          <span v-else>—</span>
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end mt-6 space-x-4">
        <button
            @click="goBack"
            :disabled="loading"
            class="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          &larr; Back
        </button>

        <button
            v-if="isUser"
            @click="editBooking"
            :disabled="loading"
            class="px-4 py-2 rounded bg-yellow-600 hover:bg-yellow-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Edit
        </button>

        <button
            v-if="isUser"
            @click="confirmDelete"
            :disabled="loading"
            class="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Delete
        </button>
      </div>
    </div>

    <div v-else class="text-center text-gray-500 mt-12">
      Loading booking details...
    </div>
  </div>

  <div v-if="upcomingBookings.length" class="mt-10">
    <h3 class="text-lg font-semibold text-gray-700 mb-4">Upcoming Bookings</h3>
    <div class="grid md:grid-cols-2 gap-4">
      <router-link
          v-for="item in upcomingBookings"
          :key="item.id"
          :to="`/bookings/${item.id}`"
          class="block p-4 bg-white border border-gray-200 rounded shadow-sm hover:shadow-md hover:border-blue-400 transition"
      >
        <div class="flex justify-between items-center">
          <div>
            <p class="text-blue-600 font-medium">{{ item.booking_date }} @ {{ item.time_slot.time }}</p>
            <p class="text-gray-600 text-sm italic">Status:
              <span
                  class="ml-1 inline-block px-2 py-0.5 text-xs rounded bg-green-100 text-green-700"
                  v-if="item.status === 'confirmed'"
              >
              Confirmed
            </span>
              <span
                  v-else
                  class="ml-1 inline-block px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700"
              >
              {{ item.status }}
            </span>
            </p>
          </div>
          <div class="text-sm text-right">
            <p class="text-gray-500">#{{ item.id }}</p>
          </div>
        </div>
        <p class="mt-2 text-gray-700 line-clamp-2">{{ item.description }}</p>

        <div class="mt-2 text-sm text-gray-600">
          Notifications:
          <span
              v-for="type in item.notification_types"
              :key="type.value"
              class="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs mr-2"
          >
          {{ type.label }}
        </span>
        </div>
      </router-link>
    </div>
  </div>

</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { getBooking, deleteBooking } from '../api'

const booking = ref(null)
const loading = ref(false)
const route = useRoute()
const router = useRouter()
const upcomingBookings = ref([])

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const isAdmin = computed(() => user.value.role.includes('admin'))
const isUser = computed(() => user.value.role.includes('user'))

const loadBooking = async (id) => {
  loading.value = true
  try {
    const { data } = await getBooking(id)
    booking.value = data.data
    upcomingBookings.value = data.upcoming_bookings || []
  } catch (e) {
    console.error('Failed to load booking', e)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadBooking(newId)
  }
})

onMounted(async () => {
  if (route.params.id) {
    loadBooking(route.params.id)
  }
})

const goBack = () => {
  if (loading.value) return
  router.push('/bookings')
}

const editBooking = () => {
  if (!booking.value || loading.value) return
  router.push(`/bookings/${booking.value.id}/edit`)
}

const confirmDelete = async () => {
  if (loading.value) return
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This booking will be permanently deleted.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  })

  if (result.isConfirmed) {
    loading.value = true
    try {
      await deleteBooking(route.params.id)
      Swal.fire('Deleted!', 'Booking has been deleted.', 'success')
      router.push('/bookings')
    } catch (error) {
      Swal.fire('Error', 'Failed to delete booking.', 'error')
    } finally {
      loading.value = false
    }
  }
}
</script>
