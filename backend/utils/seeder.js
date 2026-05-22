/**
 * Database Seeder
 * ---------------
 * Clears existing data and inserts:
 *   - 1 super admin
 *   - 3 department officers
 *   - 5 citizens
 *   - 50 realistic grievances with UP coordinates
 *
 * Usage:
 *   npm run seed          → seed fresh data
 *   npm run seed:destroy  → wipe all data only
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Grievance = require('../models/Grievance');
const { ROLES, GRIEVANCE_STATUS, PRIORITY_LEVELS, DEPARTMENTS } = require('../config/constants');

// ── Seed data ─────────────────────────────────────────────────────────────────

const ADMINS = [
  {
    name: 'Arjun Sharma',
    email: 'admin@grievance.gov.in',
    password: 'Admin@1234',
    phone: '9876543210',
    role: ROLES.SUPER_ADMIN,
  },
];

const OFFICERS = [
  {
    name: 'Priya Verma',
    email: 'officer.water@grievance.gov.in',
    password: 'Officer@1234',
    phone: '9876543211',
    role: ROLES.OFFICER,
    department: DEPARTMENTS.WATER,
    jurisdiction: ['Lucknow', 'Kanpur'],
  },
  {
    name: 'Ravi Kumar',
    email: 'officer.roads@grievance.gov.in',
    password: 'Officer@1234',
    phone: '9876543212',
    role: ROLES.OFFICER,
    department: DEPARTMENTS.ROADS,
    jurisdiction: ['Agra', 'Mathura', 'Firozabad'],
  },
  {
    name: 'Sunita Patel',
    email: 'officer.electricity@grievance.gov.in',
    password: 'Officer@1234',
    phone: '9876543213',
    role: ROLES.OFFICER,
    department: DEPARTMENTS.ELECTRICITY,
    jurisdiction: ['Varanasi', 'Prayagraj'],
  },
];

const CITIZENS = [
  { name: 'Mohit Singh',   email: 'mohit@example.com',   password: 'Citizen@1234', phone: '9012345678', role: ROLES.CITIZEN },
  { name: 'Neha Gupta',    email: 'neha@example.com',    password: 'Citizen@1234', phone: '9012345679', role: ROLES.CITIZEN },
  { name: 'Anil Yadav',    email: 'anil@example.com',    password: 'Citizen@1234', phone: '9012345680', role: ROLES.CITIZEN },
  { name: 'Kavita Mishra', email: 'kavita@example.com',  password: 'Citizen@1234', phone: '9012345681', role: ROLES.CITIZEN },
  { name: 'Deepak Tiwari', email: 'deepak@example.com',  password: 'Citizen@1234', phone: '9012345682', role: ROLES.CITIZEN },
];

// Uttar Pradesh district coordinates [longitude, latitude]
const UP_LOCATIONS = [
  { district: 'Lucknow',     state: 'Uttar Pradesh', address: 'Hazratganj, Lucknow',          coordinates: [80.9462, 26.8467] },
  { district: 'Kanpur',      state: 'Uttar Pradesh', address: 'Civil Lines, Kanpur',           coordinates: [80.3319, 26.4499] },
  { district: 'Agra',        state: 'Uttar Pradesh', address: 'Taj Nagari, Agra',              coordinates: [78.0081, 27.1767] },
  { district: 'Varanasi',    state: 'Uttar Pradesh', address: 'Lanka, Varanasi',               coordinates: [82.9739, 25.3176] },
  { district: 'Prayagraj',   state: 'Uttar Pradesh', address: 'Civil Lines, Prayagraj',        coordinates: [81.8463, 25.4358] },
  { district: 'Meerut',      state: 'Uttar Pradesh', address: 'Shastri Nagar, Meerut',         coordinates: [77.7064, 28.9845] },
  { district: 'Ghaziabad',   state: 'Uttar Pradesh', address: 'Indirapuram, Ghaziabad',        coordinates: [77.4538, 28.6692] },
  { district: 'Mathura',     state: 'Uttar Pradesh', address: 'Vrindavan Road, Mathura',       coordinates: [77.6737, 27.4924] },
  { district: 'Bareilly',    state: 'Uttar Pradesh', address: 'Civil Lines, Bareilly',         coordinates: [79.4304, 28.3670] },
  { district: 'Gorakhpur',   state: 'Uttar Pradesh', address: 'Golghar, Gorakhpur',            coordinates: [83.3732, 26.7605] },
];

const GRIEVANCE_TEMPLATES = [
  // Water Supply
  { title: 'No water supply in our colony for 5 days', description: 'Our entire colony has been without water supply for the past 5 days. Despite multiple calls to the water board helpline, no action has been taken. We have elderly residents and children who are severely affected. The overhead tank has been empty and the pipeline appears to have a major leak near the main junction. We request immediate repair and restoration of water supply.', department: DEPARTMENTS.WATER, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Water contamination causing illness in neighbourhood', description: 'The drinking water in our area has turned yellowish-brown and smells foul for the past week. Several families including mine have reported stomach illness and diarrhoea after consuming the water. We believe sewage water is mixing with the drinking water pipeline near the main road. Children and elderly are most affected. This is a serious public health hazard requiring immediate intervention.', department: DEPARTMENTS.WATER, priority: PRIORITY_LEVELS.CRITICAL },
  { title: 'Water tanker not coming to our ward for 2 weeks', description: 'The municipal water tanker which used to supply water to our ward has not visited for the past 2 weeks. Ward number 14 residents are completely dependent on this tanker as there is no pipeline connection in our area. We have been forced to buy expensive bottled water and travel long distances to fetch water. Kindly resume the tanker service immediately.', department: DEPARTMENTS.WATER, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Burst pipeline near school causing road flooding', description: 'A major water pipeline has burst near Government Primary School on Station Road. Water is flooding the road and school premises, making it impossible for children to attend school safely. The burst has been ongoing for 3 days and no repair team has visited. The flooded road is also causing traffic disruption and risk of accidents.', department: DEPARTMENTS.WATER, priority: PRIORITY_LEVELS.CRITICAL },
  { title: 'New water connection application pending for 6 months', description: 'I submitted an application for a new water connection 6 months ago along with all required documents and fees. Despite multiple follow-ups at the water board office, my application is still pending. I have been given different excuses every time. Please look into this matter and process my connection at the earliest.', department: DEPARTMENTS.WATER, priority: PRIORITY_LEVELS.MEDIUM },

  // Electricity
  { title: 'Frequent power cuts affecting daily life and business', description: 'Our area is experiencing power cuts of 8-12 hours daily for the past month. This is severely affecting our daily life, business operations, and students who are preparing for examinations. The local electricity board office says the issue is with a faulty transformer but no replacement has been done. Multiple appliances have been damaged due to voltage fluctuations when power returns.', department: DEPARTMENTS.ELECTRICITY, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Dangerously low hanging electric wire on main road', description: 'There is a dangerously sagging electric wire hanging very low across the main road near the vegetable market. This wire is at head height and poses a severe risk of electrocution to pedestrians and vehicle riders. Last week a truck passed and the wire sparked. Children who play in this area are in serious danger. Immediate fixing of this wire is required to prevent a tragedy.', department: DEPARTMENTS.ELECTRICITY, priority: PRIORITY_LEVELS.CRITICAL },
  { title: 'Electricity bill inflated by 400% without reason', description: 'My electricity bill for this month is Rs 8,400 which is 4 times my usual bill of around Rs 2,100. There has been no change in my usage pattern or addition of appliances. I believe there is an error in meter reading. Despite visiting the electricity office twice, I was told to pay the bill or connection will be disconnected. Please investigate and correct the bill amount.', department: DEPARTMENTS.ELECTRICITY, priority: PRIORITY_LEVELS.MEDIUM },
  { title: 'Street lights not working making area unsafe at night', description: 'All 12 street lights in our residential lane have been non-functional for the past 3 weeks. The area becomes completely dark after sunset, making it unsafe especially for women and elderly. There have already been two incidents of chain snatching in this dark lane. We have reported this to the ward office but no action has been taken. Please restore the street lighting urgently.', department: DEPARTMENTS.ELECTRICITY, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Electric pole fallen on road after recent storm', description: 'An electric pole fell on the main road during the storm last night. The pole and live wires are blocking half the road and posing a serious electrocution hazard. Traffic is severely disrupted. We have called the emergency helpline but no team has arrived after 6 hours. This is a critical safety emergency requiring immediate attention.', department: DEPARTMENTS.ELECTRICITY, priority: PRIORITY_LEVELS.CRITICAL },

  // Roads
  { title: 'Large potholes on main road causing accidents', description: 'The main connecting road in our area has developed numerous large potholes due to recent heavy rains. Two motorcycle accidents have already occurred this week causing injuries. The road was repaired just 4 months ago and has already deteriorated to this condition, suggesting poor quality construction. Vehicles are getting damaged and the road is becoming unusable. Urgent repair is required.', department: DEPARTMENTS.ROADS, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Road under construction abandoned for 3 months', description: 'The road widening project that started 3 months ago has been abandoned midway. The contractor stopped work 6 weeks ago and the partially dug road is now a hazard for vehicles and pedestrians. During rains, the trenches fill with water and become invisible. An elderly man fell into one such trench last week and fractured his wrist. Please ensure work is resumed and completed at the earliest.', department: DEPARTMENTS.ROADS, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Footpath completely encroached by shops and vendors', description: 'The footpath on the entire stretch of Market Road has been encroached by shop owners who have extended their establishments onto the footpath. Pedestrians including school children are forced to walk on the road, leading to near-miss accidents daily. Despite multiple complaints to the municipal office, no action has been taken against the encroachers. Please clear the footpath immediately.', department: DEPARTMENTS.ROADS, priority: PRIORITY_LEVELS.MEDIUM },
  { title: 'Road drainage completely blocked causing flooding', description: 'The road drainage system in our ward has been completely blocked with debris and garbage for the past 2 months. Every time it rains, the entire road floods knee-deep and remains waterlogged for 24-48 hours. Residents cannot leave their homes during rain. The stagnant water is also breeding mosquitoes and causing dengue risk. Please clear the drainage and restore proper water flow.', department: DEPARTMENTS.ROADS, priority: PRIORITY_LEVELS.HIGH },
  { title: 'No signboards or traffic signals at dangerous crossing', description: 'The intersection at Civil Lines crossing has no traffic signals, signboards, or road markings despite being a very busy junction. Three serious accidents have occurred here in the past 2 months. The junction handles heavy traffic from 4 roads and there is complete chaos during peak hours. Installation of traffic signals and proper road markings is urgently needed to prevent further accidents and casualties.', department: DEPARTMENTS.ROADS, priority: PRIORITY_LEVELS.HIGH },

  // Sanitation
  { title: 'Garbage not collected for 2 weeks, area stinking', description: 'The garbage collection vehicle has not visited our colony for the past 2 weeks. The garbage dump near the park has overflowed and garbage is now spread across the road. The stench is unbearable and the area is littered with garbage. Flies and stray animals are creating further unhygienic conditions. This is a serious health hazard for all residents. Please resume garbage collection immediately.', department: DEPARTMENTS.SANITATION, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Public toilets non-functional and in terrible condition', description: 'The public toilets near the bus stand are completely non-functional. The toilets have no water supply, broken seats and doors, and are in an extremely unhygienic condition. Despite being a busy public area used by hundreds of people daily, these facilities have been ignored for months. The situation is especially difficult for women and elderly travellers. Immediate renovation and maintenance is needed.', department: DEPARTMENTS.SANITATION, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Sewer overflow flooding residential area', description: 'The main sewer line in our area has been overflowing for the past week, spreading sewage water across the residential lanes. The smell is extremely foul and residents are unable to move freely. Children are at risk of waterborne diseases. The sewer overflow appears to be due to a blockage in the main drain. Please send a team to clear the blockage and clean the affected area immediately.', department: DEPARTMENTS.SANITATION, priority: PRIORITY_LEVELS.CRITICAL },
  { title: 'No dustbins provided in entire ward', description: 'Our ward has no public dustbins or garbage collection points. Residents have no choice but to dump garbage in open spaces and on roadsides. This has created several illegal dump sites across the ward which are health hazards. Despite the ward being well-populated, basic sanitation infrastructure has never been provided. Please install adequate dustbins and establish a proper garbage collection system.', department: DEPARTMENTS.SANITATION, priority: PRIORITY_LEVELS.MEDIUM },
  { title: 'Open drain near school causing disease risk', description: 'There is an open drain right next to Government Middle School that is overflowing with sewage water and garbage. During summer, the stench is unbearable in classrooms and the breeding of mosquitoes is rampant. Last month 12 students fell ill with stomach infections. The school principal has complained multiple times but no action has been taken. Please cover the drain and clean the area before schools reopen.', department: DEPARTMENTS.SANITATION, priority: PRIORITY_LEVELS.CRITICAL },

  // Health
  { title: 'Doctors absent at primary health centre regularly', description: 'The government primary health centre in our village is largely non-functional as the posted doctor is absent 4-5 days a week. Patients travel 15-20 kilometres to reach this centre only to find it closed. Pregnant women and emergency patients are the worst affected. The ANM workers are overwhelmed. There is also a severe shortage of medicines that have been out of stock for 2 months. Please take immediate action.', department: DEPARTMENTS.HEALTH, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Vaccination camp not organised for 3 months', description: 'The routine vaccination camp for children and pregnant women has not been organised in our area for the past 3 months. Several infants are now overdue for essential vaccines. The last camp was supposed to be held in the community hall but did not happen due to reasons unknown. Multiple families are concerned about the health risk. Please organise an immediate vaccination drive.', department: DEPARTMENTS.HEALTH, priority: PRIORITY_LEVELS.HIGH },
  { title: 'District hospital running without key specialist doctors', description: 'The district hospital has been operating without an orthopaedic surgeon, cardiologist, and gynaecologist for the past 4 months. Patients requiring these specialist services are being referred to private hospitals which charge unaffordable fees. This has made quality healthcare inaccessible for poor patients. The positions have been vacant since the previous doctors transferred. Please arrange immediate posting of specialists.', department: DEPARTMENTS.HEALTH, priority: PRIORITY_LEVELS.HIGH },

  // Education
  { title: 'School building roof collapsed, children at risk', description: 'The roof of two classrooms in Government Primary School has partially collapsed due to heavy rainfall. Children are being made to sit in the open or in highly congested remaining rooms. The building condition is dangerous and the rest of the structure is also showing cracks. Parents are refusing to send children to school fearing further collapse. Immediate structural repair or a temporary alternative venue is urgently needed.', department: DEPARTMENTS.EDUCATION, priority: PRIORITY_LEVELS.CRITICAL },
  { title: 'Teachers absent, school running without proper classes', description: 'Our government secondary school has 8 teacher positions but only 3 are currently filled. As a result, many classes have no teacher and students sit idle for most of the day. Senior students appearing for board exams are severely affected as important subjects like mathematics and science have no teachers at all. This has been the situation for 6 months. Please fill the vacant positions urgently.', department: DEPARTMENTS.EDUCATION, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Mid-day meal not served for weeks', description: 'The mid-day meal scheme at our village primary school has not been operational for the past 3 weeks. Many students from poor families who depend on this meal for their daily nutrition are going hungry. Attendance has dropped significantly as children have started staying home. The school says funds have not been released. Please investigate and ensure the mid-day meal scheme is restored immediately.', department: DEPARTMENTS.EDUCATION, priority: PRIORITY_LEVELS.HIGH },
  { title: 'No toilet facilities in school for girls', description: 'Our government girls upper primary school has no functional toilet facilities. The single toilet that existed was damaged and has not been repaired for 6 months. Girls are having to go to nearby fields which is unsafe and degrading. The dropout rate among adolescent girls has increased significantly. This is a basic dignity issue that needs immediate resolution through construction or repair of proper toilet facilities.', department: DEPARTMENTS.EDUCATION, priority: PRIORITY_LEVELS.HIGH },

  // Transport
  { title: 'Bus route cancelled leaving village without transport', description: 'The government bus service on Route 47 connecting our village to the district headquarters has been cancelled for the past month without any notice or alternative arrangement. Residents have to walk 8 kilometres to the nearest bus stop. Students, patients, and daily wage workers are severely affected. No private vehicles operate on this route. Please restore the bus service or arrange an alternative.', department: DEPARTMENTS.TRANSPORT, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Auto rickshaw drivers overcharging and refusing meters', description: 'Auto rickshaw drivers in our city are systematically overcharging passengers and refusing to use meters despite the meter being mandatory. Tourists and daily commuters are being exploited. When we complain to drivers, they become aggressive. Complaints made to the RTO office have had no effect. Please conduct regular checks and take strict action against drivers who refuse to use meters.', department: DEPARTMENTS.TRANSPORT, priority: PRIORITY_LEVELS.MEDIUM },
  { title: 'Railway station platform in dangerous condition', description: 'Platform number 2 at our railway station has large cracks and broken sections of the platform surface. Passengers carrying luggage and elderly travellers are at high risk of falling. The overhead shelter roof is also leaking, making the platform unusable during rains. This station serves thousands of passengers daily. Please arrange urgent repair of the platform and shelter before a serious accident occurs.', department: DEPARTMENTS.TRANSPORT, priority: PRIORITY_LEVELS.HIGH },

  // Revenue
  { title: 'Land mutation not processed for 8 months', description: 'I have submitted a land mutation application following my fathers death 8 months ago along with all required documents and fees. Despite multiple visits to the tehsil office, the mutation has not been processed. Officers keep asking for additional documents each time I visit, suggesting deliberate delay. I need the mutation to sell the land for my daughters medical treatment. Please expedite this case urgently.', department: DEPARTMENTS.REVENUE, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Caste certificate not issued despite multiple applications', description: 'I have been applying for an OBC caste certificate for the past 4 months. I have submitted the application three times with all required documents but the certificate has not been issued. My son needs this certificate for college admission. Every time I visit the office, I am asked to come again or submit additional documents. The deadline for college admission is approaching. Please issue the certificate at the earliest.', department: DEPARTMENTS.REVENUE, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Illegal encroachment on government land near my property', description: 'A neighbour has illegally encroached upon government land adjacent to my property and has started construction without any permission. The construction has blocked the common pathway used by 12 families. Despite my complaint to the tehsil and municipality offices, no action has been taken for 2 months. Please send a survey team to verify and take necessary legal action against the encroachment.', department: DEPARTMENTS.REVENUE, priority: PRIORITY_LEVELS.MEDIUM },
  { title: 'Pension not received for 5 months - widow elderly woman', description: 'My 75-year-old widowed mother has not received her government widow pension for the past 5 months. She depends entirely on this pension for her basic needs as I am also a daily wage labourer. We have visited the panchayat and block office multiple times but are given no satisfactory answer. Please investigate the non-payment of pension and ensure it is resumed immediately along with the arrears.', department: DEPARTMENTS.REVENUE, priority: PRIORITY_LEVELS.CRITICAL },

  // Police
  { title: 'Theft complaint filed but no investigation done', description: 'My house was burgled on 15th of last month and valuables worth Rs 1.5 lakh were stolen. I filed an FIR at the local police station the same day. However, despite 3 weeks passing, no investigation has been done, no officer has visited my house, and I have received no update on my case. When I follow up at the station, I am told to wait. Please ensure the investigation is conducted seriously.', department: DEPARTMENTS.POLICE, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Eve teasing and harassment of women in our locality', description: 'A group of 4-5 young men have been regularly harassing and eve-teasing women and girls in our locality for the past 2 months. They target women near the bus stop and market area in the evenings. Several women including my daughter have been verbally abused and followed. We have complained to the local police chowki twice but no action has been taken and the harassment is continuing. Please take strict action.', department: DEPARTMENTS.POLICE, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Illegal liquor shop operating near school', description: 'An illegal liquor shop has been operating openly in a residential area just 100 metres from Government Primary School. The shop has no licence and operates during school hours. Intoxicated men gather near the school gate and harass students and women passing by. Multiple complaints to the local police have been ignored. The operators are reportedly paying bribes. Please conduct a raid and shut down this illegal shop.', department: DEPARTMENTS.POLICE, priority: PRIORITY_LEVELS.HIGH },

  // Other
  { title: 'Stray dogs menacing colony, resident bitten', description: 'A pack of 15-20 aggressive stray dogs has been terrorising our residential colony for the past month. Three residents including an elderly woman and a child have been bitten and required rabies treatment. Residents are afraid to go out for morning walks or let children play outside. Previous complaints to the municipality about dog menace have not resulted in any action. Please arrange for immediate removal and sterilisation of these stray dogs.', department: DEPARTMENTS.OTHER, priority: PRIORITY_LEVELS.HIGH },
  { title: 'Noise pollution from factory causing health problems', description: 'A factory operating in a residential zone near our neighbourhood generates extreme noise pollution 18 hours a day. The noise level is unbearable, causing sleep deprivation, headaches, and anxiety among residents including children. This factory appears to be operating without proper clearances. Several residents have developed hearing problems. Please investigate whether this factory has valid noise clearance and take appropriate action.', department: DEPARTMENTS.OTHER, priority: PRIORITY_LEVELS.MEDIUM },
  { title: 'Park encroached and converted to parking lot', description: 'The public park that served as the only green space for our residential area has been encroached and converted into a private parking lot over the past 3 months. The park benches and play equipment for children have been removed. Residents have no space for recreation and children have lost their play area. The encroachment appears to have been done with political connections. Please restore the park to its original purpose.', department: DEPARTMENTS.OTHER, priority: PRIORITY_LEVELS.MEDIUM },
];

// ── Seeder functions ─────────────────────────────────────────────────────────

const destroyData = async () => {
  await User.deleteMany({});
  await Grievance.deleteMany({});
  console.log('🗑  All data cleared');
};

const importData = async () => {
  // Create admins
  const createdAdmins = await User.create(ADMINS);
  console.log(`✅ ${createdAdmins.length} admin(s) created`);

  // Create officers
  const createdOfficers = await User.create(OFFICERS);
  console.log(`✅ ${createdOfficers.length} officer(s) created`);

  // Create citizens
  const createdCitizens = await User.create(CITIZENS);
  console.log(`✅ ${createdCitizens.length} citizen(s) created`);

  // Create grievances
  const grievanceDocs = GRIEVANCE_TEMPLATES.map((template, idx) => {
    const citizen = createdCitizens[idx % createdCitizens.length];
    const location = UP_LOCATIONS[idx % UP_LOCATIONS.length];

    // Vary status across grievances
    const statuses = Object.values(GRIEVANCE_STATUS);
    const status = statuses[idx % statuses.length];
    const analysisStatuses = ['completed', 'completed', 'completed', 'pending', 'failed'];
    const analysisStatus = analysisStatuses[idx % analysisStatuses.length];

    return {
      ...template,
      submittedBy: citizen._id,
      location: {
        address: location.address,
        district: location.district,
        state: location.state,
        pincode: String(226001 + idx),
        coordinates: {
          type: 'Point',
          coordinates: [
            // Add small random offset so pins don't overlap
            location.coordinates[0] + (Math.random() - 0.5) * 0.1,
            location.coordinates[1] + (Math.random() - 0.5) * 0.1,
          ],
        },
      },
      status,
      aiAnalysis: {
        category: template.department,
        categoryConfidence: 0.75 + Math.random() * 0.24,
        sentiment: ['negative', 'negative', 'negative', 'neutral'][idx % 4],
        sentimentScore: -(0.3 + Math.random() * 0.6),
        urgencyScore: template.priority === PRIORITY_LEVELS.CRITICAL
          ? 0.8 + Math.random() * 0.2
          : template.priority === PRIORITY_LEVELS.HIGH
          ? 0.6 + Math.random() * 0.2
          : 0.3 + Math.random() * 0.3,
        isDuplicate: false,
        analysisStatus,
        analyzedAt: analysisStatus === 'completed' ? new Date() : null,
      },
      statusHistory: [
        {
          status: GRIEVANCE_STATUS.PENDING,
          changedBy: citizen._id,
          note: 'Grievance submitted',
          changedAt: new Date(Date.now() - (40 - idx) * 24 * 60 * 60 * 1000),
        },
        ...(status !== GRIEVANCE_STATUS.PENDING ? [{
          status,
          changedBy: createdOfficers[idx % createdOfficers.length]._id,
          note: `Status updated to ${status}`,
          changedAt: new Date(Date.now() - (20 - idx) * 24 * 60 * 60 * 1000),
        }] : []),
      ],
      createdAt: new Date(Date.now() - (40 - idx) * 24 * 60 * 60 * 1000),
      officialResponse: status === GRIEVANCE_STATUS.RESOLVED
        ? 'Your complaint has been addressed. Please check if the issue is resolved and reach out if any problems persist.'
        : '',
    };
  });

  const created = await Grievance.create(grievanceDocs);
  console.log(`✅ ${created.length} grievance(s) seeded`);

  console.log('\n─────────────────────────────────────────');
  console.log('🌱 Database seeded successfully!\n');
  console.log('Login credentials:');
  console.log('  Admin:    admin@grievance.gov.in     / Admin@1234');
  console.log('  Officer1: officer.water@grievance.gov.in / Officer@1234');
  console.log('  Officer2: officer.roads@grievance.gov.in / Officer@1234');
  console.log('  Citizen:  mohit@example.com          / Citizen@1234');
  console.log('─────────────────────────────────────────\n');
};

// ── Main ─────────────────────────────────────────────────────────────────────

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('📦 MongoDB connected');

    if (process.argv[2] === '--destroy') {
      await destroyData();
    } else {
      await destroyData();
      await importData();
    }
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
    process.exit(0);
  }
};

run();
