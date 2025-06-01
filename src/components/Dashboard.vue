<template>
  <div class="space-y-6">
    <h2 class="text-3xl font-bold text-blue-700">Welcome to Your Dashboard</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded shadow p-6">
        <h3 class="text-lg font-semibold mb-2">Quick Navigation</h3>
        <router-link to="/bookings" class="block text-blue-600 hover:underline mb-2">📋 View Bookings</router-link>
        <router-link to="/bookings/create" class="block text-green-600 hover:underline">➕ Add Booking</router-link>
      </div>
      <BookingChart />
    </div>
  </div>
</template>

<script setup>
import BookingChart from './BookingChart.vue'
</script>
