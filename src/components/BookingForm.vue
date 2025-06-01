<template>
  <div class="p-6 max-w-xl mx-auto bg-white rounded-md shadow border border-gray-200">
    <h2 class="text-2xl font-semibold mb-6 text-center">
      {{ props.id ? 'Edit' : 'Create' }} Booking
    </h2>
    <form @submit.prevent="submit" novalidate>
      <div class="mb-5">
        <label for="booking_date" class="block mb-2 font-medium text-gray-700">
          Booking Date
          <span class="text-red-500">*</span>
        </label>
        <input
            id="booking_date"
            v-model="form.booking_date"
            type="date"
            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            :disabled="loading"
        />
      </div>

      <div class="mb-5">
        <label for="time" class="block mb-2 font-medium text-gray-700">
          Time Slot
          <span class="text-red-500">*</span>
        </label>
        <select
            id="time"
            v-model="form.time_slot_id"
            class="w-full p-3 border rounded-md appearance-none bg-white pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            :disabled="loading || timeSlots.length === 0"
        >
          <option value="" disabled>Select a time</option>
          <option
              v-for="slot in timeSlots"
              :key="slot.id"
              :value="slot.id"
          >
            {{ slot.time }}
          </option>
        </select>
      </div>

      <div class="mb-5">
        <label for="name" class="block mb-2 font-medium text-gray-700">
          Name
          <span class="text-red-500">*</span>
        </label>
        <input
            id="name"
            type="text"
            :value="form.user_name"
            disabled
            class="w-full p-3 bg-gray-100 border rounded-md text-gray-700 focus:outline-none"
        />
      </div>

      <div class="mb-5">
        <label for="egn" class="block mb-2 font-medium text-gray-700">
          EGN
          <span class="text-red-500">*</span>
        </label>
        <input
            id="egn"
            v-model="form.egn"
            type="text"
            maxlength="10"
            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="Enter EGN"
            required
            :disabled="loading"
        />
      </div>

      <div class="mb-5">
        <label for="description" class="block mb-2 font-medium text-gray-700">Description</label>
        <textarea
            id="description"
            v-model="form.description"
            rows="4"
            class="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            :disabled="loading"
        ></textarea>
      </div>

      <div class="mb-6">
        <label class="block mb-2 font-semibold text-gray-700">
          Notification Types
          <span class="text-red-500">*</span>
        </label>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
          <label
              v-for="type in notificationTypeOptions"
              :key="type.value"
              class="flex items-center space-x-2 text-gray-800"
          >
            <input
                type="checkbox"
                :value="type.value"
                v-model="selectedTypes"
                class="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition duration-150 ease-in-out"
                :disabled="loading"
            />
            <span class="text-sm">{{ type.label }}</span>
          </label>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex space-x-4">
        <button
            v-if="props.id"
            type="button"
            @click="confirmDelete"
            :disabled="loading"
            class="flex-1 bg-red-600 text-white py-3 rounded-md font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Delete
        </button>

        <button
            type="submit"
            :disabled="loading"
            class="flex-1 bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {{ loading ? (props.id ? 'Updating...' : 'Creating...') : (props.id ? 'Update' : 'Create') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import {ref, onMounted, watch} from 'vue'
import { createBooking, updateBooking, getBooking, fetchNotificationTypes, fetchTimeSlots, deleteBooking } from '../api'
import {useRoute, useRouter} from 'vue-router'
import Swal from 'sweetalert2'

const props = defineProps(['id'])
const route = useRoute()
const router = useRouter()

const timeSlots = ref([])
const notificationTypeOptions = ref([])
const selectedTypes = ref([])

const form = ref({
  booking_date: '',
  time_slot_id: '',
  user_name: '',
  egn: '',
  description: '',
  notification_types: 0,
})

const loading = ref(false)

const initializeForm = async () => {
  loading.value = true
  try {
    if (props.id) {
      const { data } = await getBooking(props.id)
      form.value = {
        booking_date: data.data.booking_date ?? '',
        time_slot_id: data.data.time_slot?.id ?? '',
        user_name: data.data.user.name ?? '',
        egn: data.data.user?.personal_data?.egn ?? '',
        description: data.data.description ?? '',
        notification_types: 0,
      }
      selectedTypes.value = data.data.notification_types?.map(t => t.value) ?? []
    } else {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      form.value.egn = user.personal_data?.egn || ''
      form.value.user_name = user.name || ''
    }
  } catch (error) {
    Swal.fire('Error', 'Failed to load booking data.', 'error')
    throw error
  } finally {
    loading.value = false
  }

  try {
    const { data } = await fetchTimeSlots()
    timeSlots.value = data.data
  } catch (error) {
    console.error('Failed to load time slots', error)
    Swal.fire('Error', 'Failed to load time slots.', 'error')
  }

  try {
    const { data } = await fetchNotificationTypes()
    notificationTypeOptions.value = data
  } catch (error) {
    console.error('Failed to load notification types', error)
    Swal.fire('Error', 'Failed to load notification types.', 'error')
  }
}

watch(selectedTypes, () => {
  // Combine selected checkbox values into a bitmask or array, here example using bitwise OR (depends on your backend)
  form.value.notification_types = selectedTypes.value.reduce((acc, val) => acc | val, 0)
})

watch(() => route.fullPath, () => {
  initializeForm()
})

onMounted(() => {
  initializeForm()
})

const submit = async () => {
  loading.value = true
  try {
    if (props.id) {
      await updateBooking(props.id, form.value)
      Swal.fire('Updated!', 'Booking updated successfully.', 'success')
    } else {
      await createBooking(form.value)
      Swal.fire('Created!', 'Booking created successfully.', 'success')
    }
    router.push('/bookings')
  } catch (error) {
    const errors = error.response?.data?.errors
    if (errors) {
      const messages = Object.values(errors).flat().join('<br>')
      Swal.fire('Validation Error', messages, 'error')
    } else {
      Swal.fire('Error', 'Something went wrong.', 'error')
    }
  } finally {
    loading.value = false
  }
}

const confirmDelete = async () => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'This booking will be permanently deleted.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it!'
  })

  if (result.isConfirmed) {
    loading.value = true
    try {
      await deleteBooking(props.id)
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
