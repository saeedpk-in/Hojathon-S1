# Shopmate — Agentic Commerce Assistant

## Project Overview

Shopmate is a stateful, autonomous, agentic web application designed to bridge the digital literacy gap in e-commerce. It allows users to shop entirely through natural language conversation, parsing their intents, discovering real-time products, securely remembering preferences across sessions, and completing the transaction without requiring complex app navigation.

This project was built for the **HOJATHON — Agentic AI Hackathon 2026, Series 01**.

## Problem Statement

Standard e-commerce apps assume comfort with app navigation, product comparison UIs, and complex digital checkout flows. First-time digital buyers and low-digital-literacy users (e.g., older users or those who prefer casual mixed-language text over structured UI forms) are effectively excluded from convenient online shopping. The barrier isn't the availability of products, but the interface itself.

## Proposed Solution

Shopmate replaces the traditional shopping interface with a simple, dynamic web chat. The user describes what they need in free-form language (including mixed English/Malayalam). The agentic AI:
1. Parses the goal and budget.
2. Calls external product APIs to find real items.
3. Decides the best match and explains why.
4. Remembers the user's preferences across messages using a MongoDB persistence layer.
5. Completes the transaction natively by generating a secure Razorpay checkout link.

By closing the loop from intent to transaction inside a single chat window, Shopmate removes all navigational friction.

## Key Features

* **Goal Understanding:** Uses Gemini to dynamically parse messy, casual, or mixed-language text into structured e-commerce queries (category & budget).
* **Tool Use & Autonomous Action:** Automatically queries the `fakestoreapi` to find real products and natively connects to `Razorpay` to generate live checkout links for the user.
* **Stateful Agent Memory:** Connects to MongoDB to intelligently remember user budgets and categories, ensuring users aren't forced to repeat themselves.
* **Persistent Chat History:** Seamlessly saves the entire conversation state in the database, safely restoring messages and product recommendations on browser refresh.
* **Dark-First Premium UI:** An immersive, clean conversational interface built with Vanilla CSS and Next.js, featuring animated micro-interactions.

## Technology Stack

* **AI / Decision Layer:** Google Gemini (3.6 Flash)
* **Framework:** Next.js (App Router) & React
* **Styling:** Vanilla CSS (Design system with tokens & glassmorphism)
* **Database:** MongoDB & Mongoose
* **Payment Gateway:** Razorpay SDK (Test Mode)
* **External APIs:** Fake Store API

## How to Run Locally

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Create a `.env` file in the root directory and add the following keys:
   ```env
   GEMINI_API_KEY=your_gemini_key
   MONGODB_URI=your_mongodb_connection_string
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```
4. Run `npm run dev` to start the development server.
5. Open `http://localhost:3000` to interact with Shopmate.
