# CRM Application

A modern Customer Relationship Management system built with React and Node.js featuring AI-powered audience segmentation and email campaign generation.

![React](https://img.shields.io/badge/React-19.1.1-blue.svg)
![Vite](https://img.shields.io/badge/Vite-4.5.0-green.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)

## 🚀 Features

### 🔐 Authentication

- Secure login and registration
- JWT-based authentication
- User session management

### 🤖 AI-Powered Features

- **Natural Language Query**: Convert plain English to audience rules
  - Example: "People who haven't shopped in 6 months and spent over $500"
- **AI Email Generator**: Generate complete email campaigns with customizable tone and targeting

### 🎯 Audience Builder

- **Dynamic Rule Builder**: Create complex audience segments using flexible rule logic
- **Boolean Logic Support**: Use AND/OR operators for sophisticated targeting
- **AI Integration**: "Ask AI" button for natural language segment creation
- **Real-time Preview**: Calculate audience size before saving segments
- **Segment Management**: Save, search, and reuse audience segments

### 📧 Campaign Management

- Create and manage email campaigns
- AI-powered email content generation
- Target specific audience segments
- Campaign performance tracking

### 📊 Campaign History

- View all past campaigns and their performance
- Detailed delivery statistics (sent, delivered, opened, clicked)
- Campaign status tracking (active, completed, scheduled)
- Performance metrics and analytics

### 👥 Customer Management

- Customer database with profiles
- Customer interaction history
- Segmentation insights

## 🛠️ Technology Stack

### Frontend

- **React 19.1.1** with Hooks and modern patterns
- **Vite 4.5.0** for fast development and building
- **Tailwind CSS 3.3.0** for responsive styling
- **Lucide React** for consistent iconography
- **React Router DOM** for client-side routing

### Backend

- **Node.js** with Express.js framework
- **MongoDB Atlas** for cloud database
- **JWT** for secure authentication
- **bcryptjs** for password hashing
- **Joi** for data validation

### AI Features

- **Natural Language Processing** for audience segmentation
- **AI Content Generation** for email campaigns
- **Intelligent Query Parsing** for plain English rules

## 📦 Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn
- Git

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/SimarKochar/CRM-Frontend.git
   cd CRM-Frontend
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**

   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   Create `.env` file in backend directory:

   ```
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

5. **Start the Application**

   Terminal 1 (Backend):

   ```bash
   cd backend
   npm start
   ```

   Terminal 2 (Frontend):

   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173/CRM-Frontend/
   - Backend API: http://localhost:5000/api/

## 🎮 Usage

### Authentication

1. Register a new account or login with existing credentials
2. Navigate through the application using the header menu

### Creating Audience Segments

1. Go to **Audience Builder**
2. Use the **"Ask AI"** button for natural language queries
   - Example: "People who haven't purchased in 3 months"
3. Or manually create rules using the form
4. Save your segment for use in campaigns

### Creating Campaigns

1. Go to **Campaigns**
2. Fill in campaign details
3. Use **"AI Generate"** for AI-powered email content
4. Select target audience segment
5. Create and track your campaign

## 🏗️ Project Structure

```
CRM-Frontend/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Authentication middleware
│   └── server.js        # Express server
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   │   ├── Header.jsx
    │   │   ├── AIEmailGenerator.jsx
    │   │   └── NaturalLanguageQuery.jsx
    │   ├── pages/       # Main application pages
    │   │   ├── Login.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── AudienceBuilder.jsx
    │   │   ├── Campaigns.jsx
    │   │   ├── CampaignHistory.jsx
    │   │   └── Customers.jsx
    │   └── App.jsx      # Main app component
    └── public/          # Static assets
```

## 🎯 Key Components

### AudienceBuilder

- **AI Natural Language Query**: Convert plain English to segment rules
- **Dynamic Rule Builder**: Create complex audience segments
- **Boolean Logic Support**: Use AND/OR operators
- **Real-time Preview**: Calculate audience size before saving

### Campaigns

- **AI Email Generator**: Automated email content creation
- **Campaign Management**: Create and track email campaigns
- **Audience Integration**: Target specific segments

### Campaign History

- **Performance Analytics**: Track campaign metrics
- **Delivery Statistics**: Monitor sent, delivered, opened, clicked
- **Status Tracking**: Active, completed, scheduled campaigns

## 🚀 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/audience` - Get user's audience segments
- `POST /api/audience` - Create new audience segment
- `GET /api/campaigns` - Get user's campaigns
- `POST /api/campaigns` - Create new campaign

## 🚀 Available Scripts

### Backend

```bash
cd backend
npm start          # Start backend server
npm run dev        # Start with nodemon
```

### Frontend

```bash
cd frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code
```

## 🎨 Features Highlights

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **AI Integration**: Natural language processing for audience and content
- **Real-time Updates**: Live audience size calculations
- **Secure Authentication**: JWT-based user management
- **Interactive Elements**: Hover effects, transitions, and animations

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

- [ ] Advanced AI analytics and insights
- [ ] Email template builder with drag-and-drop
- [ ] A/B testing capabilities
- [ ] Real-time campaign performance dashboards
- [ ] Integration with external email services
- [ ] Advanced customer analytics and reporting

## 📞 Contact

For questions or support, please open an issue on GitHub.

- [ ] Advanced reporting dashboard
- [ ] Mobile app support

## 👨‍💻 Author

**Simar Kochar**

- GitHub: [@SimarKochar](https://github.com/SimarKochar)

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- Lucide for beautiful icons
- Vite for the fast build tool

---

**Built with ❤️ for modern campaign management**
