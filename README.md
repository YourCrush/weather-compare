# Weather Comparison App

A comprehensive weather comparison application built with React, TypeScript, and Vite. Compare weather conditions across multiple locations with detailed forecasts, historical data, and interactive visualizations.

## 🌟 Features

### Core Functionality
- **Multi-Location Comparison**: Compare weather data for up to 3 locations simultaneously
- **Real-Time Weather Data**: Current conditions, temperature, humidity, wind, and more
- **7-Day Forecasts**: Detailed weekly weather predictions
- **Historical Data**: Access to past weather patterns and trends
- **Seasonal Analysis**: Year-over-year weather comparisons

### Views & Visualizations
- **Summary View**: At-a-glance comparison with key insights
- **Cards View**: Detailed weather cards for each location
- **Charts View**: Interactive charts and graphs using Recharts
- **Seasonal View**: Historical trends and seasonal patterns

### User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark/Light Mode**: Automatic theme switching with system preference detection
- **Accessibility**: WCAG AA compliant with full keyboard navigation
- **Offline Support**: Cached data for improved performance
- **Export & Sharing**: PNG exports and shareable comparison links

### Advanced Features
- **Favorites Management**: Save frequently compared locations
- **Unit Conversion**: Metric/Imperial unit switching
- **Performance Monitoring**: Real-time performance metrics (development)
- **Error Recovery**: Comprehensive error handling with retry mechanisms
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- npm 8.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/weather-comparison-app.git
   cd weather-comparison-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview

# Build with GitHub Pages optimization
npm run build:github
```

## 📱 Usage

### Adding Locations
1. Use the search bar to find locations by name
2. Select from the autocomplete suggestions
3. Click "Add Location" or press Enter
4. Maximum of 3 locations can be compared simultaneously

### Switching Views
- **Summary**: Overview with key comparisons and insights
- **Cards**: Detailed weather information in card format
- **Charts**: Interactive visualizations and trends
- **Seasonal**: Historical patterns and year-over-year analysis

### Managing Favorites
1. Click the heart icon next to any location to add to favorites
2. Access favorites via the favorites menu in the header
3. Quick-add favorite locations to your current comparison

### Customizing Settings
- **Units**: Switch between Metric (°C, km/h) and Imperial (°F, mph)
- **Theme**: Choose Light, Dark, or System preference
- **Default View**: Set your preferred starting view
- **Auto-refresh**: Configure automatic data updates

### Exporting & Sharing
1. Click the export button in the header
2. Choose from PNG image export or CSV data export
3. Generate shareable links to send comparisons to others

## 🛠️ Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Cards/          # Weather card components
│   ├── Charts/         # Chart and visualization components
│   ├── Export/         # Export and sharing functionality
│   ├── Favorites/      # Favorites management
│   ├── Layout/         # Layout components (Header, Footer, etc.)
│   ├── Loading/        # Loading states and spinners
│   ├── Settings/       # Settings and preferences
│   ├── Summary/        # Summary view components
│   └── Views/          # Main view components
├── context/            # React Context providers
├── hooks/              # Custom React hooks
├── services/           # API services and data fetching
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
└── __tests__/          # Test files
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run preview         # Preview production build

# Testing
npm run test            # Run tests in watch mode
npm run test:ci         # Run tests with coverage
npm run test:ui         # Open Vitest UI

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # Run TypeScript type checking
npm run format          # Format code with Prettier

# Analysis
npm run analyze         # Analyze bundle size
```

### Testing

The project includes comprehensive testing:

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API service and data flow tests
- **Accessibility Tests**: WCAG compliance testing with jest-axe
- **Performance Tests**: Bundle size and performance monitoring
- **E2E Tests**: User flow and interaction testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:ci

# Run specific test file
npm run test weather.test.ts
```

### Performance Optimization

The app includes several performance optimizations:

- **Code Splitting**: Lazy loading of views and components
- **Bundle Optimization**: Separate chunks for vendor libraries
- **Caching**: Multi-level caching with TTL and LRU strategies
- **Image Optimization**: Lazy loading and responsive images
- **Tree Shaking**: Unused code elimination
- **Compression**: Gzip compression for production builds

## 🌐 Deployment

### GitHub Pages (Recommended)

The app is configured for automatic deployment to GitHub Pages:

1. **Enable GitHub Pages** in your repository settings
2. **Push to main branch** - GitHub Actions will automatically build and deploy
3. **Custom domain** (optional): Add a `CNAME` file to the `public` directory

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy to your hosting provider
# Upload the contents of the `dist` directory
```

### Environment Variables

Create a `.env` file for local development:

```env
# API Configuration
VITE_WEATHER_API_URL=https://api.open-meteo.com/v1
VITE_GEOCODING_API_URL=https://geocoding-api.open-meteo.com/v1

# Analytics (optional)
VITE_GA_TRACKING_ID=your-google-analytics-id

# Feature Flags
VITE_ENABLE_PERFORMANCE_MONITOR=true
VITE_ENABLE_EXPORT_FEATURES=true
```

## 🔧 Configuration

### Customizing the App

#### Adding New Weather Parameters
1. Update the `WeatherData` type in `src/types/weather.ts`
2. Modify the API service in `src/services/weatherService.ts`
3. Update components to display the new data

#### Adding New Chart Types
1. Create a new chart component in `src/components/Charts/`
2. Add the chart to the Charts view
3. Update the chart controls and settings

#### Customizing Themes
1. Modify Tailwind configuration in `tailwind.config.js`
2. Update CSS custom properties in `src/index.css`
3. Add new theme options to the settings

## 📊 API Integration

The app uses the Open-Meteo API for weather data:

- **Current Weather**: Real-time conditions
- **Forecasts**: 7-day weather predictions
- **Historical Data**: Past weather information
- **Geocoding**: Location search and coordinates

### Rate Limiting
- The API has generous rate limits for non-commercial use
- Caching is implemented to minimize API calls
- Retry logic handles temporary failures

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `npm run test:ci`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write tests for new functionality
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Open-Meteo**: Free weather API service
- **Recharts**: React charting library
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server
- **React**: UI library
- **TypeScript**: Type-safe JavaScript

## 📞 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join the conversation in GitHub Discussions

## 🗺️ Roadmap

### Upcoming Features
- [ ] Weather alerts and notifications
- [ ] Radar and satellite imagery
- [ ] Weather maps integration
- [ ] Mobile app (React Native)
- [ ] API for third-party integrations
- [ ] Advanced analytics and insights

### Performance Improvements
- [ ] Service Worker for offline functionality
- [ ] WebAssembly for complex calculations
- [ ] CDN integration for global performance
- [ ] Advanced caching strategies

---

**Built with ❤️ by the Weather Comparison Team**