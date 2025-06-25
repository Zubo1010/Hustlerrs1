# Hustlerrs Frontend

A modern, student-friendly web application for connecting hustlers (students) with job givers in Bangladesh.

## 🚀 Features

### Homepage Dashboard
The homepage serves as a comprehensive dashboard for both Hustlerrs and Job Givers:

#### For All Users:
- **Dynamic Greeting Header**: Personalized greetings with time-based messages and quick stats
- **Quick Action Buttons**: Role-specific action cards with colorful icons and descriptions
- **Job Feed**: Facebook-style scrollable feed with search and filtering capabilities
- **Activity Overview**: Real-time statistics and progress tracking
- **Notifications Widget**: Recent alerts and reminders with expandable view
- **Quick Stats**: Profile completion, ratings, and member information
- **Help & Support**: Easy access to support resources

#### For Hustlerrs (Students):
- Weekly earnings display
- Job application tracking
- Find work opportunities
- View applications status
- Earnings dashboard
- Leaderboard access

#### For Job Givers:
- Monthly job posting stats
- Applicant management
- Job creation tools
- Analytics overview
- Applicant review system

## 🎨 Design Philosophy

- **Student-Friendly**: Casual, chill design with playful elements
- **Mobile-First**: Responsive design optimized for mobile devices
- **Accessibility**: Clear navigation and intuitive user experience
- **Performance**: Fast loading with smooth animations
- **Brand Identity**: Green and blue color scheme with modern gradients

## 🛠️ Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS with custom animations
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Fetch API with Axios
- **Real-time**: Socket.IO for chat functionality

## 📁 Project Structure

```
src/
├── components/
│   ├── dashboard/           # Dashboard-specific components
│   │   ├── GreetingHeader.jsx
│   │   ├── QuickActions.jsx
│   │   ├── JobFeed.jsx
│   │   ├── ActivityOverview.jsx
│   │   └── NotificationsWidget.jsx
│   ├── common/              # Reusable components
│   ├── job/                 # Job-related components
│   ├── profile/             # Profile components
│   └── layout/              # Layout components
├── pages/                   # Page components
├── contexts/                # React contexts
├── services/                # API services
├── hooks/                   # Custom hooks
├── utils/                   # Utility functions
└── assets/                  # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hustlerrs_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 🎯 Key Components

### GreetingHeader
- Dynamic time-based greetings
- Role-specific quick stats
- Gradient background with glass morphism effects

### QuickActions
- Colorful action cards with hover animations
- Role-specific actions (Hustler vs Job Giver)
- Responsive grid layout

### JobFeed
- Facebook-style job posts
- Search and filter functionality
- Job labels and badges
- Expandable descriptions
- Apply/Bid buttons

### ActivityOverview
- Real-time statistics
- Role-specific metrics
- Animated progress indicators

### NotificationsWidget
- Recent notifications display
- Expandable view
- Time-based formatting
- Type-specific icons and colors

## 🎨 Custom Styling

The application uses custom CSS animations and utility classes:

- **Slide-in animations**: For component entrance effects
- **Hover effects**: Lift and scale transformations
- **Gradient backgrounds**: Modern color schemes
- **Glass morphism**: Translucent card effects
- **Custom scrollbars**: Styled scrollbar components

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- Use functional components with hooks
- Follow React best practices
- Implement proper error handling
- Use TypeScript-like prop validation
- Maintain consistent naming conventions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📱 Mobile Responsiveness

The dashboard is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktop (1024px+)
- Large screens (1440px+)

## 🔒 Security

- JWT token authentication
- Protected routes
- Input validation
- XSS protection
- CSRF protection

## 📊 Performance

- Lazy loading for components
- Optimized images
- Efficient state management
- Minimal bundle size
- Fast loading times

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Errors**: Ensure the backend server is running
2. **Authentication Issues**: Clear localStorage and re-login
3. **Styling Issues**: Check Tailwind CSS configuration
4. **Build Errors**: Verify all dependencies are installed

### Debug Mode

Enable debug mode by setting:
```javascript
localStorage.setItem('debug', 'true');
```

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first styling
- Vite for the fast build tool
- All contributors and supporters

## Features

### Job Application System

The application system allows hustlers to apply for jobs with a smooth and respectful process:

#### For Hustlers:
- **Apply Button**: Click "Apply" on any job to open a confirmation modal
- **Application Modal**: 
  - Optional description box to write to the job giver
  - Bid input field (pre-filled with job price for fixed-price jobs)
  - Confirm & Apply button
- **Success Feedback**: Toast notification confirming successful application
- **My Applications Page**: Track all applications with real-time status updates
- **Application Management**: 
  - Edit message or bid (before acceptance)
  - Withdraw application (before acceptance)
  - View application status (Pending, Accepted, Rejected, Withdrawn)
- **Post-Acceptance**: 
  - "You've been hired!" status display
  - Direct messaging with job giver
  - Disabled editing after acceptance

#### For Job Givers:
- **View Applications**: See all applicants for their jobs
- **Application Details**: View bid amount, message, and applicant info
- **Accept/Reject**: Hire or decline applicants with one click
- **Messaging**: Direct communication with hired hustlers
- **Real-time Updates**: See application status changes immediately

#### Status Indicators:
- 🕒 **Pending**: Application under review
- ✅ **Accepted**: Hustler hired - messaging enabled
- 😔 **Rejected**: Not selected this time (friendly messaging)
- ↩️ **Withdrawn**: Application withdrawn by hustler

### Technical Implementation

#### Frontend Components:
- `ApplicationModal.jsx`: Modal for job application with bid and message
- `Toast.jsx`: Success/error notifications
- `MyApplications.jsx`: Hustler's application tracking page
- `BidList.jsx`: Job giver's application management interface

#### Backend Integration:
- Uses existing Bid model for applications
- Real-time status updates
- Notification system for job givers
- Proper authorization and validation

#### UI/UX Features:
- Friendly, respectful tone throughout
- Icon indicators for status updates
- Responsive design for all devices
- Smooth animations and transitions
- Clear call-to-action buttons

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. The application will be available at `http://localhost:5173`

## Usage

### For Hustlers:
1. Browse available jobs on the main page
2. Click "Apply" on any job that interests you
3. Fill in your bid amount and optional message
4. Submit your application
5. Track your applications in "My Applications"
6. Message job givers once hired

### For Job Givers:
1. Post jobs using the "Post a Job" button
2. View applications in "My Posted Jobs"
3. Review applicant bids and messages
4. Accept or reject applications
5. Message hired hustlers

## API Endpoints

- `POST /api/jobs/:id/apply` - Apply for a job
- `GET /api/jobs/my-applications` - Get user's applications
- `PUT /api/bids/:id/withdraw` - Withdraw application
- `PUT /api/bids/:id/status` - Update application status (accept/reject)
