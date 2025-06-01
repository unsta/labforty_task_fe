<template>
  <div class="p-6 max-w-5xl mx-auto">
    <h2 class="text-3xl font-semibold mb-6 text-center">Bookings</h2>

    <!-- Filters -->
    <div class="mb-6 flex flex-wrap gap-6 items-end bg-white p-4 rounded-md shadow border border-gray-200">
      <div>
        <label for="date_from" class="block mb-1 font-medium text-gray-700">Date From</label>
        <input
            id="date_from"
            type="date"
            v-model="filters.date_from"
            class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
        />
      </div>

      <div>
        <label for="date_to" class="block mb-1 font-medium text-gray-700">Date To</label>
        <input
            id="date_to"
            type="date"
            v-model="filters.date_to"
            class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
        />
      </div>

      <div v-if="isAdmin">
        <label for="egn" class="block mb-1 font-medium text-gray-700">EGN</label>
        <input
            id="egn"
            type="text"
            v-model="filters.egn"
            maxlength="10"
            placeholder="Enter EGN"
            class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
        />
      </div>

      <button
          @click="applyFilters"
          class="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          :disabled="loading"
      >
        Filter
      </button>

      <button
          @click="resetFilters"
          class="bg-gray-300 text-gray-700 px-5 py-2 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          :disabled="loading"
      >
        Reset
      </button>
    </div>

    <!-- Loading Indicator -->
    <div v-if="loading" class="text-center text-gray-500 my-12">Loading bookings...</div>

    <!-- Bookings Table -->
    <div v-else>
      <div v-if="bookings.length === 0" class="text-center text-gray-500 py-12">
        No bookings found.
      </div>

      <table
          v-else
          class="table-auto w-full border border-collapse bg-white border-gray-300 rounded-md shadow-sm overflow-hidden"
      >
        <thead class="bg-gray-300 text-gray-700 font-semibold">
        <tr>
          <th class="p-3 border">#</th>
          <th class="p-3 border">Date</th>
          <th class="p-3 border">Time</th>
          <th class="p-3 border">Client</th>
          <th class="p-3 border">EGN</th>
          <th class="p-3 border">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr
            v-for="booking in bookings"
            :key="booking.id"
            class="hover:bg-gray-50"
        >
          <td class="p-3 border text-center">{{ booking.id }}</td>
          <td class="p-3 border text-center">{{ booking.booking_date }}</td>
          <td class="p-3 border text-center">{{ booking.time_slot.time }}</td>
          <td class="p-3 border">{{ booking.user.name }}</td>
          <td class="p-3 border font-mono text-center">{{ booking.user.personal_data.egn }}</td>
          <td class="p-3 border space-x-3 text-center">
            <router-link
                :to="`/bookings/${booking.id}`"
                class="text-blue-600 hover:underline font-semibold"
            >View</router-link>
            <router-link
                v-if="isUser"
                :to="`/bookings/${booking.id}/edit`"
                class="text-yellow-600 hover:underline font-semibold"
            >Edit</router-link>
<!--            <button-->
<!--                v-if="isUser"-->
<!--                @click="removeBooking(booking.id)"-->
<!--                class="text-red-600 hover:underline font-semibold"-->
<!--                :disabled="loading"-->
<!--            >-->
<!--              Delete-->
<!--            </button>-->
          </td>
        </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div
          v-if="pagination.last_page > 1"
          class="mt-6 flex justify-center space-x-2 select-none"
      >
        <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1 || loading"
            class="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Prev
        </button>

        <button
            v-for="page in pagesToShow"
            :key="page"
            @click="changePage(page)"
            :class="[
            'px-4 py-2 rounded border font-semibold',
            page === pagination.current_page
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 hover:bg-gray-200',
            loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          ]"
            :disabled="loading"
        >
          {{ page }}
        </button>

        <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page || loading"
            class="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { fetchBookings, deleteBooking } from '../api'
import Swal from 'sweetalert2'

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const isAdmin = computed(() => user.value.role.includes('admin'))
const isUser = computed(() => user.value.role.includes('user'))

const bookings = ref([])
const filters = ref({
  date_from: '',
  date_to: '',
  egn: '',
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 10,
  total: 0,
})

const loading = ref(false)

async function loadBookings(params = {}) {
  loading.value = true
  try {
    const response = await fetchBookings(params)
    const data = response.data
    bookings.value = data.data
    pagination.value.current_page = data.meta.current_page
    pagination.value.last_page = data.meta.last_page
    pagination.value.per_page = data.meta.per_page
    pagination.value.total = data.meta.total
  } catch (error) {
    console.error('Failed to load bookings', error)
    // Swal.fire('Error', 'Failed to load bookings', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadBookings({ page: 1 })
})

const applyFilters = () => {
  if (loading.value) return
  const params = {}
  if (filters.value.date_from) params.date_from = filters.value.date_from
  if (filters.value.date_to) params.date_to = filters.value.date_to
  if (filters.value.egn) params.egn = filters.value.egn.trim()
  params.page = 1 // Reset to first page when filters applied
  loadBookings(params)
}

const resetFilters = () => {
  if (loading.value) return
  filters.value.date_from = ''
  filters.value.date_to = ''
  filters.value.egn = ''
  loadBookings({ page: 1 })
}

const changePage = (page) => {
  if (loading.value) return
  if (page < 1 || page > pagination.value.last_page) return
  const params = { page }
  if (filters.value.date_from) params.date_from = filters.value.date_from
  if (filters.value.date_to) params.date_to = filters.value.date_to
  if (filters.value.egn) params.egn = filters.value.egn.trim()
  loadBookings(params)
}

const removeBooking = async (id) => {
  if (loading.value) return
  const confirm = await Swal.fire({
    title: 'Are you sure?',
    text: 'This booking will be deleted.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!',
  })

  if (confirm.isConfirmed) {
    loading.value = true
    try {
      await deleteBooking(id)
      // Reload current page data to update pagination if needed
      changePage(pagination.value.current_page)
      Swal.fire('Deleted!', 'Booking has been removed.', 'success')
    } catch (error) {
      Swal.fire('Error', 'Failed to delete booking.', 'error')
    } finally {
      loading.value = false
    }
  }
}

// Show 5 pages max, centered on current page
const pagesToShow = computed(() => {
  const total = pagination.value.last_page
  const current = pagination.value.current_page
  const delta = 2
  let start = current - delta
  let end = current + delta

  if (start < 1) {
    end += 1 - start
    start = 1
  }
  if (end > total) {
    start -= end - total
    end = total
  }
  start = Math.max(1, start)

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})
</script>
