import type { BotTemplate } from '@/types/bot-config';

export interface MarketplaceBot extends BotTemplate {
  useCase: string;
  exampleReplies: string[];
  features: string[];
}

export const BOT_TEMPLATES: MarketplaceBot[] = [
  {
    id: 'restaurant',
    name: 'Restaurant Bot',
    description: 'Perfect for restaurants, cafes, and food delivery',
    icon: '🍽️',
    greeting: '👋 Welcome to our restaurant! Ready to order something delicious?',
    workingHours: '⏰ Open Daily: 11AM - 10PM',
    menuServices: '🍕 Margherita Pizza - $12\n🍔 Classic Burger - $10\n🍝 Pasta Carbonara - $14\n🥗 Garden Salad - $8',
    useCase: 'Handle menu inquiries, take orders, manage reservations',
    exampleReplies: [
      "Welcome! Would you like to see our menu or place an order?",
      "Great choice! Your order has been confirmed. Estimated delivery: 30 mins",
      "We have tables available at 7 PM and 8 PM. Which works for you?",
    ],
    features: ['Menu display', 'Order taking', 'Reservation booking', 'Delivery tracking'],
    faqs: [
      {
        id: 'r1',
        question: 'Do you deliver?',
        answer: '🚚 Yes! Free delivery within 5km. $5 fee beyond that.',
        keywords: ['deliver', 'delivery', 'shipping']
      },
      {
        id: 'r2',
        question: 'What payment methods do you accept?',
        answer: '💳 We accept cash, card, and mobile payments.',
        keywords: ['payment', 'pay', 'card', 'cash', 'method']
      },
      {
        id: 'r3',
        question: 'Do you have vegetarian options?',
        answer: '🥗 Yes! We have plenty of vegetarian and vegan options. Just ask!',
        keywords: ['vegetarian', 'vegan', 'options', 'dietary']
      },
      {
        id: 'r4',
        question: 'Can I make a reservation?',
        answer: '📅 Absolutely! Let us know your preferred date, time, and party size.',
        keywords: ['reservation', 'reserve', 'book', 'table', 'booking']
      }
    ],
    fallbackMessage: 'Thanks for your message! A team member will respond shortly. 🙂'
  },
  {
    id: 'salon',
    name: 'Beauty Salon Bot',
    description: 'Ideal for salons, spas, and beauty services',
    icon: '💇',
    greeting: '💅 Welcome to our salon! Ready to book your next appointment?',
    workingHours: '⏰ Tue-Sat: 9AM-7PM, Sun: 10AM-5PM, Mon: Closed',
    menuServices: '✂️ Haircut - $35\n💆 Massage - $60\n💅 Manicure - $25\n🧖 Facial - $45',
    useCase: 'Book appointments, show services, send reminders',
    exampleReplies: [
      "Hi! Ready to book your next appointment? Here are our available slots.",
      "Your haircut appointment is confirmed for Saturday at 2 PM!",
      "Reminder: Your spa session is tomorrow at 10 AM. See you then!",
    ],
    features: ['Appointment booking', 'Service catalog', 'Reminders', 'Stylist selection'],
    faqs: [
      {
        id: 's1',
        question: 'How do I book an appointment?',
        answer: '📅 Simply reply with your preferred service, date, and time!',
        keywords: ['book', 'appointment', 'schedule', 'reserve']
      },
      {
        id: 's2',
        question: 'Can I cancel my appointment?',
        answer: '❌ Yes, please cancel at least 24 hours in advance to avoid a fee.',
        keywords: ['cancel', 'cancellation', 'reschedule', 'change']
      },
      {
        id: 's3',
        question: 'Do you take walk-ins?',
        answer: '🚶 Walk-ins welcome based on availability! Appointments recommended.',
        keywords: ['walk-in', 'walkin', 'available', 'now']
      }
    ],
    fallbackMessage: 'Thanks for reaching out! We\'ll get back to you soon. 💇'
  },
  {
    id: 'retail',
    name: 'Retail Store Bot',
    description: 'For shops, boutiques, and retail businesses',
    icon: '🛍️',
    greeting: '👋 Welcome to our store! How can we help you today?',
    workingHours: '⏰ Mon-Sat: 9AM-8PM, Sunday: 10AM-6PM',
    menuServices: '👕 Clothing\n👟 Footwear\n👜 Accessories\n💎 Jewelry',
    useCase: 'Product inquiries, order status, returns',
    exampleReplies: [
      "Looking for something specific? I can help you find the perfect product!",
      "Your order #12345 has been shipped! Track it here: [link]",
      "No problem! I'll start the return process for you.",
    ],
    features: ['Product search', 'Order tracking', 'Returns handling', 'Cart reminders'],
    faqs: [
      {
        id: 'rt1',
        question: 'Do you offer returns?',
        answer: '🔄 Yes! 30-day return policy on all items with receipt.',
        keywords: ['return', 'refund', 'exchange', 'policy']
      },
      {
        id: 'rt2',
        question: 'Where are you located?',
        answer: '📍 Visit us at our store location. We\'d love to see you!',
        keywords: ['location', 'address', 'where', 'find', 'directions']
      },
      {
        id: 'rt3',
        question: 'Do you ship nationwide?',
        answer: '📦 Yes! We ship nationwide. Free shipping on orders over $50.',
        keywords: ['ship', 'shipping', 'delivery', 'nationwide']
      },
      {
        id: 'rt4',
        question: 'Do you have a loyalty program?',
        answer: '⭐ Yes! Earn points on every purchase and get exclusive discounts.',
        keywords: ['loyalty', 'program', 'points', 'rewards', 'member']
      }
    ],
    fallbackMessage: 'Thanks for reaching out! We\'ll get back to you soon. 🛍️'
  },
  {
    id: 'healthcare',
    name: 'Healthcare Clinic Bot',
    description: 'For clinics, dental offices, and medical practices',
    icon: '🏥',
    greeting: '👋 Welcome to our clinic! How can we assist you today?',
    workingHours: '⏰ Mon-Fri: 8AM-6PM, Sat: 9AM-2PM, Sun: Closed',
    menuServices: '🩺 General Checkup - $80\n💉 Vaccinations - $30\n🦷 Dental Cleaning - $100\n👁️ Eye Exam - $60',
    useCase: 'Book medical appointments, provide health info, send reminders',
    exampleReplies: [
      "Welcome! Would you like to schedule an appointment or ask a question?",
      "Your appointment with Dr. Smith is confirmed for Monday at 10 AM.",
      "Please remember to bring your insurance card and ID.",
    ],
    features: ['Appointment booking', 'Insurance info', 'Prescription refills', 'Lab results'],
    faqs: [
      {
        id: 'h1',
        question: 'What insurance do you accept?',
        answer: '🏥 We accept most major insurance plans. Contact us to verify yours.',
        keywords: ['insurance', 'coverage', 'accept', 'plan']
      },
      {
        id: 'h2',
        question: 'Do I need an appointment?',
        answer: '📅 Appointments recommended, but we do accept walk-ins for urgent needs.',
        keywords: ['appointment', 'walk-in', 'urgent', 'emergency']
      },
      {
        id: 'h3',
        question: 'How do I get my test results?',
        answer: '📋 Results are available through our patient portal or by calling us.',
        keywords: ['results', 'test', 'lab', 'report']
      }
    ],
    fallbackMessage: 'Thanks for contacting us! A staff member will respond shortly. 🏥'
  },
  {
    id: 'fitness',
    name: 'Fitness & Gym Bot',
    description: 'For gyms, fitness centers, and personal trainers',
    icon: '💪',
    greeting: '💪 Welcome to our fitness center! Ready to crush your goals?',
    workingHours: '⏰ Mon-Fri: 5AM-10PM, Sat-Sun: 7AM-8PM',
    menuServices: '🏋️ Monthly Membership - $49\n👤 Personal Training - $60/session\n🧘 Yoga Class - $15\n🥊 Boxing Class - $20',
    useCase: 'Membership info, class bookings, trainer scheduling',
    exampleReplies: [
      "Hey! Looking to join or book a class? I can help with both!",
      "Your spin class is booked for tomorrow at 6 AM. See you there!",
      "Our trainers are ready to help you reach your goals!",
    ],
    features: ['Class scheduling', 'Membership management', 'Trainer booking', 'Progress tracking'],
    faqs: [
      {
        id: 'f1',
        question: 'What are your membership options?',
        answer: '💪 We offer monthly ($49), quarterly ($129), and annual ($449) plans!',
        keywords: ['membership', 'join', 'pricing', 'plans', 'cost']
      },
      {
        id: 'f2',
        question: 'Do you offer personal training?',
        answer: '👤 Yes! Our certified trainers offer 1-on-1 sessions at $60/hour.',
        keywords: ['personal', 'trainer', 'training', 'coach']
      },
      {
        id: 'f3',
        question: 'Can I try before I join?',
        answer: '✨ Absolutely! We offer a free 1-day trial. Just bring your ID!',
        keywords: ['trial', 'free', 'try', 'test']
      }
    ],
    fallbackMessage: 'Thanks for your message! We\'ll get back to you soon. 💪'
  },
  {
    id: 'realestate',
    name: 'Real Estate Bot',
    description: 'For realtors, property managers, and agencies',
    icon: '🏠',
    greeting: '🏠 Welcome! Looking to buy, sell, or rent a property?',
    workingHours: '⏰ Mon-Sat: 9AM-7PM, Sunday: By appointment',
    menuServices: '🏡 Home Sales\n🏢 Commercial Properties\n🏠 Rentals\n📋 Property Management',
    useCase: 'Property inquiries, schedule viewings, market info',
    exampleReplies: [
      "Hi! What kind of property are you looking for today?",
      "I've found 5 properties matching your criteria. Want to schedule viewings?",
      "The property at 123 Main St is available for viewing this weekend!",
    ],
    features: ['Property search', 'Viewing scheduling', 'Market updates', 'Mortgage info'],
    faqs: [
      {
        id: 're1',
        question: 'How do I schedule a viewing?',
        answer: '📅 Send me the property address and your available times!',
        keywords: ['viewing', 'schedule', 'visit', 'tour', 'see']
      },
      {
        id: 're2',
        question: 'Do you help with mortgages?',
        answer: '💰 We work with trusted lenders and can connect you for pre-approval!',
        keywords: ['mortgage', 'loan', 'financing', 'lender']
      },
      {
        id: 're3',
        question: 'What areas do you cover?',
        answer: '📍 We cover the entire metro area and surrounding suburbs.',
        keywords: ['area', 'location', 'neighborhood', 'cover', 'region']
      }
    ],
    fallbackMessage: 'Thanks for your interest! An agent will contact you shortly. 🏠'
  },
  {
    id: 'education',
    name: 'Education Bot',
    description: 'For schools, tutoring centers, and online courses',
    icon: '📚',
    greeting: '📚 Welcome! How can we help with your learning journey?',
    workingHours: '⏰ Mon-Fri: 8AM-6PM, Sat: 9AM-1PM',
    menuServices: '📖 Math Tutoring - $40/hr\n🔬 Science Tutoring - $40/hr\n📝 Test Prep - $50/hr\n💻 Coding Classes - $60/hr',
    useCase: 'Course info, enrollment, schedule tutoring sessions',
    exampleReplies: [
      "Welcome! Are you looking for tutoring or course information?",
      "Your math tutoring session is confirmed for Wednesday at 4 PM.",
      "We offer personalized learning plans for all ages!",
    ],
    features: ['Course catalog', 'Session booking', 'Progress reports', 'Resource sharing'],
    faqs: [
      {
        id: 'e1',
        question: 'What subjects do you offer?',
        answer: '📚 We offer Math, Science, English, Test Prep, and Coding!',
        keywords: ['subjects', 'offer', 'teach', 'courses', 'tutoring']
      },
      {
        id: 'e2',
        question: 'Do you offer online sessions?',
        answer: '💻 Yes! We offer both in-person and online tutoring sessions.',
        keywords: ['online', 'virtual', 'remote', 'zoom']
      },
      {
        id: 'e3',
        question: 'How do I enroll?',
        answer: '✍️ Reply with your name and preferred subject to get started!',
        keywords: ['enroll', 'register', 'sign', 'join', 'start']
      }
    ],
    fallbackMessage: 'Thanks for reaching out! We\'ll respond shortly. 📚'
  },
  {
    id: 'automotive',
    name: 'Auto Service Bot',
    description: 'For auto repair shops, dealerships, and car washes',
    icon: '🚗',
    greeting: '🚗 Welcome! Need auto service or looking for a new ride?',
    workingHours: '⏰ Mon-Fri: 7AM-6PM, Sat: 8AM-4PM, Sun: Closed',
    menuServices: '🔧 Oil Change - $39\n🛞 Tire Rotation - $25\n🔋 Battery Check - Free\n🚿 Car Wash - $15',
    useCase: 'Service bookings, repair estimates, vehicle info',
    exampleReplies: [
      "Hi! Do you need maintenance, repairs, or looking for a vehicle?",
      "Your oil change is scheduled for Friday at 9 AM. See you then!",
      "We offer free estimates on all repairs. Bring your car in anytime!",
    ],
    features: ['Service booking', 'Repair tracking', 'Price estimates', 'Inventory search'],
    faqs: [
      {
        id: 'a1',
        question: 'How long does an oil change take?',
        answer: '⏱️ About 30-45 minutes. We also offer a waiting lounge!',
        keywords: ['oil', 'change', 'long', 'time', 'wait']
      },
      {
        id: 'a2',
        question: 'Do you offer free estimates?',
        answer: '✅ Yes! Free estimates on all repairs. Just bring your vehicle in.',
        keywords: ['estimate', 'quote', 'free', 'cost', 'price']
      },
      {
        id: 'a3',
        question: 'Do you work on all car brands?',
        answer: '🚗 We service all major brands - domestic and import!',
        keywords: ['brands', 'makes', 'model', 'work', 'service']
      }
    ],
    fallbackMessage: 'Thanks! A service advisor will contact you shortly. 🚗'
  },
  {
    id: 'hotel',
    name: 'Hotel & Hospitality Bot',
    description: 'For hotels, resorts, and vacation rentals',
    icon: '🏨',
    greeting: '🏨 Welcome! Planning your next getaway? Let us help!',
    workingHours: '⏰ Front Desk: 24/7 | Concierge: 7AM-11PM',
    menuServices: '🛏️ Standard Room - $99/night\n🌟 Deluxe Suite - $199/night\n🍳 Breakfast - $15\n🧖 Spa Access - $50',
    useCase: 'Room bookings, amenity info, local recommendations',
    exampleReplies: [
      "Welcome! When would you like to check in?",
      "Your reservation is confirmed! Deluxe Suite, Oct 15-18. Confirmation #12345",
      "Our pool is open 6 AM - 10 PM. Towels provided poolside!",
    ],
    features: ['Room booking', 'Concierge service', 'Local tips', 'Room service'],
    faqs: [
      {
        id: 'ht1',
        question: 'What time is check-in and check-out?',
        answer: '🕐 Check-in: 3 PM | Check-out: 11 AM. Early/late options available!',
        keywords: ['check-in', 'checkout', 'time', 'arrive', 'leave']
      },
      {
        id: 'ht2',
        question: 'Is breakfast included?',
        answer: '🍳 Complimentary breakfast for suite guests. Others: $15/person.',
        keywords: ['breakfast', 'included', 'food', 'meal']
      },
      {
        id: 'ht3',
        question: 'Do you have parking?',
        answer: '🅿️ Free self-parking for all guests. Valet available for $20/day.',
        keywords: ['parking', 'car', 'valet', 'garage']
      }
    ],
    fallbackMessage: 'Thank you for contacting us! A concierge will assist you shortly. 🏨'
  },
  {
    id: 'faq',
    name: 'Generic FAQ Bot',
    description: 'Universal bot for any business type',
    icon: '❓',
    greeting: '👋 Hi there! How can I help you today?',
    workingHours: '⏰ Mon-Fri: 9AM-6PM, Weekends: 10AM-4PM',
    menuServices: 'Our services are customized to your needs. Ask us anything!',
    useCase: 'Answer common questions, provide information',
    exampleReplies: [
      "Hi there! How can I help you today?",
      "Our business hours are Mon-Fri, 9 AM to 6 PM.",
      "You can reach us at support@example.com for detailed inquiries.",
    ],
    features: ['Custom FAQ', 'Business info', 'Contact routing', 'Working hours'],
    faqs: [
      {
        id: 'fq1',
        question: 'How can I contact you?',
        answer: '📧 Email us or call during business hours. We\'re here to help!',
        keywords: ['contact', 'reach', 'email', 'call', 'phone']
      },
      {
        id: 'fq2',
        question: 'Where are you located?',
        answer: '📍 Visit our website for our full address and directions!',
        keywords: ['location', 'address', 'where', 'find', 'directions']
      }
    ],
    fallbackMessage: 'Thanks for your message! We\'ll get back to you soon. 🙂'
  }
];
