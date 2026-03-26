import { Product } from '../context/CartContext';

export const categoryIcons = {
  'Well Control': 'Shield',
  'Drilling Equipment': 'Drill',
  'Production Equipment': 'Factory',
  'Completion Tools': 'Wrench',
  'Pumps & Valves': 'Gauge',
  'Safety Equipment': 'AlertTriangle',
  'Testing Equipment': 'FlaskConical',
} as const;

export const products: Product[] = [
  {
    id: '1',
    name: 'Cameron BOP Stack System',
    category: 'Well Control',
    price: '$125,000',
    image: 'https://images.unsplash.com/photo-1629540946404-ebe133e99f49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.8,
    orders: '120+',
    description: 'High-performance Blowout Preventer (BOP) stack system designed for deep well operations. Features advanced pressure control and safety mechanisms.',
    specifications: {
      'Working Pressure': '15,000 PSI',
      'Bore Size': '18-3/4"',
      'Temperature Rating': '-20°F to 250°F',
      'Material': 'Forged Steel',
      'Certification': 'API 16A',
    }
  },
  {
    id: '2',
    name: 'Drilling Rig Package Complete',
    category: 'Drilling Equipment',
    price: '$850,000',
    image: 'https://images.unsplash.com/photo-1765048892515-3bc3557dc980?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.9,
    orders: '85+',
    description: 'Complete drilling rig package including derrick, drawworks, mud pumps, and control systems. Ready for immediate deployment.',
    specifications: {
      'Depth Capacity': '25,000 ft',
      'Hook Load': '750,000 lbs',
      'Rotary Table': '27-1/2"',
      'Power System': '3000 HP',
      'Certification': 'API Spec 4F',
    }
  },
  {
    id: '3',
    name: 'Three-Phase Production Separator',
    category: 'Production Equipment',
    price: '$95,000',
    image: 'https://images.unsplash.com/photo-1750515742085-f2eb9ecd6742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.7,
    orders: '95+',
    description: 'Horizontal three-phase separator for oil, gas, and water separation. Optimized for high-volume production operations.',
    specifications: {
      'Capacity': '50,000 BOPD',
      'Operating Pressure': '1,440 PSI',
      'Vessel Size': '10\' x 40\'',
      'Material': 'Carbon Steel',
      'Design Code': 'ASME Section VIII',
    }
  },
  {
    id: '4',
    name: 'Hydraulic Pressure Testing Unit',
    category: 'Testing Equipment',
    price: '$45,000',
    image: 'https://images.unsplash.com/photo-1765048808260-9f48d96caf98?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.6,
    orders: '150+',
    description: 'Portable hydraulic testing unit for wellhead, BOP, and pipeline testing. Features digital monitoring and data logging.',
    specifications: {
      'Max Pressure': '20,000 PSI',
      'Flow Rate': '10 GPM',
      'Power Source': 'Diesel/Electric',
      'Tank Capacity': '200 gallons',
      'Controls': 'Digital with Data Logger',
    }
  },
  {
    id: '5',
    name: 'Industrial Gate Valve Set',
    category: 'Pumps & Valves',
    price: '$12,500',
    image: 'https://images.unsplash.com/photo-1698031610524-c35e7ebbba2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.5,
    orders: '200+',
    description: 'Heavy-duty gate valve assembly with manual and actuated options. Suitable for high-pressure applications.',
    specifications: {
      'Size Range': '2" to 24"',
      'Pressure Class': '2500#',
      'Material': 'Stainless Steel',
      'Operation': 'Manual/Actuated',
      'Standard': 'API 6A',
    }
  },
  {
    id: '6',
    name: 'Wellhead Control Panel',
    category: 'Well Control',
    price: '$35,000',
    image: 'https://images.unsplash.com/photo-1673662686870-33f0b8864f5e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.7,
    orders: '110+',
    description: 'Advanced wellhead control panel with integrated safety systems and real-time monitoring capabilities.',
    specifications: {
      'Control System': 'PLC-based',
      'Display': 'HMI Touchscreen',
      'Input Voltage': '480V 3-phase',
      'Enclosure': 'NEMA 4X',
      'Communications': 'Ethernet, Modbus',
    }
  },
  {
    id: '7',
    name: 'Mud Pump System',
    category: 'Drilling Equipment',
    price: '$185,000',
    image: 'https://images.unsplash.com/photo-1657558665549-bd7d82afed8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.8,
    orders: '75+',
    description: 'Triplex mud pump system with high-pressure capability for deep well drilling operations.',
    specifications: {
      'Type': 'Triplex',
      'Max Pressure': '7,500 PSI',
      'Flow Rate': '850 GPM',
      'Power': '2,200 HP',
      'Liner Size': '6-1/2"',
    }
  },
  {
    id: '8',
    name: 'Pipeline Valve Assembly',
    category: 'Pumps & Valves',
    price: '$18,900',
    image: 'https://images.unsplash.com/photo-1665930489997-e5e9d527ae39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.6,
    orders: '165+',
    description: 'Complete pipeline valve assembly with emergency shutdown capability and corrosion-resistant coating.',
    specifications: {
      'Valve Type': 'Ball Valve',
      'Size': '12"',
      'Pressure Rating': '1500#',
      'Material': 'Duplex Stainless',
      'Actuator': 'Pneumatic/Hydraulic',
    }
  },
  {
    id: '9',
    name: 'Safety Relief Valve System',
    category: 'Safety Equipment',
    price: '$8,750',
    image: 'https://images.unsplash.com/photo-1743580886673-812abb5acf3a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.9,
    orders: '220+',
    description: 'High-reliability safety relief valve system for overpressure protection. API certified with full test documentation.',
    specifications: {
      'Set Pressure': '1,000-5,000 PSI',
      'Orifice Size': 'J to T',
      'Connection': 'Flanged',
      'Material': 'Stainless Steel 316',
      'Certification': 'API 520/521',
    }
  },
  {
    id: '10',
    name: 'Centrifugal Pump Package',
    category: 'Pumps & Valves',
    price: '$32,500',
    image: 'https://images.unsplash.com/photo-1698031610493-c19fa20dfeab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.7,
    orders: '135+',
    description: 'Multi-stage centrifugal pump with variable speed drive for versatile pumping applications.',
    specifications: {
      'Flow Rate': '500 GPM',
      'Head': '1,500 ft',
      'Power': '250 HP',
      'Material': 'Carbon Steel',
      'Drive': 'VFD Controlled',
    }
  },
  {
    id: '11',
    name: 'Completion Tool String',
    category: 'Completion Tools',
    price: '$67,500',
    image: 'https://images.unsplash.com/photo-1722580089913-9a8dd0959470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.8,
    orders: '90+',
    description: 'Complete downhole completion tool string including packers, safety valves, and flow control equipment.',
    specifications: {
      'String Size': '5-1/2"',
      'Max Pressure': '10,000 PSI',
      'Max Temperature': '350°F',
      'Components': 'Packer, SV, Nipples',
      'Material': 'Inconel/SS',
    }
  },
  {
    id: '12',
    name: 'Gas Detection System',
    category: 'Safety Equipment',
    price: '$24,000',
    image: 'https://images.unsplash.com/photo-1725916631380-fe85ea5ccd56?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800',
    rating: 4.9,
    orders: '180+',
    description: 'Multi-point gas detection system with wireless monitoring and automatic alarm capabilities.',
    specifications: {
      'Detection Range': 'H2S, CO, CH4, O2',
      'Sensors': 'Up to 16 points',
      'Display': 'LCD with Backlight',
      'Alarm': 'Visual and Audible',
      'Power': '24VDC',
    }
  },
];

export const categories = [
  { id: 'all', name: 'All Equipment', count: products.length },
  { id: 'well-control', name: 'Well Control - BOP', count: products.filter(p => p.category === 'Well Control').length },
  { id: 'drilling', name: 'Drilling Equipment', count: products.filter(p => p.category === 'Drilling Equipment').length },
  { id: 'production', name: 'Production Equipment', count: products.filter(p => p.category === 'Production Equipment').length },
  { id: 'completion', name: 'Completion Tools', count: products.filter(p => p.category === 'Completion Tools').length },
  { id: 'pumps-valves', name: 'Pumps & Valves', count: products.filter(p => p.category === 'Pumps & Valves').length },
  { id: 'safety', name: 'Safety Equipment', count: products.filter(p => p.category === 'Safety Equipment').length },
  { id: 'testing', name: 'Testing Equipment', count: products.filter(p => p.category === 'Testing Equipment').length },
];