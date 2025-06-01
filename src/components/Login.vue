<template>
  <div class="max-w-md mx-auto mt-10 p-6 bg-white border rounded shadow">
    <h2 class="text-2xl font-bold mb-4">Login</h2>
    <form @submit.prevent="submit">
      <div class="mb-4">
        <label>Email</label>
        <input v-model="email" type="email" class="w-full border p-2 rounded" required />
      </div>
      <div class="mb-4">
        <label>Password</label>
        <input v-model="password" type="password" class="w-full border p-2 rounded" required />
      </div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '../api'
import { useRouter } from 'vue-router'
import { setAuth } from '../stores/auth'

const email = ref('')
const password = ref('')
const router = useRouter()

const submit = async () => {
  try {
    await login(email.value, password.value)
    setAuth(true)
    router.push('/')
  } catch (err) {
    // Already handled in api.js
  }
}
</script>

