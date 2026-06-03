# FullMark - Premium 3D Authentication System

A premium, interactive, and fully responsive 3D-themed authentication system built with **Vite + React 19**, **Tailwind CSS v4**, **Framer Motion**, and **Formik + Yup**.

---

## 🚀 Key Features

### 1. Dynamic Role-Based Login (`Login.jsx`)
- **Interactive Tabs:** Switch between **Student, Teacher, Admin, and Parent** roles.
- **Adaptive Color Themes:** The background nebulae, card borders, input focus states, forgot password links, and secondary buttons dynamically adapt their styling, glow, and borders to match the selected role color:
  - **Student:** Emerald Green
  - **Teacher:** Royal Blue
  - **Admin:** Crimson Red
  - **Parent:** Vivid Purple
- **Interactive Flowing Title:** Features a dynamic text gradient that plays a smooth color flow animation shortly after load.

### 2. Multi-Step Registration Wizard (`Register.jsx`)
- **2-Step Setup:**
  - **Step 1 (Personal Info):** Name, Email, and Phone number.
  - **Step 2 (Credentials):** Password, Confirm Password, and Terms & Privacy policy checkbox.
- **Progress Indicator:** Clean indicator tracking active steps, animating a gradient link line between steps. Once a step is completed, the step circle turns into a checkmark (`✓`).
- **Conditional Validation:** The final "Create Account" button is dynamically disabled until the Terms agreement checkbox is checked.

### 3. Forgot Password Flow (`ForgotPassword.jsx`)
- **Lock Icon Float:** A glowing purple lock icon positioned at the top that floats smoothly and continuously along the Y-axis.
- **Instructions Walkthrough:** An indicator card mapping out the steps to request, verify, and recreate account passwords.

---

## 🎨 Design System & Custom UI Components

### Floating Inputs (`Input.jsx`)
- **Floating Labels:** Uses spring-based physics to smoothly float the label up (`y: -30.5`) and resize on focus or when input is present.
- **Autofill Overrides:** Bypasses default browser autofill values (which usually apply harsh solid white backgrounds) to preserve the dark theme styling.

### Tactile 3D Buttons (`Button.jsx`)
- **Primary Buttons:** Rich, saturated-to-neon linear gradients (`linear-gradient(135deg, ...)`) with a custom inset top highlight border and matching blurred box-shadow halos (`box-shadow: 0 0 20px rgba(..., 0.5)`).
- **Secondary Buttons:** Pill-shaped, semi-transparent outline buttons whose border, text, and glowing hover states adapt to the active role.
- **Micro-Animations:** Buttons elevate slightly on hover (`translateY(-2px)`) and depress slightly on click (`translateY(1px)`).

---

## 📁 Folder Structure

```bash
src/
├── components/
│   ├── auth/
│   │   └── RoleSelector.jsx   # Role tab selection component
│   ├── shared/
│   │   └── Background3D.jsx   # Canvas-based 3D starry nebula backdrop
│   └── ui/
│       ├── Button.jsx         # Custom pill-shaped primary & secondary buttons
│       └── Input.jsx          # Custom floating label input fields
├── pages/
│   └── auth/
│       ├── Login.jsx          # Dynamic Role-based login screen
│       ├── Register.jsx       # 2-Step multi-step sign up wizard
│       └── ForgotPassword.jsx # Recovery flow page with floating animations
├── routes/
│   └── AppRoutes.jsx          # React Router route paths config
├── index.css                  # Tailored gradient tokens, glow shadows, & animation rules
└── App.jsx                    # Main entry point mapping routing
```

---

## ⚙️ Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
# fullmark
