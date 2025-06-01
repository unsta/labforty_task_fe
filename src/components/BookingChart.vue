<template>
  <div class="bg-white rounded shadow p-6">
    <h3 class="text-lg font-semibold mb-4">
      {{ isAdmin ? 'Total Bookings Overview' : 'My Bookings Overview' }}
    </h3>
    <!-- Chart wrapper with fixed height -->
    <div class="relative h-64">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>

<script setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title, Tooltip, Legend,
  BarElement, CategoryScale, LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

import {computed, onMounted, ref} from 'vue'
import { fetchBookings } from '../api'

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const isAdmin = computed(() => user.value.role.includes('admin'))
const isUser = computed(() => user.value.role.includes('user'))

const chartData = ref({
  labels: [],
  datasets: [{
    label: 'Bookings per Day',
    backgroundColor: '#3b82f6',
    data: []
  }]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom'
    }
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
}

onMounted(async () => {
  const res = await fetchBookings()
  const bookings = res.data.data

  const counts = bookings.reduce((acc, booking) => {
    acc[booking.booking_date] = (acc[booking.booking_date] || 0) + 1
    return acc
  }, {})

  chartData.value = {
    labels: Object.keys(counts),
    datasets: [{
      label: 'Bookings per Day',
      backgroundColor: '#3b82f6',
      data: Object.values(counts)
    }]
  }
})

</script>
