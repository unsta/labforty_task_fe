import axios from 'axios'
import Swal from 'sweetalert2'
import {setAuth} from "./stores/auth.js";
import router from "./router/index.js";

axios.defaults.withCredentials = true

const API = axios.create({
    baseURL: 'http://localhost/api/v1',
    withCredentials: true,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
})

// Helper to get cookie by name
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
    return match ? decodeURIComponent(match[2]) : null
}

// Get CSRF cookie from Laravel Sanctum
export async function getCSRF() {
    await axios.get('http://localhost/sanctum/csrf-cookie', { withCredentials: true })
}

// Axios request interceptor to automatically add CSRF token header
API.interceptors.request.use(config => {
    const token = getCookie('XSRF-TOKEN')
    if (token) {
        config.headers['X-XSRF-TOKEN'] = token
    }
    return config
})

// Global response interceptor
API.interceptors.response.use(
    response => response,
    error => {
        const status = error.response?.status
        const message = error.response?.data?.message || 'An error occurred.'

        if (error.response && status === 401) {
            // Clear auth and redirect to login
            setAuth(false)
            localStorage.removeItem('user')

            Swal.fire({
                icon: 'warning',
                title: 'Session Expired',
                text: 'Please login again.',
                confirmButtonText: 'Login'
            }).then(() => {
                router.push('/login')
            })
        }

        else if (error.response && status === 403) {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: message,
                confirmButtonText: 'Ok',
            }).then(() => {
                router.push('/bookings')
            })
        }

        else if (error.response && status === 404) {
            Swal.fire({
                icon: 'error',
                title: 'Not Found',
                text: 'No query results',
                confirmButtonText: 'Ok',
            }).then(() => {
                router.push('/bookings')
            })
        }

        return Promise.reject(error)
    }
)

// Auth functions
export async function login(email, password) {
    await getCSRF()
    try {
        const response = await API.post('login', { email, password })

        const user = response.data.user
        localStorage.setItem('user', JSON.stringify(user))
        return response
    } catch (err) {
        Swal.fire('Login Failed', err.response?.data?.message || 'Unknown error', 'error')
        throw err
    }
}

export async function logout() {
    await getCSRF()
    return await API.post('logout')
}

// Booking API functions - ensure getCSRF() called before state-changing requests
export async function fetchBookings(params = {}) {
    return await API.get('list-booking-hours', { params })
}

export async function createBooking(data) {
    await getCSRF()
    return await API.post('store-booking-hour', data)
}

export async function getBooking(id) {
    return await API.get(`show-booking-hour/${id}`)
}

export async function updateBooking(id, data) {
    await getCSRF()
    return await API.patch(`update-booking-hour/${id}`, data)
}

export async function deleteBooking(id) {
    await getCSRF()
    return await API.delete(`destroy-booking-hour/${id}`)
}

export async function fetchNotificationTypes() {
    return await API.get('list-notification-types');
}

export async function fetchTimeSlots() {
    return await API.get('list-time-slots')
}
