# Booking API FE
### *Vue 3 + Vite + TailwindCSS + Axios + SweetAlert2*

## Requirements:
- First you need to set up the Laravel API https://github.com/unsta/labforty_task_api

## Project Set Up:

### Clone the project

    git clone git@github.com:unsta/labforty_task_fe.git

### From the project directory run

    npm install

### Run local development server

    npm run dev

Usually the local address will be http://localhost:5173/ (The port might be different)

If the port is NOT in the range of :5170-:5185, then you need to check the configurations in the Laravel API: `config/sanctum.php` and `config/cors.php`

## Users:
- john.doe@labforty.com | password | Role: User
- jane.doe@labforty.com | password456 | Role: User
- bob.bobber@labforty.com | password123 | Role: Admin

Note: The `role:user` can list/update/view/delete own bookings only!

Note: The `role:admin` can only list and view all bookings! (the list endpoint has extended filters) 

