# **App Name**: SpectacleAPI

## Core Features:

- Guided Analysis Workflow: Step-by-step UI that guides users through the API specification analysis process.
- Swagger/OpenAPI URL Input: Supports URL input (Swagger 2.0 / OpenAPI 3.0). Provides a helpful tip for VPN requirements. Gracefully handles VPN-restricted URLs, displaying an informative message if fetch fails.
- File Upload: Accepts local file uploads (.json, .yaml, .yml), supporting both drag-and-drop and file browser selection. Includes file type validation before parsing.
- API Insights Dashboard: Dashboard providing a summary of the API, including total controllers, total endpoints, and a count by method (GET, POST, PUT, DELETE). Highlights the largest controller and uses color-coded method badges.
- Detailed API Table: Displays API breakdown per controller and API details, including headers, parameters, request body, and required fields. Includes search and filter options and an export to CSV function.
- Clear Button: Provides a button to reset the UI and clear all input and rendered data.
- Backend Technology Identifier: Uses generative AI to identify the technology used on the back-end API, even when the server is unknown, by analyzing the request and response payloads using a LLM 'tool'.

## Style Guidelines:

- Primary color: Soft purple (#A093E1) to convey sophistication and clarity.
- Background color: Light gray (#F4F3F7) to provide a clean, neutral backdrop.
- Accent color: Teal (#45B8AC) to highlight interactive elements and important information.
- Headline font: 'Space Grotesk' (sans-serif) for headlines. Body font: 'Inter' (sans-serif) for body text, for a modern and readable feel.
- Minimalist line icons for a clean and modern look. Use icons consistently to represent different API methods and data types.
- Step-by-step layout that visually guides users through the analysis process. Utilize clear section dividers and whitespace to improve readability and reduce cognitive load.
- Subtle animations to enhance user experience, such as a loading spinner during API parsing and smooth transitions when displaying analysis results.