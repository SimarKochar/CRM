# Mini CRM - Campaign Management Platform

A modern, responsive Customer Relationship Management (CRM) platform focused on audience segmentation and campaign management. Built with React, Vite, and Tailwind CSS.

![Mini CRM](https://img.shields.io/badge/React-19.1.1-blue.svg)
![Vite](https://img.shields.io/badge/Vite-4.5.0-green.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.0-blue.svg)

## 🚀 Features

### 🔐 Authentication
- Secure login interface
- User session management
- Demo credentials for testing

### 🎯 Audience Builder (Main Feature)
- **Dynamic Rule Builder**: Create complex audience segments using flexible rule logic
- **Boolean Logic Support**: Use AND/OR operators for sophisticated targeting
- **Real-time Preview**: Calculate audience size before saving segments
- **Rule Examples**: 
  - `spend > INR 10,000 AND visits < 3`
  - `inactive for 90 days OR cart abandoned`
- **Segment Management**: Save, search, and reuse audience segments

### 📊 Campaign History
- View all past campaigns and their performance
- Detailed delivery statistics (sent, delivered, opened, clicked)
- Campaign status tracking (active, completed, scheduled)
- Performance metrics and analytics

## 🛠️ Technology Stack

- **Frontend**: React 19.1.1 with Hooks
- **Build Tool**: Vite 4.5.0
- **Styling**: Tailwind CSS 3.3.0
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React useState/useEffect

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/SimarKochar/CRM-Frontend.git
   cd CRM-Frontend
   ```

2. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🎮 Usage

### Getting Started
1. **Login**: Use demo credentials (demo@example.com / password)
2. **Build Audience**: Create customer segments with rule-based logic
3. **Preview**: Check audience size before saving
4. **View History**: Monitor campaign performance and results

### Demo Credentials
- **Email**: demo@example.com
- **Password**: password

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # Navigation header
│   │   ├── LoadingSkeleton.jsx # Loading states
│   │   ├── Modal.jsx           # Modal dialogs
│   │   └── Notification.jsx    # Toast notifications
│   ├── pages/
│   │   ├── Login.jsx           # Authentication page
│   │   ├── AudienceBuilder.jsx # Main segment creation page
│   │   └── CampaignHistory.jsx # Campaign results page
│   ├── App.jsx                 # Main app component
│   └── main.jsx               # Entry point
├── public/                     # Static assets
├── package.json               # Dependencies
└── vite.config.js            # Vite configuration
```

## 🎯 Key Components

### AudienceBuilder
The main interactive component allowing users to:
- Define audience segments using flexible rule logic
- Add multiple conditions with AND/OR operators
- Preview audience size in real-time
- Save and manage segments

### CampaignHistory
Displays comprehensive campaign analytics:
- Campaign performance metrics
- Delivery statistics
- Historical data visualization
- Status tracking

### Login
Secure authentication with:
- Form validation
- Loading states
- Error handling
- Demo account access

## 🚀 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **Interactive Elements**: Hover effects, transitions, and animations
- **Loading States**: Skeleton loaders and progress indicators
- **Toast Notifications**: User feedback for actions
- **Search & Filter**: Quick access to segments and campaigns

## 📈 Performance

- **Fast Build Times**: Vite for lightning-fast development
- **Optimized Bundle**: Production-ready code splitting
- **Responsive Images**: Optimized asset loading
- **Lazy Loading**: Components loaded on demand

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔮 Future Enhancements

- [ ] Backend API integration
- [ ] Real-time campaign analytics
- [ ] Email template builder
- [ ] A/B testing capabilities
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
