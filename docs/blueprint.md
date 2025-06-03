# **App Name**: Yoinked

## Core Features:

- Landing Page: Landing page with input fields for email subject, message body, and recipient list (comma-separated). Displays status messages.
- Campaign Persistence: Utilize LocalStorage to persist campaign data (subject, message, recipient list). Auto-loads when the page is reopened. A reset/clear option can delete everything from the localstorage. 
- Email Sending Logic: Upon clicking 'Send,' the app sends a POST request to a Netlify Function backend endpoint (`/sendEmail`).  The 'to' field is automatically populated with emails that appear invalid (emails without the proper '@' symbol or with spaces in them). A status log indicates which recipient emails had issues
- Backend (Netlify Function): Netlify Function located at `/netlify/functions/sendEmail.js` which accepts `to`, `subject`, and `text` in a JSON body. Employs environment variables for SMTP credentials (sender email and password). Uses Nodemailer to dispatch emails, responding with a JSON indicating success or failure. This backend component tool incorporates logic to manage email dispatches without exposing SMTP credentials directly.
- Email Error Auto-Clean: The AI runs using LLMs, specifically checking the return status from all outgoing emails to identify invalid addresses (as flagged by a failure to deliver), and removing them from local storage and recipient list in the app.

## Style Guidelines:

- Primary color: Saturated blue (#4285F4), reminiscent of classic web interfaces but refreshed for a Gen Z audience, suggesting reliability and innovation.
- Background color: Light gray (#F5F5F5), offering a clean and modern backdrop that doesn't distract from the interface's elements.
- Accent color: A vibrant violet (#A78BFA), used for interactive elements and highlights to add a playful yet sophisticated touch.
- Use a bold, sans-serif font to ensure readability and align with Gen Z aesthetics. 
- Simple, outline-style icons for clarity and a modern feel. 
- A clean, single-page layout with a clear hierarchy to focus on essential functions.
- Subtle, micro-interactions and loading animations to enhance user experience without being distracting.