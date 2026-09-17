import { Category, Product, CompanyDetails } from '../types';

export const categoriesData: Category[] = [];

export const productsData: Product[] = [];

export const whyChooseUsData = [
  {
    id: 'inhouse',
    title: 'In-House Manufacturing',
    description: 'Complete production from moulding to assembly in our own factory. No outsourcing, no compromises.',
    icon: 'Factory'
  },
  {
    id: 'quality',
    title: 'Quality Tested',
    description: 'Every batch undergoes electrical and mechanical testing to meet ISI standards before dispatch.',
    icon: 'ShieldCheck'
  },
  {
    id: 'bulk',
    title: 'Bulk Supply Ready',
    description: 'Capacity to fulfill large orders with consistent delivery timelines across India.',
    icon: 'Truck'
  },
  {
    id: 'pricing',
    title: 'Competitive Pricing',
    description: 'Factory-direct pricing with no middleman. Better margins for distributors and retailers.',
    icon: 'BadgePercent'
  },
  {
    id: 'custom',
    title: 'Custom Orders',
    description: 'OEM manufacturing available. We can customize designs, markings, and packaging to your brand specifications.',
    icon: 'Wrench'
  },
  {
    id: 'clients',
    title: '1000+ Clients',
    description: 'Trusted by manufacturers, distributors, and appliance assemblers across PAN India for two decades.',
    icon: 'Users'
  }
];

export const companyDetails: CompanyDetails = {
  brandName: 'Falcon Electrics',
  companyName: 'Verma Enterprises',
  founder: 'Vivek Verma',
  foundedYear: 2005,
  tagline: 'Reliable Electrical Solutions for Every Season',
  logoTagline: 'Switch to excellence',
  hideLogoText: false,
  customHeaderBannerUrl: '',
  headerBrandMode: 'logo_text',
  address: '109-A/D, Block A, Vikas Nagar Extn., Uttam Nagar, New Delhi - 110059',
  phone: '+91 97175 49515',
  whatsapp: '+91 97175 49515',
  email: 'vermaenterprisessales@gmail.com',
  gstin: '07AXZPV6671J1Z8',
  businessHours: 'Mon - Sat: 10:00 AM - 7:00 PM (Sunday: Closed)',
  facebook: 'https://www.facebook.com/Verma.Enterprises.Vikas.Nagar/',
  instagram: 'https://www.instagram.com/vermaenterprisesswitch/',
  headerTheme: 'white',
  showInstallAppButton: true,
  location: {
    lat: 28.6258,
    lng: 77.0520,
    zoom: 15,
  },
  quote: "We don't just manufacture switches. We build the controls that power millions of Indian homes every day.",
  visitingCardImageUrl: '',
};

export const defaultCatalogueSettings = {
  title: 'Our Range Products & Details',
  subtitle: 'Browse through our complete product catalogue to discover detailed specifications, features and technical information.',
  badge: 'PRODUCT CATALOGUE 2026',
  pdfDownloadUrl: '',
  whatsappMessage: 'Hello Falcon Electrics, I am viewing your Product Catalogue on the website and would like to request bulk pricing and details.',
  showPageNumbers: true,
  pages: [
    {
      id: 'cat-p1',
      pageNumber: 1,
      title: 'High Performance Switchgear Solutions',
      subtitle: 'Falcon Electrics — Switch to Excellence',
      description: 'Engineered to deliver superior performance, safety and reliability for every commercial and domestic application.',
      categoryTag: 'Cover Page',
      imageUrl: '',
    },
    {
      id: 'cat-p2',
      pageNumber: 2,
      title: 'Company Profile & Manufacturing Standards',
      subtitle: '20+ Years of Manufacturing Excellence (Since 2005)',
      description: 'ISO-compliant manufacturing facility in New Delhi equipped with precision moulding, silver contact riveting & endurance testing labs.',
      categoryTag: 'Profile',
      imageUrl: '',
    },
    {
      id: 'cat-p3',
      pageNumber: 3,
      title: 'Electronic Fan Regulators & Speed Controllers',
      subtitle: '5-Step, 4-Step & Socket-Fit Heavy Duty Regulators',
      description: 'Hum-free capacitance technology, flame retardant polycarbonate body, and smooth 360-degree rotation click mechanism.',
      categoryTag: 'Summer Range',
      imageUrl: '',
    },
    {
      id: 'cat-p4',
      pageNumber: 4,
      title: 'Air Cooler Switches, Kits & Rotary Controls',
      subtitle: 'Multi-Speed Cooler Controls & Heavy Duty Knobs',
      description: 'High-current copper leaf contacts tested for continuous monsoon & summer heavy moisture endurance.',
      categoryTag: 'Summer Range',
      imageUrl: '',
    },
    {
      id: 'cat-p5',
      pageNumber: 5,
      title: 'Winter Heating Rotary Switches & Cam Switches',
      subtitle: '16 Amp High-Current Room Heater & Geyser Controls',
      description: 'Heat-resistant ceramic & bakelite core insulation preventing thermal degradation under 2500W heating loads.',
      categoryTag: 'Winter Range',
      imageUrl: '',
    },
    {
      id: 'cat-p6',
      pageNumber: 6,
      title: 'Modular Switches & Elegant Polycarbonate Plates',
      subtitle: '1-Way, 2-Way, Bell Push & 6A/16A Modular Switches',
      description: 'Ultra-smooth tactile actuation with silver-cadmium oxide contacts rated for over 100,000 switching operations.',
      categoryTag: 'Modular Range',
      imageUrl: '',
    },
    {
      id: 'cat-p7',
      pageNumber: 7,
      title: 'Rocker Power Switches & Indicator Toggles',
      subtitle: 'Appliance Power Switches with High-Luminance Neon Indicators',
      description: 'Available in snap-in panels, waterproof rubber boots, and illuminated red/green actuator caps.',
      categoryTag: 'Rocker Range',
      imageUrl: '',
    },
    {
      id: 'cat-p8',
      pageNumber: 8,
      title: 'Mixer Grinder Switches & Overload Protectors',
      subtitle: '3-Speed Incher Rotary Switches & Resettable Circuit Breakers',
      description: 'Engineered for tough motor start spikes, copper phosphor springs, and heavy vibration resistance.',
      categoryTag: 'Appliance Spares',
      imageUrl: '',
    },
    {
      id: 'cat-p9',
      pageNumber: 9,
      title: 'Distribution Switchgear & 32A DP Main Switches',
      subtitle: 'Double Pole Isolators & Changeover Switches',
      description: 'Silver alloy terminals, clear ON/OFF safety indicators, and robust DIN-rail & surface mount enclosures.',
      categoryTag: 'Switchgear',
      imageUrl: '',
    },
    {
      id: 'cat-p10',
      pageNumber: 10,
      title: 'Technical Specifications & Quality Assurance',
      subtitle: 'Raw Material Testing, Contact Resistance & IS Compliance',
      description: 'Strict quality control matrix covering glow wire test at 850°C, high voltage breakdown test and life endurance.',
      categoryTag: 'Technical Specs',
      imageUrl: '',
    },
    {
      id: 'cat-p11',
      pageNumber: 11,
      title: 'Bulk Orders, OEM Manufacturing & Factory Contact',
      subtitle: 'Verma Enterprises — New Delhi | Pan-India Dealer Network',
      description: 'Custom branding, bulk carton dispatch, dealer terms and direct technical assistance for electrical distributors.',
      categoryTag: 'Contact & Dealership',
      imageUrl: '',
    },
  ],
};

