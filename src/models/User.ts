export type Match = {
  id: number;
  userId: number;
  matchedUserId: number;
  status: 'pending' | 'accepted' | 'blocked';
  createdAt: string;
};


export type Certification = {
  id: number;
  title: string;
  issuingOrganization: string;
  issueDate: string; 
};

export type Education = {
  id: number;
  degree: string;
  institution: string;
  field: string;
  startYear: string;
  endYear: string;
};

export type Interest = {
  id: number;
  name: string;
};

export type Employment = {
  id: number;
  companyName: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
};

export type Skill = {
  id: number;
  name: string;
};

export type User = {
  id: number;
  username: string;
  name: string;
  role?: string;
  test: boolean;
  location?: string;
  bio?: string;
  profileUrl?: string;
  createdAt: string;
  password: string;
  email: string;
  certifications?: Certification[];
  educationHistory?: Education[];
  interests?: Interest[];
  employmentHistory?: Employment[];
  skills?: Skill[];
  matches?: Match[];
};

export type SafeUser = Omit<User, 'password' | 'test'>;
