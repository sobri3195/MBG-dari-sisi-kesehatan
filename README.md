# MBG Health Security System

Sistem Pengamanan Kesehatan MBG - Comprehensive Health Security System untuk monitoring dan manajemen kesehatan personel dalam kegiatan MBG (Military/Government/Business operations).

## 🚀 Features

- **Pre-Event Health Screening** - Pendaftaran dan skrining kesehatan personel dengan pemberian QR code clearance
- **Entry Health Security Check** - Validasi QR code dan rapid triage di checkpoint
- **On-Site Monitoring** - Tracking insiden kesehatan real-time dan medical response
- **Medical Posts Management** - Manajemen pos kesehatan dan inventory
- **Reports & Analytics** - Dashboard komprehensif dengan statistik dan visualisasi data

## 🛠️ Tech Stack

- **React 18** - Modern UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization
- **QRCode** - QR code generation
- **LocalStorage** - Client-side data persistence

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌐 Deploy to Netlify

### Option 1: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

### Option 2: Deploy via Git

1. Push your code to GitHub/GitLab/Bitbucket
2. Go to [Netlify](https://app.netlify.com)
3. Click "New site from Git"
4. Choose your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Option 3: Drag & Drop

1. Build the project: `npm run build`
2. Go to [Netlify Drop](https://app.netlify.com/drop)
3. Drag the `dist` folder to the upload area

## 📱 Usage

### 1. Register Personnel
- Go to "Data Personel" → "Tambah Personel"
- Fill in personnel details and health profile
- Submit to register

### 2. Health Screening
- Select personnel from list
- Click "Skrining" button
- Fill in vital signs and health assessment
- System will generate QR code clearance if approved

### 3. Entry Check
- Go to "Entry Check" → "Entry Check Baru"
- Scan or input QR code from health clearance
- Perform rapid triage
- Record decision (Approved/Observation/Rejected)

### 4. Incident Reporting
- Go to "Insiden" → "Lapor Insiden"
- Select affected personnel
- Fill in incident details
- Record actions taken and outcome

### 5. View Dashboard
- Real-time statistics
- Personnel by category
- Recent incidents and entry checks
- Health clearance status

## 🗂️ Project Structure

```
/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── lib/            # Utilities and services
│   │   ├── api.ts         # API wrapper
│   │   ├── dataService.ts # Data service layer
│   │   ├── storage.ts     # LocalStorage utilities
│   │   └── utils.ts       # Helper functions
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app component
│   └── main.tsx        # App entry point
├── docs/               # Documentation (SOPs)
├── public/             # Static assets
├── index.html          # HTML entry point
├── netlify.toml        # Netlify configuration
├── package.json        # Dependencies
├── tsconfig.json       # TypeScript config
├── tailwind.config.js  # Tailwind config
└── vite.config.ts      # Vite config
```

## 💾 Data Storage

This application uses **browser LocalStorage** for data persistence. Data is stored on the client-side and will persist across browser sessions on the same device.

**Important Notes:**
- Data is device-specific (not synced across devices)
- Clearing browser data will delete all records
- For production use, consider implementing a backend with database
- Current implementation is suitable for demo, training, or single-device usage

## 🔒 Data Schema

### Personnel
- Personal information (name, rank, unit, category)
- Contact details (phone, email)
- Health profile (medical history, allergies, medications)

### Health Screening
- Vital signs (blood pressure, heart rate, temperature, BMI, O2 saturation)
- Fitness status and duty recommendation
- Screener information

### Health Clearance
- QR code for validation
- Validity period (7 days default)
- Status (Valid/Expired/Revoked)

### Entry Check
- Checkpoint location and time
- Temperature check
- Triage category (HIJAU/KUNING/MERAH)
- Decision (Approved/Observation/Rejected)

### Incident
- Type and severity
- Location and time
- Symptoms and vital signs
- Actions taken and outcome

## 📄 License

MIT License - Free to use for any purpose

## 👨‍💻 Development

```bash
# Format code
npm run lint

# Type checking
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or issues, please open an issue on the GitHub repository.
