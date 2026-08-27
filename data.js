/**
 * Attendance Portal - Student Roster Data
 * Total 70 Student Roll Numbers extracted from portal snapshot
 */

const INITIAL_STUDENTS = [
  // Row 1
  { id: "241FA04035", roll: "241FA04035", name: "Abhishek K.", section: "CSE-A" },
  { id: "241FA04054", roll: "241FA04054", name: "Aditya Verma", section: "CSE-A" },
  { id: "241FA04062", roll: "241FA04062", name: "Akhil Reddy", section: "CSE-A" },
  { id: "241FA04067", roll: "241FA04067", name: "Amrutha Rao", section: "CSE-A" },
  { id: "241FA04083", roll: "241FA04083", name: "Ananya Sharma", section: "CSE-A" },
  { id: "241FA04114", roll: "241FA04114", name: "Ankit Kumar", section: "CSE-A" },

  // Row 2
  { id: "241FA04115", roll: "241FA04115", name: "Aravind Swami", section: "CSE-A" },
  { id: "241FA04124", roll: "241FA04124", name: "Archana P.", section: "CSE-A" },
  { id: "241FA04134", roll: "241FA04134", name: "Ashish Gupta", section: "CSE-A" },
  { id: "241FA04152", roll: "241FA04152", name: "Avinash M.", section: "CSE-A" },
  { id: "241FA04179", roll: "241FA04179", name: "Bala Krishna", section: "CSE-A" },
  { id: "241FA04207", roll: "241FA04207", name: "Bhavana S.", section: "CSE-A" },

  // Row 3
  { id: "241FA04208", roll: "241FA04208", name: "Bhavesh Patel", section: "CSE-A" },
  { id: "241FA04307", roll: "241FA04307", name: "Chaitanya K.", section: "CSE-A" },
  { id: "241FA04357", roll: "241FA04357", name: "Charan Teja", section: "CSE-A" },
  { id: "241FA04361", roll: "241FA04361", name: "Deepak Joshi", section: "CSE-A" },
  { id: "241FA04362", roll: "241FA04362", name: "Deepika R.", section: "CSE-A" },
  { id: "241FA04485", roll: "241FA04485", name: "Dinesh Babu", section: "CSE-A" },

  // Row 4
  { id: "241FA04520", roll: "241FA04520", name: "Divya Sri", section: "CSE-A" },
  { id: "241FA04529", roll: "241FA04529", name: "Ganesh V.", section: "CSE-A" },
  { id: "241FA04540", roll: "241FA04540", name: "Gautam N.", section: "CSE-A" },
  { id: "241FA04546", roll: "241FA04546", name: "Gayathri Devi", section: "CSE-A" },
  { id: "241FA04553", roll: "241FA04553", name: "Harika G.", section: "CSE-A" },
  { id: "241FA04579", roll: "241FA04579", name: "Harish Chandra", section: "CSE-A" },

  // Row 5
  { id: "241FA04585", roll: "241FA04585", name: "Harsha Vardhan", section: "CSE-A" },
  { id: "241FA04591", roll: "241FA04591", name: "Hemanth Roy", section: "CSE-A" },
  { id: "241FA04592", roll: "241FA04592", name: "Himaja K.", section: "CSE-A" },
  { id: "241FA04593", roll: "241FA04593", name: "Indira Priyadarshini", section: "CSE-A" },
  { id: "241FA04598", roll: "241FA04598", name: "Jagadeesh K.", section: "CSE-A" },
  { id: "241FA04612", roll: "241FA04612", name: "Jahnavi M.", section: "CSE-A" },

  // Row 6
  { id: "241FA04621", roll: "241FA04621", name: "Jaswanth S.", section: "CSE-A" },
  { id: "241FA04622", roll: "241FA04622", name: "Jayanth K.", section: "CSE-A" },
  { id: "241FA04623", roll: "241FA04623", name: "Jitendra B.", section: "CSE-A" },
  { id: "241FA04628", roll: "241FA04628", name: "Jyothi Prakash", section: "CSE-A" },
  { id: "241FA04634", roll: "241FA04634", name: "Kalyan Ram", section: "CSE-A" },
  { id: "241FA04675", roll: "241FA04675", name: "Karthik Reddy", section: "CSE-A" },

  // Row 7
  { id: "241FA04692", roll: "241FA04692", name: "Kavya S.", section: "CSE-A" },
  { id: "241FA04789", roll: "241FA04789", name: "Keerthi Priya", section: "CSE-A" },
  { id: "241FA04871", roll: "241FA04871", name: "Kishore Kumar", section: "CSE-A" },
  { id: "241FA04905", roll: "241FA04905", name: "Krishna Mohan", section: "CSE-A" },
  { id: "241FA04908", roll: "241FA04908", name: "Lavanya T.", section: "CSE-A" },
  { id: "241FA04933", roll: "241FA04933", name: "Likhitha R.", section: "CSE-A" },

  // Row 8
  { id: "241FA04935", roll: "241FA04935", name: "Madhav Rao", section: "CSE-A" },
  { id: "241FA04943", roll: "241FA04943", name: "Madhu Sudhan", section: "CSE-A" },
  { id: "241FA04958", roll: "241FA04958", name: "Manoj Kumar", section: "CSE-A" },
  { id: "241FA04959", roll: "241FA04959", name: "Meghana N.", section: "CSE-A" },
  { id: "241FA04964", roll: "241FA04964", name: "Mounika P.", section: "CSE-A" },
  { id: "241FA04965", roll: "241FA04965", name: "Mukesh Reddy", section: "CSE-A" },

  // Row 9
  { id: "241FA04966", roll: "241FA04966", name: "Naga Raju", section: "CSE-A" },
  { id: "241FA04969", roll: "241FA04969", name: "Nandini K.", section: "CSE-A" },
  { id: "241FA04980", roll: "241FA04980", name: "Navaneeth R.", section: "CSE-A" },
  { id: "241FA04981", roll: "241FA04981", name: "Naveen Teja", section: "CSE-A" },
  { id: "241FA04A15", roll: "241FA04A15", name: "Neeraj Gupta", section: "CSE-A" },
  { id: "241FA04A68", roll: "241FA04A68", name: "Nikhil V.", section: "CSE-A" },

  // Row 10
  { id: "241FA04A85", roll: "241FA04A85", name: "Nithya Sri", section: "CSE-A" },
  { id: "241FA04A95", roll: "241FA04A95", name: "Pavan Kalyan", section: "CSE-A" },
  { id: "241FA04A99", roll: "241FA04A99", name: "Poojitha M.", section: "CSE-A" },
  { id: "241FA04B14", roll: "241FA04B14", name: "Pranathi S.", section: "CSE-A" },
  { id: "241FA04B70", roll: "241FA04B70", name: "Prasad Rao", section: "CSE-A" },
  { id: "241FA04B88", roll: "241FA04B88", name: "Prashanth K.", section: "CSE-A" },

  // Row 11
  { id: "241FA04E42", roll: "241FA04E42", name: "Praveen Raj", section: "CSE-A" },
  { id: "241FA04E43", roll: "241FA04E43", name: "Priyanka Roy", section: "CSE-A" },
  { id: "241FA04E56", roll: "241FA04E56", name: "Rahul Dev", section: "CSE-A" },
  { id: "241FA04E71", roll: "241FA04E71", name: "Rajesh Kumar", section: "CSE-A" },
  { id: "241FA04F17", roll: "241FA04F17", name: "Rakesh Sharma", section: "CSE-A" },
  { id: "241FA04F38", roll: "241FA04F38", name: "Ramya Krishna", section: "CSE-A" },

  // Row 12
  { id: "241FA04F76", roll: "241FA04F76", name: "Ravi Shankar", section: "CSE-A" },
  { id: "241FA04F83", roll: "241FA04F83", name: "Reshma Begum", section: "CSE-A" },
  { id: "241FA04F84", roll: "241FA04F84", name: "Rohit Varma", section: "CSE-A" },
  { id: "241FA04F95", roll: "241FA04F95", name: "Sai Charan", section: "CSE-A" }
];

// Snapshot default checked roll numbers matching the image
const SNAPSHOT_CHECKED_IDS = [
  "241FA04124",
  "241FA04208",
  "241FA04485",
  "241FA04540",
  "241FA04579",
  "241FA04592",
  "241FA04628",
  "241FA04789",
  "241FA04905",
  "241FA04958",
  "241FA04966",
  "241FA04980",
  "241FA04A15",
  "241FA04B14",
  "241FA04E43",
  "241FA04F17"
];

const DEFAULT_SETTINGS = {
  institution: "VFSTR - Department of Computer Science & Engineering",
  courseCode: "21CS204",
  courseName: "Design & Analysis of Algorithms",
  academicYear: "2026-2027",
  semester: "IV Semester",
  section: "CSE - Section A",
  facultyName: "Dr. K. Srinivas",
  soundEnabled: true,
  theme: "dark"
};
