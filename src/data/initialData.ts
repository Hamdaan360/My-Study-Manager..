import { AppStateData } from '../types';

export const INITIAL_DATA: AppStateData = {
  studentName: 'Hamdaan',
  targetGpa: '9.8 / 10 CGPA (Top Department Rank)',
  universityName: 'School of Science & Computer Engineering',
  theme: 'dark', // 'dark' (Original), 'blue' (Royal Blue), 'white' (Clean White)
  dailyReminderEnabled: true,
  reminderTime: '08:00',
  goals: {
    dailyTargetHours: 5.0,
    dailyTasksTarget: 5,
    weeklyTargetHours: 30,
    streakCount: 0, // Starts at 0 as requested
    longestStreak: 0,
    lastActiveDate: '',
  },
  categories: [
    // 1. Physics
    {
      id: 'sub-physics',
      type: 'subject',
      name: 'Physics',
      code: 'PHYS-101',
      color: '#0ea5e9', // Sky Cyan
      accentColor: 'rgba(14, 165, 233, 0.2)',
      icon: 'Atom',
      creditHours: 4,
      targetGrade: 'A+',
      professorOrLead: 'Dr. R. K. Sharma',
      syllabusProgress: 0,
      roomOrLocation: 'Newton Hall 201',
      notes: 'Quantum Mechanics, Wave Optics, Laser and Fiber Optics.',
      chapters: [
        { id: 'ch-ph-1', subjectId: 'sub-physics', chapterNumber: 1, title: 'Wave Optics: Interference & Diffraction', status: 'not_started', keyTopics: ['Fresnel Biprism', 'Newton Rings', 'Fraunhofer Diffraction'], revisionCount: 0 },
        { id: 'ch-ph-2', subjectId: 'sub-physics', chapterNumber: 2, title: 'Lasers & Fiber Optics Principles', status: 'not_started', keyTopics: ['Einstein Coefficients', 'He-Ne Laser', 'Total Internal Reflection', 'Numerical Aperture'], revisionCount: 0 },
        { id: 'ch-ph-3', subjectId: 'sub-physics', chapterNumber: 3, title: 'Quantum Mechanics & Wave Packets', status: 'not_started', keyTopics: ['De-Broglie Hypothesis', 'Schrodinger Wave Equation', 'Particle in 1D Box'], revisionCount: 0 },
        { id: 'ch-ph-4', subjectId: 'sub-physics', chapterNumber: 4, title: 'Semiconductor Physics & Band Theory', status: 'not_started', keyTopics: ['Fermi-Dirac Distribution', 'Hall Effect', 'Carrier Concentration'], revisionCount: 0 },
        { id: 'ch-ph-5', subjectId: 'sub-physics', chapterNumber: 5, title: 'Electromagnetic Field Theory', status: 'not_started', keyTopics: ['Maxwell Equations', 'Poynting Vector', 'EM Wave Propagation'], revisionCount: 0 },
      ]
    },
    // 2. Mathematics 1
    {
      id: 'sub-maths-1',
      type: 'subject',
      name: 'Mathematics 1',
      code: 'MATH-101',
      color: '#6366f1', // Indigo
      accentColor: 'rgba(99, 102, 241, 0.2)',
      icon: 'Sigma',
      creditHours: 4,
      targetGrade: 'A+',
      professorOrLead: 'Prof. Ananya Sen',
      syllabusProgress: 0,
      roomOrLocation: 'Ramanujan Block 104',
      notes: 'Differential Calculus, Partial Differentiation, Matrices & Linear Algebra.',
      chapters: [
        { id: 'ch-m1-1', subjectId: 'sub-maths-1', chapterNumber: 1, title: 'Differential Calculus & Successive Differentiation', status: 'not_started', keyTopics: ['Leibnitz Theorem', 'Maclaurin & Taylor Series', 'Indeterminate Forms'], revisionCount: 0 },
        { id: 'ch-m1-2', subjectId: 'sub-maths-1', chapterNumber: 2, title: 'Partial Differentiation & Jacobians', status: 'not_started', keyTopics: ['Euler Theorem on Homogeneous Functions', 'Total Derivatives', 'Maxima and Minima of Two Variables'], revisionCount: 0 },
        { id: 'ch-m1-3', subjectId: 'sub-maths-1', chapterNumber: 3, title: 'Matrices, Rank & Linear Equations', status: 'not_started', keyTopics: ['Echelon Form', 'Gauss Elimination Method', 'Consistency of Systems'], revisionCount: 0 },
        { id: 'ch-m1-4', subjectId: 'sub-maths-1', chapterNumber: 4, title: 'Eigenvalues & Cayley-Hamilton Theorem', status: 'not_started', keyTopics: ['Characteristic Polynomial', 'Diagonalization', 'Quadratic Forms Reduction'], revisionCount: 0 },
      ]
    },
    // 3. Mathematics 2
    {
      id: 'sub-maths-2',
      type: 'subject',
      name: 'Mathematics 2',
      code: 'MATH-102',
      color: '#8b5cf6', // Violet
      accentColor: 'rgba(139, 92, 246, 0.2)',
      icon: 'Binary',
      creditHours: 4,
      targetGrade: 'A+',
      professorOrLead: 'Dr. Vikram Malhotra',
      syllabusProgress: 0,
      roomOrLocation: 'Ramanujan Block 105',
      notes: 'Multiple Integrals, Vector Calculus, ODEs, Laplace Transforms.',
      chapters: [
        { id: 'ch-m2-1', subjectId: 'sub-maths-2', chapterNumber: 1, title: 'Multiple Integrals & Polar Transformations', status: 'not_started', keyTopics: ['Double & Triple Integrals', 'Change of Variables', 'Surface Area & Volume'], revisionCount: 0 },
        { id: 'ch-m2-2', subjectId: 'sub-maths-2', chapterNumber: 2, title: 'Vector Calculus: Divergence & Theorems', status: 'not_started', keyTopics: ['Gradient, Curl & Divergence', 'Green Theorem', 'Stokes Theorem', 'Gauss Divergence Theorem'], revisionCount: 0 },
        { id: 'ch-m2-3', subjectId: 'sub-maths-2', chapterNumber: 3, title: 'Ordinary Differential Equations of First Order', status: 'not_started', keyTopics: ['Exact Differential Equations', 'Integrating Factors', 'Linear & Bernoulli Equations'], revisionCount: 0 },
        { id: 'ch-m2-4', subjectId: 'sub-maths-2', chapterNumber: 4, title: 'Higher Order Linear Differential Equations', status: 'not_started', keyTopics: ['Complementary Functions', 'Particular Integrals', 'Method of Variation of Parameters'], revisionCount: 0 },
        { id: 'ch-m2-5', subjectId: 'sub-maths-2', chapterNumber: 5, title: 'Laplace Transforms & Inverse Transforms', status: 'not_started', keyTopics: ['Standard Formulas', 'First & Second Shifting Theorems', 'Solving ODEs with Laplace'], revisionCount: 0 },
      ]
    },
    // 4. Chemistry
    {
      id: 'sub-chemistry',
      type: 'subject',
      name: 'Chemistry',
      code: 'CHEM-101',
      color: '#ec4899', // Pink / Rose
      accentColor: 'rgba(236, 72, 153, 0.2)',
      icon: 'FlaskConical',
      creditHours: 4,
      targetGrade: 'A',
      professorOrLead: 'Dr. Meenakshi Rao',
      syllabusProgress: 0,
      roomOrLocation: 'Bhabha Chemistry Wing',
      notes: 'Chemical Thermodynamics, Electrochemistry, Polymers, Spectroscopy.',
      chapters: [
        { id: 'ch-ch-1', subjectId: 'sub-chemistry', chapterNumber: 1, title: 'Chemical Thermodynamics & Free Energy', status: 'not_started', keyTopics: ['Entropy', 'Helmholtz and Gibbs Functions', 'Clausius-Clapeyron Equation'], revisionCount: 0 },
        { id: 'ch-ch-2', subjectId: 'sub-chemistry', chapterNumber: 2, title: 'Electrochemistry & Corrosion Engineering', status: 'not_started', keyTopics: ['Nernst Equation', 'Electrode Potential', 'Dry and Wet Corrosion Mechanisms'], revisionCount: 0 },
        { id: 'ch-ch-3', subjectId: 'sub-chemistry', chapterNumber: 3, title: 'Polymers & Advanced Materials', status: 'not_started', keyTopics: ['Classification of Polymers', 'Thermosetting vs Thermoplastic', 'Conducting Polymers'], revisionCount: 0 },
        { id: 'ch-ch-4', subjectId: 'sub-chemistry', chapterNumber: 4, title: 'Spectroscopic Techniques (UV-Vis & IR)', status: 'not_started', keyTopics: ['Beer-Lambert Law', 'Chromophores & Auxochromes', 'Vibrational Modes in IR'], revisionCount: 0 },
        { id: 'ch-ch-5', subjectId: 'sub-chemistry', chapterNumber: 5, title: 'Water Technology & Hardness Treatment', status: 'not_started', keyTopics: ['EDTA Titration', 'Zeolite & Ion-Exchange Methods', 'Reverse Osmosis (RO)'], revisionCount: 0 },
      ]
    },
    // 5. Computer Science 1
    {
      id: 'sub-cs-1',
      type: 'subject',
      name: 'Computer Science 1',
      code: 'CS-101',
      color: '#10b981', // Emerald
      accentColor: 'rgba(16, 185, 129, 0.2)',
      icon: 'Code2',
      creditHours: 4,
      targetGrade: 'A+',
      professorOrLead: 'Prof. Hamza Qureshi',
      syllabusProgress: 0,
      roomOrLocation: 'Turing Computer Lab A',
      notes: 'Structured Programming in C/C++, Logic Flow, Pointers, Dynamic Memory Allocation.',
      chapters: [
        { id: 'ch-cs1-1', subjectId: 'sub-cs-1', chapterNumber: 1, title: 'Problem Solving & Algorithm Design', status: 'not_started', keyTopics: ['Flowcharts', 'Pseudocode', 'Structured Programming Principles'], revisionCount: 0 },
        { id: 'ch-cs1-2', subjectId: 'sub-cs-1', chapterNumber: 2, title: 'C++ Syntax, Control Flow & Functions', status: 'not_started', keyTopics: ['Conditional Branching', 'Loops (for/while/do-while)', 'Recursion vs Iteration'], revisionCount: 0 },
        { id: 'ch-cs1-3', subjectId: 'sub-cs-1', chapterNumber: 3, title: 'Arrays, Strings & Modular Coding', status: 'not_started', keyTopics: ['1D and 2D Arrays', 'String Manipulation', 'Passing Arrays to Functions'], revisionCount: 0 },
        { id: 'ch-cs1-4', subjectId: 'sub-cs-1', chapterNumber: 4, title: 'Pointers & Dynamic Memory Allocation', status: 'not_started', keyTopics: ['Pointer Arithmetic', 'new and delete operators', 'Dangling Pointers and Memory Leaks'], revisionCount: 0 },
        { id: 'ch-cs1-5', subjectId: 'sub-cs-1', chapterNumber: 5, title: 'Structures, Unions & File I/O Streams', status: 'not_started', keyTopics: ['fstream', 'File Reading/Writing', 'Binary File Operations'], revisionCount: 0 },
      ]
    },
    // 6. Computer Science 2
    {
      id: 'sub-cs-2',
      type: 'subject',
      name: 'Computer Science 2',
      code: 'CS-102',
      color: '#14b8a6', // Teal
      accentColor: 'rgba(20, 184, 166, 0.2)',
      icon: 'Cpu',
      creditHours: 4,
      targetGrade: 'A+',
      professorOrLead: 'Dr. David Foster',
      syllabusProgress: 0,
      roomOrLocation: 'Turing Computer Lab B',
      notes: 'Object Oriented Programming (OOP), Data Structures (Stacks, Queues, Linked Lists, Trees).',
      chapters: [
        { id: 'ch-cs2-1', subjectId: 'sub-cs-2', chapterNumber: 1, title: 'OOP Principles: Classes & Encapsulation', status: 'not_started', keyTopics: ['Constructors & Destructors', 'Access Specifiers', 'Friend Functions'], revisionCount: 0 },
        { id: 'ch-cs2-2', subjectId: 'sub-cs-2', chapterNumber: 2, title: 'Inheritance, Polymorphism & Templates', status: 'not_started', keyTopics: ['Virtual Functions', 'Abstract Classes', 'Template Classes & STL Basics'], revisionCount: 0 },
        { id: 'ch-cs2-3', subjectId: 'sub-cs-2', chapterNumber: 3, title: 'Linear Data Structures: Stacks & Queues', status: 'not_started', keyTopics: ['Stack LIFO Operations', 'Infix to Postfix Conversion', 'Circular Queue & Deque'], revisionCount: 0 },
        { id: 'ch-cs2-4', subjectId: 'sub-cs-2', chapterNumber: 4, title: 'Linked Lists Implementation', status: 'not_started', keyTopics: ['Singly Linked List', 'Doubly Linked List', 'Circular Linked List Operations'], revisionCount: 0 },
        { id: 'ch-cs2-5', subjectId: 'sub-cs-2', chapterNumber: 5, title: 'Trees, Graphs & Complexity Analysis', status: 'not_started', keyTopics: ['Binary Search Tree (BST)', 'Tree Traversals (Inorder/Pre/Post)', 'Big-O Notation'], revisionCount: 0 },
      ]
    },
    // 7. English
    {
      id: 'sub-english',
      type: 'subject',
      name: 'English',
      code: 'ENG-101',
      color: '#f59e0b', // Amber
      accentColor: 'rgba(245, 158, 11, 0.2)',
      icon: 'BookOpen',
      creditHours: 3,
      targetGrade: 'A',
      professorOrLead: 'Prof. Patricia Moore',
      syllabusProgress: 0,
      roomOrLocation: 'Humanities Hall 3',
      notes: 'Technical Writing, Business Correspondence, Presentation Skills.',
      chapters: [
        { id: 'ch-eng-1', subjectId: 'sub-english', chapterNumber: 1, title: 'Technical Writing & Project Reports', status: 'not_started', keyTopics: ['Abstract Drafting', 'Research Methodology Layout', 'Citations and References'], revisionCount: 0 },
        { id: 'ch-eng-2', subjectId: 'sub-english', chapterNumber: 2, title: 'Grammar, Syntax & Phonetics', status: 'not_started', keyTopics: ['Subject-Verb Concord', 'Active and Passive Voice', 'IPA Transcription & Pronunciation'], revisionCount: 0 },
        { id: 'ch-eng-3', subjectId: 'sub-english', chapterNumber: 3, title: 'Business Correspondence & Email Etiquette', status: 'not_started', keyTopics: ['Formal Cover Letters', 'Resume Building', 'Official Memos & Enquiries'], revisionCount: 0 },
        { id: 'ch-eng-4', subjectId: 'sub-english', chapterNumber: 4, title: 'Oral Communication & Group Discussions', status: 'not_started', keyTopics: ['Persuasive Speaking', 'Body Language in Interviews', 'Negotiation Skills'], revisionCount: 0 },
      ]
    },
    // 8. EVS (Environmental Studies)
    {
      id: 'sub-evs',
      type: 'subject',
      name: 'EVS',
      code: 'EVS-101',
      color: '#84cc16', // Lime / Green
      accentColor: 'rgba(132, 204, 22, 0.2)',
      icon: 'Leaf',
      creditHours: 2,
      targetGrade: 'A+',
      professorOrLead: 'Dr. S. K. Joshi',
      syllabusProgress: 0,
      roomOrLocation: 'Science Seminar Room',
      notes: 'Ecosystem Dynamics, Biodiversity, Environmental Pollution, Climate Initiatives.',
      chapters: [
        { id: 'ch-evs-1', subjectId: 'sub-evs', chapterNumber: 1, title: 'Ecosystem Dynamics & Biodiversity', status: 'not_started', keyTopics: ['Food Chains and Trophic Levels', 'Ecological Pyramids', 'Hotspots of Biodiversity'], revisionCount: 0 },
        { id: 'ch-evs-2', subjectId: 'sub-evs', chapterNumber: 2, title: 'Natural Resources & Renewable Energy', status: 'not_started', keyTopics: ['Solar and Wind Potential', 'Groundwater Depletion', 'Deforestation Impacts'], revisionCount: 0 },
        { id: 'ch-evs-3', subjectId: 'sub-evs', chapterNumber: 3, title: 'Environmental Pollution & Solid Waste Management', status: 'not_started', keyTopics: ['Air & Water Quality Index', 'Hazardous E-Waste Recycling', 'Effluent Treatment Plants'], revisionCount: 0 },
        { id: 'ch-evs-4', subjectId: 'sub-evs', chapterNumber: 4, title: 'Global Climate Change & Sustainable Development', status: 'not_started', keyTopics: ['UN Sustainable Development Goals (SDGs)', 'Carbon Footprint Reduction', 'Paris Climate Agreement'], revisionCount: 0 },
      ]
    },
    // College Responsibilities
    {
      id: 'col-lab-duties',
      type: 'college',
      name: 'Engineering Laboratory Submissions',
      code: 'LAB-REPORTS',
      color: '#06b6d4', // Cyan
      accentColor: 'rgba(6, 182, 212, 0.2)',
      icon: 'FileSpreadsheet',
      professorOrLead: 'Head of Lab Instructors',
      syllabusProgress: 0,
      roomOrLocation: 'Central Engineering Labs',
      notes: 'Weekly viva preparation, physical lab journal records, graph plotting.',
      chapters: [
        { id: 'ch-lab-1', subjectId: 'col-lab-duties', chapterNumber: 1, title: 'Physics Lab Experiments & Journal', status: 'not_started', keyTopics: ['Spectrometer Readings', 'Newton Rings Experiment', 'Fiber Numerical Aperture'], revisionCount: 0 },
        { id: 'ch-lab-2', subjectId: 'col-lab-duties', chapterNumber: 2, title: 'Chemistry Lab Titrations & Analysis', status: 'not_started', keyTopics: ['Hardness of Water by EDTA', 'Conductometric Titration', 'Viscometer Calibration'], revisionCount: 0 },
        { id: 'ch-lab-3', subjectId: 'col-lab-duties', chapterNumber: 3, title: 'Computer Programming Practical Submissions', status: 'not_started', keyTopics: ['C++ Data Structures Lab Programs', 'GDB Debugging Logs', 'Code Viva Preparation'], revisionCount: 0 },
      ]
    },
    {
      id: 'col-council',
      type: 'college',
      name: 'Student Academic Council',
      code: 'COUNCIL',
      color: '#f43f5e', // Rose
      accentColor: 'rgba(244, 63, 94, 0.2)',
      icon: 'ShieldCheck',
      professorOrLead: 'Dean of Student Welfare',
      syllabusProgress: 0,
      roomOrLocation: 'Student Union Secretariat',
      notes: 'Department student representative, coordinating syllabus paces and student affairs.',
      chapters: [
        { id: 'ch-cou-1', subjectId: 'col-council', chapterNumber: 1, title: 'Academic Grievances & Curriculum Feedback', status: 'not_started', keyTopics: ['Midterm Schedule Review', 'Lab Equipment Requisitions'], revisionCount: 0 },
        { id: 'ch-cou-2', subjectId: 'col-council', chapterNumber: 2, title: 'Department Seminar & Hackathon Coordination', status: 'not_started', keyTopics: ['Guest Speaker Logistics', 'Student Participation Drives'], revisionCount: 0 },
      ]
    },
  ],
  tasks: [], // Empty for Hamdaan to enter his tasks
  assignments: [], // Empty for Hamdaan to enter his assignments
  sessions: [], // Fresh start
  attendance: [
    { subjectId: 'sub-physics', totalClasses: 22, attendedClasses: 20, minimumTargetPercent: 75 },
    { subjectId: 'sub-maths-1', totalClasses: 24, attendedClasses: 22, minimumTargetPercent: 75 },
    { subjectId: 'sub-maths-2', totalClasses: 20, attendedClasses: 18, minimumTargetPercent: 75 },
    { subjectId: 'sub-chemistry', totalClasses: 18, attendedClasses: 16, minimumTargetPercent: 75 },
    { subjectId: 'sub-cs-1', totalClasses: 25, attendedClasses: 23, minimumTargetPercent: 75 },
    { subjectId: 'sub-cs-2', totalClasses: 22, attendedClasses: 21, minimumTargetPercent: 75 },
    { subjectId: 'sub-english', totalClasses: 16, attendedClasses: 14, minimumTargetPercent: 75 },
    { subjectId: 'sub-evs', totalClasses: 14, attendedClasses: 13, minimumTargetPercent: 75 },
    { subjectId: 'col-lab-duties', totalClasses: 10, attendedClasses: 9, minimumTargetPercent: 75 }
  ],
  attendanceLogs: [],
  collegeTimetable: [
    // Monday
    { id: 'tt-mon-1', day: 'Monday', startTime: '09:00', endTime: '10:00', subjectId: 'sub-physics', subjectName: 'Physics', roomOrLocation: 'Hall 201', type: 'lecture', professor: 'Dr. R. K. Sharma' },
    { id: 'tt-mon-2', day: 'Monday', startTime: '10:00', endTime: '11:00', subjectId: 'sub-maths-1', subjectName: 'Mathematics 1', roomOrLocation: 'Ramanujan 104', type: 'lecture', professor: 'Prof. Ananya Sen' },
    { id: 'tt-mon-3', day: 'Monday', startTime: '11:15', endTime: '12:15', subjectId: 'sub-cs-1', subjectName: 'Computer Science 1', roomOrLocation: 'Turing Lab A', type: 'lecture', professor: 'Prof. Hamza Qureshi' },
    { id: 'tt-mon-4', day: 'Monday', startTime: '13:00', endTime: '15:00', subjectId: 'col-lab-duties', subjectName: 'Physics Practical Lab', roomOrLocation: 'Lab Wing 2', type: 'lab', professor: 'Dr. Sharma' },
    
    // Tuesday
    { id: 'tt-tue-1', day: 'Tuesday', startTime: '09:00', endTime: '10:00', subjectId: 'sub-chemistry', subjectName: 'Chemistry', roomOrLocation: 'Bhabha Wing', type: 'lecture', professor: 'Dr. Meenakshi Rao' },
    { id: 'tt-tue-2', day: 'Tuesday', startTime: '10:00', endTime: '11:00', subjectId: 'sub-maths-2', subjectName: 'Mathematics 2', roomOrLocation: 'Ramanujan 105', type: 'lecture', professor: 'Dr. Vikram Malhotra' },
    { id: 'tt-tue-3', day: 'Tuesday', startTime: '11:15', endTime: '12:15', subjectId: 'sub-cs-2', subjectName: 'Computer Science 2', roomOrLocation: 'Turing Lab B', type: 'lecture', professor: 'Dr. Foster' },
    { id: 'tt-tue-4', day: 'Tuesday', startTime: '13:00', endTime: '15:00', subjectId: 'col-lab-duties', subjectName: 'CS Programming Practical', roomOrLocation: 'Computing Lab 3', type: 'lab', professor: 'Prof. Qureshi' },

    // Wednesday
    { id: 'tt-wed-1', day: 'Wednesday', startTime: '09:00', endTime: '10:00', subjectId: 'sub-physics', subjectName: 'Physics', roomOrLocation: 'Hall 201', type: 'lecture', professor: 'Dr. R. K. Sharma' },
    { id: 'tt-wed-2', day: 'Wednesday', startTime: '10:00', endTime: '11:00', subjectId: 'sub-maths-1', subjectName: 'Mathematics 1', roomOrLocation: 'Ramanujan 104', type: 'lecture', professor: 'Prof. Ananya Sen' },
    { id: 'tt-wed-3', day: 'Wednesday', startTime: '11:15', endTime: '12:15', subjectId: 'sub-english', subjectName: 'English & Technical Writing', roomOrLocation: 'Humanities 3', type: 'lecture', professor: 'Prof. Patricia Moore' },
    { id: 'tt-wed-4', day: 'Wednesday', startTime: '13:00', endTime: '14:30', subjectId: 'sub-evs', subjectName: 'Environmental Studies', roomOrLocation: 'Science Seminar', type: 'lecture', professor: 'Dr. S. K. Joshi' },

    // Thursday
    { id: 'tt-thu-1', day: 'Thursday', startTime: '09:00', endTime: '10:00', subjectId: 'sub-chemistry', subjectName: 'Chemistry', roomOrLocation: 'Bhabha Wing', type: 'lecture', professor: 'Dr. Meenakshi Rao' },
    { id: 'tt-thu-2', day: 'Thursday', startTime: '10:00', endTime: '11:00', subjectId: 'sub-maths-2', subjectName: 'Mathematics 2', roomOrLocation: 'Ramanujan 105', type: 'lecture', professor: 'Dr. Vikram Malhotra' },
    { id: 'tt-thu-3', day: 'Thursday', startTime: '11:15', endTime: '12:15', subjectId: 'sub-cs-1', subjectName: 'Computer Science 1', roomOrLocation: 'Turing Lab A', type: 'lecture', professor: 'Prof. Hamza Qureshi' },
    { id: 'tt-thu-4', day: 'Thursday', startTime: '13:00', endTime: '15:00', subjectId: 'col-lab-duties', subjectName: 'Chemistry Practical Lab', roomOrLocation: 'Central Labs', type: 'lab', professor: 'Dr. Rao' },

    // Friday
    { id: 'tt-fri-1', day: 'Friday', startTime: '09:00', endTime: '10:00', subjectId: 'sub-cs-2', subjectName: 'Computer Science 2 (OOP & Data Structures)', roomOrLocation: 'Turing Lab B', type: 'lecture', professor: 'Dr. David Foster' },
    { id: 'tt-fri-2', day: 'Friday', startTime: '10:00', endTime: '11:00', subjectId: 'sub-english', subjectName: 'English Communication', roomOrLocation: 'Humanities 3', type: 'lecture', professor: 'Prof. Patricia Moore' },
    { id: 'tt-fri-3', day: 'Friday', startTime: '11:15', endTime: '12:15', subjectId: 'sub-evs', subjectName: 'EVS & Green Initiatives', roomOrLocation: 'Science Seminar', type: 'lecture', professor: 'Dr. S. K. Joshi' },
    { id: 'tt-fri-4', day: 'Friday', startTime: '14:00', endTime: '16:00', subjectId: 'col-council', subjectName: 'Student Council Meeting / Office Hours', roomOrLocation: 'Student Union Secretariat', type: 'tutorial', professor: 'Dean Office' },
  ],
  dayRoutine: [
    { id: 'dr-1', startTime: '06:30', endTime: '07:30', title: 'Morning Routine, Hydration & Nutritious Breakfast', activityType: 'routine', notes: 'Wake up fresh, morning stretching, prepare day mindset' },
    { id: 'dr-2', startTime: '07:30', endTime: '08:30', title: 'Daily Goal Review & Quick Formula Revision', activityType: 'revision', subjectId: 'sub-maths-1', notes: 'Review formula sheets and daily AI focus plan' },
    { id: 'dr-3', startTime: '09:00', endTime: '16:30', title: 'College Lectures, Engineering Labs & Practical Classes', activityType: 'college', notes: 'Stay active in lectures, mark attendance, note lab tasks' },
    { id: 'dr-4', startTime: '17:00', endTime: '18:00', title: 'Physical Workout / Fresh Air Jogging Break', activityType: 'exercise', notes: 'Mental reset and physical energy recharge' },
    { id: 'dr-5', startTime: '18:00', endTime: '19:45', title: 'Deep Focus Study Block 1: Problem Solving & Numerical Practice', activityType: 'study', subjectId: 'sub-physics', notes: 'Solve chapter problems and exercises without distraction' },
    { id: 'dr-6', startTime: '19:45', endTime: '20:30', title: 'Dinner, Family Time & Short Walk Break', activityType: 'break', notes: 'Eat clean meal and relax screen-free' },
    { id: 'dr-7', startTime: '20:30', endTime: '22:15', title: 'Deep Focus Study Block 2: Programming / Coding & Core Theory', activityType: 'study', subjectId: 'sub-cs-1', notes: 'Code DSA assignments and write clean documentation' },
    { id: 'dr-8', startTime: '22:15', endTime: '22:45', title: 'Daily Review, Habit Logging & Next Day Prep', activityType: 'routine', notes: 'Update streak, verify tomorrow timetable, set alarm' },
    { id: 'dr-9', startTime: '23:00', endTime: '06:30', title: 'Restorative Sleep & Recovery (7.5 Hours)', activityType: 'routine', notes: 'Deep sleep for memory consolidation and sharp focus' }
  ]
};
