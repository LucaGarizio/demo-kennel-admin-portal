# 🐾 Il Pioppeto – Kennel Management System

![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white) 
![PocketBase](https://img.shields.io/badge/PocketBase-B8E986?style=for-the-badge&logo=pocketbase&logoColor=black)
![PrimeNG](https://img.shields.io/badge/PrimeNG-20232A?style=for-the-badge&logo=primeng&logoColor=white)

Welcome to the **Kennel Administration Portal** for "Il Pioppeto"! 
This system is an **internal, full-stack management application designed exclusively for the kennel staff**. It replaces traditional paper-based methods with a modern, digital-first approach to streamline the daily administrative operations of a professional dog boarding facility. 

*(Note: This is an administrative back-office portal, not a public-facing website for online customer bookings.)*

---

## 🚀 Key Features for Administrators

### 🐕 Comprehensive Guest & Owner Records
Staff can manage detailed internal records for every dog (including breed, size, microchip, vaccinations, and specific behaviors) alongside their respective owners' contact and document information.

### ✍️ Remote Digital Signatures for Check-in
A seamless, paperless workflow for the staff! When a customer arrives or books via phone, the administrator can generate a temporary "signature session". This allows the owner to securely sign the kennel's terms and conditions on a tablet or smartphone provided by the staff, or via a remote link, instantly binding the signature to their internal profile.

### 🏨 Internal Booking & Anti-Conflict System
Staff can register upcoming stays with automatic cost calculations based on the dog's size. The integrated **Stay Logic Service** acts as an administrative safeguard: it actively monitors internal availability, preventing staff from accidentally double-booking a single kennel while intelligently allowing consensual overrides when assigning dogs to shared **Double Kennels** (e.g., dogs from the same family).

### 🗓️ Interactive Kennel Schedule (Gantt View)
A powerful visual dashboard for the facility manager. View occupancy across all areas and boxes in a dynamic timeline. Easily adjust dates or move dogs between kennels using intuitive **Drag & Drop** mechanics, with the system instantly recalculating costs and verifying availability behind the scenes.

### 📱 Premium "Mobile-First" Design for Staff
Designed for kennel staff working on the move around the facility. The UI leverages **PrimeNG** and a custom SCSS architecture to deliver a native-app feel on smartphones, featuring floating action buttons (FABs) and touch-friendly navigation, allowing staff to update records directly from the dog enclosures.

---

## 🛠️ Technology Stack

This project leverages a modern, robust, and lightning-fast technology stack:

- **Frontend:** Angular 19+ (utilizing Standalone Components and Signals for optimal performance).
- **UI Framework:** PrimeNG & PrimeFlex for a rich, accessible, and highly customizable interface.
- **Backend & Database:** PocketBase – An open-source, serverless Go backend with an embedded SQLite database, handling real-time data, authentication, and file storage effortlessly.

---

## ⚙️ Getting Started

Follow these steps to get a local development environment running:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Angular CLI](https://angular.io/cli)
- A running instance of PocketBase.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/TUA_ORG/demo-kennel-admin-portal.git
   cd demo-kennel-admin-portal/front-end
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the Environment:**
   Update the `src/environments/environment.ts` file to point to your PocketBase instance:
   ```typescript
   export const environment = {
     production: false,
     pbUrl: 'http://127.0.0.1:8090', // Replace with your PocketBase URL
   };
   ```

4. **Run the Application:**
   ```bash
   ng serve
   ```
   Open your browser and navigate to `http://localhost:4200/`.

---
*Built with passion for the well-being of dogs and the people who care for them.* 🐶❤️
