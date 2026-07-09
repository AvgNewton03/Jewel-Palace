# Jewel Palace ✧ Exquisite Imitation Jewellery

Welcome to **Jewel Palace**, an elegant, high-end e-commerce platform dedicated to offering festive, vibrant, and meticulously crafted imitation jewellery. From royal wedding ensembles and heavy festive wear to lightweight casual pieces, Jewel Palace blends authentic artisan craftsmanship with modern web design.

---

## About Jewel Palace

Jewel Palace is designed to bring out the queen in you. We showcase collections crafted with premium stones, intricate meenakari, and anti-tarnish gold plating. 

Our website provides a premium, immersive shopping experience featuring:
* **Curated Occasion Categories**: Easily browse and filter jewellery collections designed specifically for weddings, casual outings, or heavy traditional events.
* **Premium Dark Mode**: Toggle between a bright layout and a luxurious, warm dark espresso-to-black radial gradient theme featuring gold headings and frosted-glass transparency effects.
* **Seamless Checkout & Cart**: Manage items, quantity, and wishlists effortlessly with a sliding cart drawer and quick-view modals.
* **Customer Gallery**: A community hub displaying real-world photos and testimonials of customers showcasing our pieces.
* **Direct Assistance**: Integrated WhatsApp button for instant support from our sales and customer service team.
* **Admin Control Center**: Built-in dashboard to add new items, monitor orders, publish reviews, and manage inventory.

---

## Technical Stack & Infrastructure

Jewel Palace is built as a modern, full-stack JavaScript application using:

* **Frontend**: [Next.js](https://nextjs.org/) (App Router & React 19) styled with [Tailwind CSS v4](https://tailwindcss.com/) for fluid layouts, customized glassmorphic headers, and smooth transitions.
* **Icons**: [Lucide React](https://lucide.dev/) for crisp, scalable vectors.
* **Backend**: Node.js and Express RESTful API server.
* **Database**: MongoDB (Mongoose ODM) storing product documents, order entries, and review submissions.
* **Authentication**: Firebase Authentication integrated with Firebase Admin SDK server-side.
* **Media Cloud**: Cloudinary hosting high-resolution optimized images.
* **Payment Gateway**: Razorpay webhook-powered payment checkout.

---

## Getting Started

### Prerequisites

* Node.js (v18 or higher recommended)
* MongoDB connection URI
* Firebase Service Account configuration
* Cloudinary API keys
* Razorpay API keys

### Setup Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/AvgNewton03/Jewel-Palace.git
   cd Jewel-Palace
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` in the root folder and a `.env` in the `backend` folder containing your MongoDB URIs, Firebase service account credentials, Cloudinary tokens, and Razorpay secrets.

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Launch the Application**:
   Start both the backend server and Next.js frontend developer compiler simultaneously:
   ```bash
   # Terminal 1: Starts Node/Express Server
   npm run server

   # Terminal 2: Starts Next.js Development Server
   npm run dev
   ```

5. **Access Local Server**:
   Open [http://localhost:3000](http://localhost:3000) in your web browser to explore.
