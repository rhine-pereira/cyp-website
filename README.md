# CYP Vasai - Christian Youth in Power

[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-Private-red.svg)](LICENSE)

> A comprehensive web platform for the Catholic Youth in Power (CYP) Vasai community, empowering young people through faith, fellowship, and service.

🌐 **Live Site:** [www.cypvasai.org](https://www.cypvasai.org)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Key Features in Detail](#-key-features-in-detail)
- [Scripts & Automation](#-scripts--automation)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Features

### 🎟️ Lottery Management System
- **Real-time ticket booking** with live availability updates
- **Scalable architecture** supporting 1,000+ tickets and 100+ concurrent users
- **Automated e-ticket generation** and email delivery via Resend
- **Order tracking** with unique confirmation codes
- **Admin dashboard** for ticket management and monitoring
- **Google Sheets integration** for sales tracking and analytics
- **Sequential ticket numbering** with configurable ranges
- See [LOTTERY-SCALING.md](LOTTERY-SCALING.md) for scaling documentation

### 🎫 Event Management
- Dynamic event creation and management
- Event registration with form submissions
- SEO-optimized event pages with metadata
- Event categorization and filtering
- Responsive event calendar and listings

### 📝 Dynamic Form Builder
- Custom form creation with drag-and-drop interface
- Multiple field types (text, email, phone, checkbox, radio, textarea)
- Real-time form submissions storage
- Admin dashboard for viewing submissions
- Export capabilities for form data

### 💰 Fundraiser & E-commerce
- Product catalog management
- Shopping cart functionality
- Integrated payment processing
- Order management system
- Product inventory tracking
- Donation capabilities

### 📸 Media Gallery
- **Google Photos integration** for seamless photo management
- Multi-category gallery organization
- Album-based photo collections
- Responsive image grid layouts
- HEIC image format support with automatic conversion
- Video content support

### 🎥 CYP Talks (Video Platform)
- Video streaming with HLS support
- Secure video delivery via CloudFront
- Talk categorization and search
- Video player with custom controls
- Social sharing capabilities
- Watch history tracking

### 👥 Team Management
- Multiple ministry team profiles
- Team member showcases
- Dynamic team pages with custom theming
- Role-based information display

### 🔐 Authentication & Security
- Firebase authentication integration
- Role-based access control (Admin, Editor, Viewer)
- Secure API endpoints
- Protected admin routes
- Session management

### 📧 Member Management
- New member registration portal
- Email notifications for submissions
- Database integration for member records
- Contact form submissions

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16.1** - React framework with App Router
- **React 19.1** - UI library
- **TypeScript 5.9** - Type-safe development
- **Tailwind CSS 4.1** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Hook Form + Zod** - Form validation

### Backend & Services
- **Supabase** - Database and real-time subscriptions
- **Firebase** - Authentication and admin SDK
- **Appwrite** - Additional backend services
- **AWS S3 + CloudFront** - Media storage and CDN
- **Google APIs** - Photos, Sheets, and OAuth integration
- **Resend** - Transactional email service
- **Nodemailer** - Email automation

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Turbopack** - Fast build tooling
- **pnpm** - Package management
- **tsx** - TypeScript execution for scripts

---

## 🚀 Getting Started



## 📁 Project Structure

```
cyp-website/
├── public/                      # Static assets
│   ├── fonts/                   # Custom fonts
│   └── manifest.json           # PWA manifest
├── scripts/                     # Automation scripts
│   ├── add-lottery-product.ts  # Lottery product setup
│   ├── add-more-tickets.ts     # Scale lottery tickets
│   ├── initialize-lottery-tickets-supabase.ts
│   ├── sync-lottery-to-sheets.ts
│   └── verify-production-ready.ts
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin dashboard
│   │   │   ├── events/        # Event management
│   │   │   ├── forms/         # Form builder
│   │   │   ├── fundraiser/    # Product management
│   │   │   ├── gallery/       # Gallery admin
│   │   │   ├── lottery/       # Lottery admin
│   │   │   └── talks/         # Video management
│   │   ├── api/               # API routes
│   │   │   ├── events/        # Event APIs
│   │   │   ├── forms/         # Form submission APIs
│   │   │   ├── lottery/       # Lottery booking APIs
│   │   │   ├── gallery/       # Gallery APIs
│   │   │   └── upload/        # File upload APIs
│   │   ├── components/        # Shared components
│   │   │   ├── Auth/          # Authentication components
│   │   │   ├── FormBuilder/   # Form builder components
│   │   │   ├── Gallery/       # Gallery components
│   │   │   └── ui/            # UI primitives
│   │   ├── events/            # Events section
│   │   ├── forms/             # Dynamic forms
│   │   ├── fundraiser/        # E-commerce
│   │   ├── gallery/           # Media gallery
│   │   ├── lottery/           # Lottery booking
│   │   ├── talks/             # Video platform
│   │   └── join/              # Member registration
│   ├── lib/                   # Utility libraries
│   │   ├── firebase.ts        # Firebase client
│   │   ├── firebase-admin.ts  # Firebase admin
│   │   ├── supabase.ts        # Supabase client
│   │   ├── s3.ts              # AWS S3 client
│   │   ├── google-sheets.ts   # Sheets integration
│   │   └── google-photos-client.ts
│   └── types/                 # TypeScript definitions
├── cgs_schema.sql             # Database schema
├── LOTTERY-SCALING.md         # Lottery scaling guide
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies
```

---

## 🎯 Key Features in Detail

### Lottery System Architecture

The lottery system is designed for high scalability and reliability:

- **Real-time Updates**: Uses Supabase real-time subscriptions for live ticket availability
- **Optimistic Locking**: Prevents double-booking with database-level constraints
- **Configurable Ranges**: Easy ticket range configuration in frontend
- **E-ticket Generation**: Automated ticket generation with unique codes
- **Email Integration**: Automatic confirmation emails via Resend
- **Admin Tools**: Comprehensive admin dashboard for monitoring and management
- **Analytics**: Google Sheets integration for real-time sales tracking

**Capacity:**
- ✅ Tested with 1,000+ tickets
- ✅ Handles 100+ concurrent users
- ✅ Unlimited scalability with configurable ranges

See [LOTTERY-SCALING.md](LOTTERY-SCALING.md) for detailed documentation.

### Video Streaming (CYP Talks)

- **HLS Streaming**: Adaptive bitrate streaming for optimal playback
- **Secure Delivery**: CloudFront signed URLs for content protection
- **Video Management**: Upload, organize, and categorize talks
- **Custom Player**: Built with hls.js for cross-browser compatibility
- **Social Sharing**: Share talks via social media platforms
- **No Download Protection**: Prevents unauthorized downloads

### Google Photos Integration

- **OAuth 2.0 Authentication**: Secure access to Google Photos
- **Album Sync**: Automatic synchronization of photo albums
- **HEIC Support**: Converts HEIC images to web-compatible formats
- **Caching**: Efficient caching for improved performance
- **Category Organization**: Organize photos by event categories

---

## 🔧 Scripts & Automation

### Lottery Management

```bash
# Initialize lottery tickets in database
pnpm tsx scripts/initialize-lottery-tickets-supabase.ts

# Add more tickets (scale up)
pnpm tsx scripts/add-more-tickets.ts

# Sync lottery data to Google Sheets
pnpm tsx scripts/sync-lottery-to-sheets.ts

# Resend e-tickets
pnpm tsx scripts/resend-lottery-etickets.ts

# Check confirmed orders
pnpm tsx scripts/check-confirmed-orders.ts

# Cleanup old data
pnpm tsx scripts/cleanup-lottery-data.ts

# Reset tickets (development only)
pnpm tsx scripts/reset-lottery-tickets.ts
```

### Other Scripts

```bash
# Upload images to Google Sheets
pnpm tsx scripts/upload-images-to-sheets.ts

# Verify production readiness
pnpm tsx scripts/verify-production-ready.ts
```

---

## ⚙️ Configuration

### Next.js Configuration

The `next.config.ts` file includes:
- Image optimization settings
- Remote image patterns for external sources
- Environment variable configuration
- Redirect rules
- Headers for security

### Database Schema

The `cgs_schema.sql` file contains the complete database schema for:
- User authentication
- Event management
- Form submissions
- Lottery tickets and orders
- Gallery metadata
- Video content

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   ```bash
   vercel
   ```

2. **Set Environment Variables**
   - Add all environment variables in the Vercel dashboard
   - Ensure production URLs are configured

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Start production server**
   ```bash
   pnpm start
   ```

### Environment Setup

Ensure all environment variables are configured in your deployment platform:
- Firebase credentials
- Supabase keys
- AWS credentials
- Google API credentials
- Email service configuration

---

## 🤝 Contributing

### Development Workflow

1. Create a feature branch
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes with proper TypeScript types

3. Test thoroughly in development
   ```bash
   pnpm dev
   ```

4. Lint your code
   ```bash
   pnpm lint
   ```

5. Commit with descriptive messages
   ```bash
   git commit -m "feat: add new feature description"
   ```

6. Push and create a pull request
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Standards

- Use TypeScript for all new code
- Follow the existing code structure and patterns
- Add proper error handling
- Include JSDoc comments for complex functions
- Maintain responsive design principles

---

## 📄 License

This project is private and proprietary to Christian Youth in Power (CYP) Vasai.

---

## 📞 Contact & Support

- **Website:** [www.cypvasai.org](https://www.cypvasai.org)
- **Meetings:** Every Monday at 7 PM
- **Community:** Catholic Youth in Power, Vasai

---

## 🙏 Acknowledgments

Built with love for the CYP Vasai community to empower young people through faith, fellowship, and service.

---

**Made with ❤️ by the CYP Tech Team**
